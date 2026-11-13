import type { QspTuple, QspVariableValue } from '@qsp/wasm-engine';

/** Registry key of a variable cell: upper-cased name (prefix kept); a key wins over the index. */
export function variableKey(name: string, key: string | undefined, index: number | undefined): string {
  const upper = name.toUpperCase();
  return key ? `${upper}\u0000k${key}` : `${upper}\u0000i${index ?? 0}`;
}

export function isTuple(v: QspVariableValue): v is QspTuple {
  return Array.isArray(v);
}

export function sameValue(a: QspVariableValue, b: QspVariableValue): boolean {
  if (isTuple(a) || isTuple(b)) {
    if (!isTuple(a) || !isTuple(b)) return false;
    if (a.length !== b.length) return false;
    const an = a.names;
    const bn = b.names;
    if (an || bn) {
      if (!an || !bn || an.length !== bn.length) return false;
      if (an.some((n, i) => n !== bn[i])) return false;
    }
    return a.every((v, i) => sameValue(v, b[i]));
  }
  return a === b;
}

export function scalarOrUnset(v: QspVariableValue): string | number | undefined {
  return isTuple(v) ? undefined : v;
}

export function conditionValue(v: QspVariableValue): string | number {
  return v === undefined || isTuple(v) ? 0 : v;
}

/**
 * QSP text form: tuples as `[1, 'a''b', [2, 'c']]`. Record `names` are not part of
 * the probed text form, so they are ignored here.
 */
export function formatQspValue(v: QspVariableValue): string {
  if (v === undefined) return '';
  if (isTuple(v)) return `[${v.map(formatTupleItem).join(', ')}]`;
  return String(v);
}

function formatTupleItem(v: QspVariableValue): string {
  if (typeof v === 'string') return `'${v.replaceAll("'", "''")}'`;
  return formatQspValue(v);
}

export function nextRefCount(count: number, delta: 1 | -1): number {
  return Math.max(0, count + delta);
}
