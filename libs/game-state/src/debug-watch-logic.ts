import type { QspTuple, QspVariableValue } from '@qsp/wasm-engine';
import { formatQspValueTruncated, isTuple, sameValue } from './variable-logic';

/** Most items of one watched array a snapshot reads, so a stop never stalls on a huge array. */
export const WATCH_ITEM_CAP = 100;

/** Most items of a tuple a change description prints. */
const DESCRIBE_MAX_ITEMS = 5;

/** A watch entry's identity: names are case-insensitive, but the prefix counts (`$a` and `a` read differently). */
export function watchKey(name: string): string {
  return name.trim().toUpperCase();
}

/** Adds `name` (upper-cased) unless an entry with its identity is there already. */
export function addWatch(list: string[], name: string): string[] {
  const key = watchKey(name);
  if (!key || list.some((entry) => watchKey(entry) === key)) return list;
  return [...list, key];
}

export function removeWatch(list: string[], name: string): string[] {
  const key = watchKey(name);
  return list.filter((entry) => watchKey(entry) !== key);
}

/** A stored watch list; anything but a JSON array of strings gives an empty list. */
export function parseWatchList(text: string | null): string[] {
  if (!text) return [];
  try {
    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed) || !parsed.every((name) => typeof name === 'string')) return [];
    return parsed.reduce<string[]>((list, name: string) => addWatch(list, name), []);
  } catch {
    return [];
  }
}

export function serializeWatchList(list: string[]): string {
  return JSON.stringify(list);
}

/** One watched variable as a snapshot read it: its value, its item count and its first items (capped). */
export interface WatchValue {
  value: QspVariableValue;
  size: number;
  items: Array<{ key: string | QspTuple | undefined; value: QspVariableValue }>;
}

/** How many items of an array of `size` items to read. */
export function itemWindow(size: number, max: number): number {
  return Math.max(0, Math.min(size, max));
}

function sameWatchValue(a: WatchValue, b: WatchValue): boolean {
  return (
    a.size === b.size &&
    sameValue(a.value, b.value) &&
    a.items.length === b.items.length &&
    a.items.every((item, i) => sameValue(item.key, b.items[i].key) && sameValue(item.value, b.items[i].value))
  );
}

/**
 * The watched names whose value changed between two snapshots. A `null` previous snapshot is a baseline (nothing
 * changed); so is an entry the previous snapshot lacks.
 */
export function changedNames(prev: Record<string, WatchValue> | null, next: Record<string, WatchValue>): string[] {
  if (!prev) return [];
  return Object.keys(next).filter((name) => {
    const before = prev[name];
    return before !== undefined && !sameWatchValue(before, next[name]);
  });
}

function quote(text: string): string {
  return `'${text.replace(/'/g, "''")}'`;
}

/** An item's index as QSP code writes it: `'key'`, `1, 2` for a tuple key, or the position. */
export function indexText(key: string | QspTuple | undefined, position: number): string {
  if (key === undefined) return String(position);
  if (isTuple(key)) return formatQspValueTruncated(key, DESCRIBE_MAX_ITEMS).slice(1, -1);
  return quote(key);
}

/**
 * What changed in a watched variable, for the change notice. The variable's own value when that changed;
 * otherwise the first item that did, named as `NAME[index]`.
 */
export function describeChange(
  name: string,
  prev: WatchValue,
  next: WatchValue,
): { name: string; from: string; to: string } {
  const show = (v: QspVariableValue): string => formatQspValueTruncated(v, DESCRIBE_MAX_ITEMS);
  if (!sameValue(prev.value, next.value)) return { name, from: show(prev.value), to: show(next.value) };
  const count = Math.max(prev.items.length, next.items.length);
  for (let i = 0; i < count; i++) {
    const before = prev.items[i];
    const after = next.items[i];
    if (before && after && sameValue(before.key, after.key) && sameValue(before.value, after.value)) continue;
    const key = (after ?? before)?.key;
    return { name: `${name}[${indexText(key, i)}]`, from: show(before?.value), to: show(after?.value) };
  }
  // No shown item differs: the array changed past the items a snapshot reads (its size, or an item beyond them).
  if (prev.size !== next.size) return { name, from: `${prev.size} items`, to: `${next.size} items` };
  return { name, from: show(prev.value), to: show(next.value) };
}

/**
 * What an after-run report of the engine does with the watched values:
 * - `ignore`: the engine is held at a debug stop, so nothing can have changed since that stop's snapshot.
 * - `display`: the engine waits inside a run (a dialog or WAIT it shows): the shown values refresh, but the change
 *   baseline and the last stop stay, so the next stop still sees the change, pauses on it and blames the right line.
 * - `consume`: the run ended: its changes are taken (and blamed on its last stop) and the baseline moves on.
 */
export function afterRunMode(state: { stopHeld: boolean; dialogPending: boolean }): 'ignore' | 'display' | 'consume' {
  if (state.stopHeld) return 'ignore';
  return state.dialogPending ? 'display' : 'consume';
}
