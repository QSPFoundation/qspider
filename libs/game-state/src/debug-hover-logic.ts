import type { QspTuple, QspVariableKey, QspVariableValue } from '@qsp/wasm-engine';
import { indexText, showValue } from './debug-watch-logic';
import { formatQspValueTruncated, isTuple, sameValue } from './variable-logic';

/** Most items of an array a hover summary lists. */
export const HOVER_SUMMARY_ITEMS = 5;

/** What a hover reads: the variable, one item of it, an item named by a variable, or the array summary. */
export type HoverPlan =
  | { kind: 'value'; name: string }
  | { kind: 'item'; name: string; key: QspVariableKey }
  | { kind: 'itemByVar'; name: string; indexName: string }
  | { kind: 'summary'; name: string }
  | { kind: 'none' };

/** Splits `text` at commas outside quotes; null when a quote is left open. */
function splitParts(text: string): string[] | null {
  const parts: string[] = [];
  let current = '';
  let quote: string | null = null;
  for (const ch of text) {
    if (quote) {
      if (ch === quote) quote = null; // a doubled quote closes and reopens: both stay in the part
      current += ch;
    } else if (ch === ',') {
      parts.push(current);
      current = '';
    } else {
      if (ch === "'" || ch === '"') quote = ch;
      current += ch;
    }
  }
  if (quote) return null;
  parts.push(current);
  return parts;
}

/** A number or a quoted string literal (QSP doubles the quote to escape it); undefined for anything else. */
function parseLiteral(text: string): string | number | undefined {
  const part = text.trim();
  if (/^-?\d+$/.test(part)) return Number(part);
  const quote = part[0];
  if ((quote === "'" || quote === '"') && part.length >= 2 && part.endsWith(quote)) {
    const body = part.slice(1, -1);
    // every quote inside must be doubled, or the literal is something else (`'a' + 'b'`)
    if (body.replaceAll(quote + quote, '').includes(quote)) return undefined;
    return body.replaceAll(quote + quote, quote);
  }
  return undefined;
}

const PLAIN_NAME = /^[$#%]?[A-Za-z_]\w*$/;

/**
 * What to read for the hovered `token`, given the raw text between the brackets after it (undefined: none).
 * A literal index or key reads that item, a single plain name is read first and then used as the index, and any
 * other expression falls back to the array summary: evaluating it would run code. Keywords read nothing.
 */
export function hoverReadPlan(
  token: string,
  indexTextAfter: string | undefined,
  isKeyword: (word: string) => boolean,
): HoverPlan {
  if (isKeyword(token)) return { kind: 'none' };
  const name = token;
  if (indexTextAfter === undefined) return { kind: 'value', name };
  const summary: HoverPlan = { kind: 'summary', name };
  const parts = splitParts(indexTextAfter);
  if (!parts) return summary;
  const literals = parts.map(parseLiteral);
  if (literals.every((literal) => literal !== undefined)) {
    if (literals.length === 1) return { kind: 'item', name, key: literals[0] as QspVariableKey };
    const key = [...literals] as QspTuple;
    return { kind: 'item', name, key };
  }
  const single = parts.length === 1 ? parts[0].trim() : '';
  if (PLAIN_NAME.test(single) && !isKeyword(single)) return { kind: 'itemByVar', name, indexName: single };
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
