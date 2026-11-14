import type { QspTuple, QspVariableKey, QspVariableValue } from '@qsp/wasm-engine';
import { isTuple, type QspTypePrefix } from './variable-logic';

/** Splits `text` at commas outside quotes; null when a quote is left open. */
export function splitParts(text: string): string[] | null {
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
export function parseLiteral(text: string): string | number | undefined {
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

/** Characters that end a name; a name also cannot start with a digit. */
export const NAME_STOP = String.raw` \t\r\n&'"()\[\]{}=!<>+\-/*\\,:;^@?.`;
/** A QSP variable name as the engine reads it: optional `$`/`#`/`%` prefix, then any run of non-operator chars. */
export const QSP_NAME = new RegExp(`^[$#%]?[^${NAME_STOP}\\d][^${NAME_STOP}]*$`, 'u');

export interface QspField {
  /** Upper-cased, quotes removed. */
  name: string;
  prefix?: QspTypePrefix;
}

export interface QspPath {
  /** Keeps its type prefix, upper-cased. */
  name: string;
  index?: QspVariableKey;
  fields: QspField[];
}

const PREFIXES = '$#%';

/** The index of the `]` that closes the `[` at `open`, skipping quoted text; -1 when there is none. */
function closingBracket(text: string, open: number): number {
  let quote: string | null = null;
  for (let i = open + 1; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === "'" || ch === '"') quote = ch;
    else if (ch === ']') return i;
  }
  return -1;
}

/** The index of the `quote` that ends the quoted text starting at `start` (a doubled quote stays inside); -1 if open. */
function closingQuote(text: string, start: number): number {
  const quote = text[start];
  for (let i = start + 1; i < text.length; i++) {
    if (text[i] !== quote) continue;
    if (text[i + 1] === quote) i++;
    else return i;
  }
  return -1;
}

/** The end of a plain name (no prefix) starting at `start`: the first char that cannot be part of one. */
function nameEnd(text: string, start: number): number {
  const run = new RegExp(`[^${NAME_STOP}]*`, 'uy');
  run.lastIndex = start;
  return start + run.exec(text)![0].length;
}

/** A string key with `<<…>>` in it: the engine expands it when it reads the key, which would run code. */
export function isDynamicKey(literal: string | number | undefined): boolean {
  return typeof literal === 'string' && literal.includes('<<');
}

function parseIndex(inside: string): QspVariableKey | undefined {
  const parts = splitParts(inside);
  if (!parts) return undefined;
  const literals = parts.map(parseLiteral);
  if (literals.some((literal) => literal === undefined || isDynamicKey(literal))) return undefined;
  return literals.length === 1 ? (literals[0] as QspVariableKey) : ([...literals] as QspTuple);
}

/**
 * A variable path as written in code: `NAME`, one literal `[…]` index, then `.field` parts (plain, prefixed or
 * quoted). Null for anything else: an index that is a variable or an expression, a string key or a quoted field
 * containing `<<`.
 */
export function parseQspPath(text: string): QspPath | null {
  const source = text.trim();
  const base = /^[$#%]?/.exec(source)![0];
  const baseEnd = nameEnd(source, base.length);
  const name = source.slice(0, baseEnd);
  if (!QSP_NAME.test(name)) return null;
  const path: QspPath = { name: name.toUpperCase(), fields: [] };
  let pos = baseEnd;
  if (source[pos] === '[') {
    const close = closingBracket(source, pos);
    if (close < 0) return null;
    const index = parseIndex(source.slice(pos + 1, close));
    if (index === undefined) return null;
    path.index = index;
    pos = close + 1;
  }
  while (pos < source.length) {
    if (source[pos] !== '.') return null;
    pos++;
    const prefix =
      PREFIXES.includes(source[pos] ?? '') && source[pos] !== undefined ? (source[pos] as QspTypePrefix) : undefined;
    if (prefix) pos++;
    let fieldName: string;
    if (source[pos] === "'" || source[pos] === '"') {
      const close = closingQuote(source, pos);
      if (close < 0) return null;
      const quote = source[pos];
      fieldName = source.slice(pos + 1, close).replaceAll(quote + quote, quote);
      if (fieldName === '' || fieldName.includes('<<')) return null;
      pos = close + 1;
    } else {
      const end = nameEnd(source, pos);
      fieldName = source.slice(pos, end);
      if (!QSP_NAME.test(fieldName)) return null;
      pos = end;
    }
    path.fields.push(prefix ? { name: fieldName.toUpperCase(), prefix } : { name: fieldName.toUpperCase() });
  }
  return path;
}

function quoted(text: string): string {
  return `'${text.toUpperCase().replaceAll("'", "''")}'`;
}

function formatKey(key: QspVariableKey): string {
  return typeof key === 'number' ? String(key) : quoted(String(key));
}

/** The canonical text of a path: upper case, `'…'` for string keys and unusual field names, `, ` between tuple keys. */
export function formatQspPath(path: QspPath): string {
  let text = path.name;
  if (path.index !== undefined) {
    const keys = isTuple(path.index)
      ? (path.index as QspTuple).map((k) => formatKey(k as QspVariableKey))
      : [formatKey(path.index)];
    text += `[${keys.join(', ')}]`;
  }
  for (const { name, prefix } of path.fields) {
    text += `.${prefix ?? ''}${QSP_NAME.test(name) && !PREFIXES.includes(name[0]) ? name : quoted(name)}`;
  }
  return text;
}

/**
 * Follows `fields` from `value` by name (upper-case compare) and returns the stored value: type prefixes are not
 * applied (see `applyTypePrefix`). Undefined when a step is not a tuple or the field is missing.
 */
export function walkFields(value: QspVariableValue, fields: QspField[]): QspVariableValue {
  let current = value;
  for (const { name } of fields) {
    if (!isTuple(current)) return undefined;
    const at = current.names?.findIndex((n) => n?.toUpperCase() === name) ?? -1;
    if (at < 0) return undefined;
    current = current[at];
  }
  return current;
}

/**
 * The type prefix that types the value a path reads: the last field's prefix, else the base name's
 * (the engine requires them to match, so either one decides).
 */
export function effectivePrefix(path: QspPath): QspTypePrefix | undefined {
  const last = path.fields[path.fields.length - 1]?.prefix;
  if (last) return last;
  const first = path.name[0];
  return PREFIXES.includes(first) ? (first as QspTypePrefix) : undefined;
}
