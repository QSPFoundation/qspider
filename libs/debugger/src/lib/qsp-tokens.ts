// @ts-expect-error The editor core ships no typings; it is cast to the public API below.
import * as editorCore from 'monaco-editor/esm/vs/editor/edcore.main';
import type * as Monaco from 'monaco-editor';

const monaco = editorCore as unknown as typeof Monaco;

export interface LineToken {
  offset: number;
  type: string;
}

/** What a hover reads: the base name, the literal-or-not text of its `[…]`, and the field texts as written. */
export interface HoverTarget {
  name: string;
  indexText?: string;
  /** Field texts as written (`B`, `$NAME`, `'some field'`), up to and including the hovered segment. */
  fields: string[];
}

interface TokenModel {
  getValue(): string;
  getVersionId(): number;
  uri: { toString(): string };
}

const MAX_CACHED_MODELS = 4;
const cache = new Map<string, { version: number; lines: LineToken[][] }>();

/**
 * The tokens of one line, from tokenizing the model's whole text (so a string or comment that began on an earlier
 * line is read in its state). The whole text is tokenized once per model version.
 */
export function qspLineTokens(model: TokenModel, line: number, languageId: string): LineToken[] {
  const key = `${languageId}:${model.uri.toString()}`;
  const version = model.getVersionId();
  let entry = cache.get(key);
  if (entry?.version !== version) {
    entry = { version, lines: monaco.editor.tokenize(model.getValue(), languageId) };
    cache.delete(key);
    cache.set(key, entry);
    while (cache.size > MAX_CACHED_MODELS) cache.delete(cache.keys().next().value as string);
  }
  return entry.lines[line - 1] ?? [];
}

/** The text inside the `[...]` that follows `from` in `line` (to the end of the line when it is not closed). */
function bracketText(line: string, from: number): string | undefined {
  if (line[from] !== '[') return undefined;
  let depth = 0;
  let quote: string | null = null;
  for (let i = from; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === "'" || ch === '"') {
      quote = ch;
    } else if (ch === '[') {
      depth++;
    } else if (ch === ']' && --depth === 0) {
      return line.slice(from + 1, i);
    }
  }
  return line.slice(from + 1);
}

/** Monaco appends the language id to a token type (`identifier.qsp`). */
const kind = (token: LineToken | undefined): string => token?.type.replace(/\.[a-z-]+$/, '') ?? '';

/**
 * The path segment under `column` (0-based; the caret just after a word counts) and what lies left of it: the
 * `.field` parts, one `[…]` and the base name. Null when the token is not a variable, an identifier, or a string
 * right after a `.`.
 */
export function hoverTargetAt(
  line: string,
  tokens: LineToken[],
  column: number,
): { target: HoverTarget; start: number; end: number } | null {
  const endOf = (n: number) => tokens[n + 1]?.offset ?? line.length;
  const textOf = (n: number) => line.slice(tokens[n].offset, endOf(n));
  const isDot = (n: number) => n >= 0 && kind(tokens[n]) === 'delimiter' && textOf(n) === '.';
  const isName = (n: number) => /^(variable|identifier)/.test(kind(tokens[n]));
  const isFieldAt = (n: number) => isDot(n - 1) && (isName(n) || kind(tokens[n]) === 'string');

  for (const at of [column, column - 1]) {
    let i = -1;
    tokens.forEach((token, n) => {
      if (token.offset <= at) i = n;
    });
    if (i < 0 || at < 0 || at >= endOf(i)) continue;
    if (!isName(i) && !isFieldAt(i)) continue;
    const fields: string[] = [];
    let indexText: string | undefined;
    let cur = i;
    while (isFieldAt(cur)) {
      fields.unshift(textOf(cur));
      cur -= 2;
      if (cur >= 0 && textOf(cur) === ']' && kind(tokens[cur]) === 'delimiter.bracket') {
        let depth = 0;
        let open = cur;
        for (; open >= 0; open--) {
          if (kind(tokens[open]) !== 'delimiter.bracket') continue;
          depth += textOf(open) === ']' ? 1 : textOf(open) === '[' ? -1 : 0;
          if (depth === 0) break;
        }
        if (open < 1) return null;
        indexText = line.slice(tokens[open].offset + 1, tokens[cur].offset);
        cur = open - 1;
        if (!isName(cur) || isFieldAt(cur)) return null;
      }
    }
    if (cur < 0 || !isName(cur)) return null;
    if (fields.length === 0) indexText = bracketText(line, endOf(cur));
    return { target: { name: textOf(cur), indexText, fields }, start: tokens[i].offset, end: endOf(i) };
  }
  return null;
}
