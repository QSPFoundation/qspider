import type * as Monaco from 'monaco-editor';
import { hoverReadPlan, readHover, watchActions } from '@qspider/game-state';
import { qspLanguageDefinition } from './qsp-language';

const PIN_COMMAND = 'qsp.debugger.pinVariable';

const KEYWORDS = new Set((qspLanguageDefinition.keywords as string[]).map((word) => word.toLowerCase()));
const isKeyword = (word: string): boolean => KEYWORDS.has(word.toLowerCase());

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

/** A line as markdown inline code, so names, brackets and quotes show as written. */
function code(text: string): string {
  const fence = text.includes('`') ? '``' : '`';
  return `${fence}${text.includes('`') ? ` ${text} ` : text}${fence}`;
}

/**
 * Hover values of QSP variables: the token under the cursor (by the model's tokenization: `variable` tokens, and
 * identifiers that are not keywords) is read with the engine's `readVariable*`, which never runs engine code.
 * A Pin link adds the variable to the watch list.
 */
export function registerQspHover(monaco: typeof Monaco): void {
  monaco.editor.registerCommand(PIN_COMMAND, (_accessor, name: unknown) => {
    if (typeof name === 'string') watchActions.add(name);
  });

  monaco.languages.registerHoverProvider('qsp', {
    provideHover(model, position) {
      const line = model.getLineContent(position.lineNumber);
      const tokens = monaco.editor.tokenize(line, 'qsp')[0] ?? [];
      const at = position.column - 1;
      // The caret may stand just after a word (a click on its last letter puts it there, "Show Hover" reads it).
      const found = [at, at - 1]
        .map((column) => {
          let i = -1;
          tokens.forEach((token, n) => {
            if (token.offset <= column) i = n;
          });
          if (i < 0 || column < 0) return null;
          const start = tokens[i].offset;
          const end = tokens[i + 1]?.offset ?? line.length;
          const type = tokens[i].type;
          const isName = type.startsWith('variable') || type.startsWith('identifier');
          return column < end && isName ? { start, end } : null;
        })
        .find((candidate) => candidate !== null);
      if (!found) return null;
      const { start, end } = found;
      const word = line.slice(start, end);
      const plan = hoverReadPlan(word, bracketText(line, end), isKeyword);
      const { lines, pinName } = readHover(plan);
      if (lines.length === 0) return null;
      const body = lines.map(code).join('\n\n');
      const pin = pinName
        ? `\n\n[Pin](command:${PIN_COMMAND}?${encodeURIComponent(JSON.stringify([pinName]))} "Add to the watch list")`
        : '';
      return {
        range: new monaco.Range(position.lineNumber, start + 1, position.lineNumber, end + 1),
        contents: [{ value: body + pin, isTrusted: true }],
      };
    },
  });
}
