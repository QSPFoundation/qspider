import type { QspTuple, QspVariableKey, QspVariableValue } from '@qsp/wasm-engine';
import { indexText, showValue } from './debug-watch-logic';
import { isDynamicKey, parseQspPath, QSP_NAME, splitParts, parseLiteral, type QspField } from './qsp-path';
import { isTuple, sameValue } from './variable-logic';

/** Most items of an array a hover summary lists. */
export const HOVER_SUMMARY_ITEMS = 5;

/** What a hover reads: the variable, one item of it, an item named by a variable, or the array summary. */
export type HoverPlan =
  | { kind: 'value'; name: string; fields?: QspField[] }
  | { kind: 'item'; name: string; key: QspVariableKey; fields?: QspField[] }
  | { kind: 'itemByVar'; name: string; indexName: string; fields?: QspField[] }
  | { kind: 'summary'; name: string }
  | { kind: 'none' };

/**
 * What to read for the hovered `token`, given the raw text between the brackets after it (undefined: none).
 * The token is a variable: the caller's tokenizer decides that (`MID = 1` assigns a variable named like a function).
 * A literal index or key reads that item, a single plain name that is not a keyword is read first and then used as
 * the index, and any other expression falls back to the array summary: evaluating it would run code. So does a
 * string key with `<<…>>` in it. `fieldTexts` are the `.field` parts as written; a field that cannot be read
 * statically (a quoted name with `<<`) reads nothing, and fields after an index that is an expression are ignored
 * (the summary of the base).
 */
export function hoverReadPlan(
  token: string,
  indexTextAfter: string | undefined,
  isKeyword: (word: string) => boolean,
  fieldTexts: string[] = [],
): HoverPlan {
  const name = token;
  let fields: QspField[] | undefined;
  if (fieldTexts.length > 0) {
    const parsed = parseQspPath(`A.${fieldTexts.join('.')}`);
    if (!parsed) return { kind: 'none' };
    fields = parsed.fields;
  }
  const withFields = fields ? { fields } : {};
  if (indexTextAfter === undefined) return { kind: 'value', name, ...withFields };
  const summary: HoverPlan = { kind: 'summary', name };
  const parts = splitParts(indexTextAfter);
  if (!parts) return summary;
  const literals = parts.map(parseLiteral);
  if (literals.some(isDynamicKey)) return summary;
  if (literals.every((literal) => literal !== undefined)) {
    if (literals.length === 1) return { kind: 'item', name, key: literals[0] as QspVariableKey, ...withFields };
    const key = [...literals] as QspTuple;
    return { kind: 'item', name, key, ...withFields };
  }
  const single = parts.length === 1 ? parts[0].trim() : '';
  if (QSP_NAME.test(single) && !isKeyword(single)) return { kind: 'itemByVar', name, indexName: single, ...withFields };
  return summary;
}

function typeName(value: QspVariableValue): string {
  return isTuple(value) ? 'tuple' : typeof value === 'number' ? 'number' : 'string';
}

/**
 * The markdown lines of a hover: the value read with the name as written (`typed`), and, when the prefix hides
 * what is stored (`raw`, read without it), what is stored. A variable with no value and no items is not set.
 */
export function describeHover(name: string, typed: QspVariableValue, raw: QspVariableValue, size: number): string[] {
  // Unset means no cells and nothing stored: the engine reads an unset `$`/`#`/`%` name as '' / 0 / [] (size 0).
  if (size === 0 && raw === undefined) return [`${name} — not set`];
  const lines = [`${name} = ${showValue(typed)}`];
  if (raw !== undefined && !sameValue(typed, raw)) lines.push(`stored value is a ${typeName(raw)}: ${showValue(raw)}`);
  return lines;
}

/** Whether a whole-variable hover shows the array summary: several items, or one with a key (not a plain value). */
export function isArrayHover(size: number, firstKey: string | QspTuple | undefined): boolean {
  return size > 1 || firstKey !== undefined;
}

/** The hover of a whole array: its item count and its first items (`shown`) with their keys or positions. */
export function describeSummary(
  name: string,
  size: number,
  shown: Array<{ key: string | QspTuple | undefined; value: QspVariableValue }>,
): string[] {
  if (size === 0) return [`${name} — not set`];
  const lines = [`${name} — ${size} items`];
  shown.forEach(({ key, value }, i) => lines.push(`[${indexText(key, i)}] → ${showValue(value)}`));
  if (size > shown.length) lines.push('…');
  return lines;
}

/**
 * Hover lines as one markdown fenced code block, safe for game text: the fence is longer than any backtick run in
 * the lines, and newlines are collapsed, so no value or key can end the block and add markdown (a link, HTML).
 */
export function hoverCodeBlock(lines: string[]): string {
  const flat = lines.map((line) => line.replace(/\r\n|[\r\n\u2028\u2029]/g, ' '));
  const longest = Math.max(0, ...flat.flatMap((line) => (line.match(/`+/g) ?? []).map((run) => run.length)));
  const fence = '`'.repeat(Math.max(3, longest + 1));
  return `${fence}\n${flat.join('\n')}\n${fence}`;
}
