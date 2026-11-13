import type { QspAPI } from '@qsp/wasm-engine';
import { atom } from 'xoid';
import { gameOpenEpoch$, isRetiredEngine, qspApi$ } from './qsp-engine';
import {
  addWatch,
  changedNames,
  describeChange,
  itemWindow,
  parseWatchList,
  removeWatch,
  serializeWatchList,
  WATCH_ITEM_CAP,
  watchKey,
  type WatchValue,
} from './debug-watch-logic';

/** Where a debug stop is: the part of a debug record the change notice names. */
interface StopRecord {
  loc: string;
  line: number;
}

export interface ChangeNotice {
  name: string;
  from: string;
  to: string;
  loc?: string;
  line?: number;
  /** The change was made between engine runs (a link's code, an event), not by a line the debugger stopped at. */
  betweenRuns?: boolean;
}

/** The watched names of the current game (upper-cased, as entered), saved per game. */
export const watchList$ = atom<string[]>([]);
/** Which watched names pause the game when they change (by `watchKey`); not saved. */
export const watchPause$ = atom<Record<string, boolean>>({});
/** The last snapshot of the watched variables (by `watchKey`). */
export const watchValues$ = atom<Record<string, WatchValue>>({});
/** The watched names that changed in the last snapshot. */
export const watchChanged$ = atom<string[]>([]);
/** The last change seen, with where it was made. */
export const changeNotice$ = atom<ChangeNotice | null>(null);

const STORAGE_PREFIX = 'qsp-debugger-watch:';

function getLocalStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

let gameId: string | null = null;

/** The shelf id of the current game (null: none): its saved watch list replaces the list. */
export function setWatchGame(id: string | null): void {
  if (id === gameId) return;
  gameId = id;
  let saved: string | null = null;
  try {
    saved = id ? (getLocalStorage()?.getItem(STORAGE_PREFIX + id) ?? null) : null;
  } catch {
    // unreadable storage means an empty list
  }
  watchList$.set(parseWatchList(saved));
  watchPause$.set({});
  resetWatchBaseline();
}

function persistWatchList(list: string[]): void {
  if (!gameId) return;
  try {
    getLocalStorage()?.setItem(STORAGE_PREFIX + gameId, serializeWatchList(list));
  } catch {
    // Ignore localStorage errors
  }
}

// --- snapshots -------------------------------------------------------------------------------------------------

/** Whether watching runs: only while the debugger panel is open. No engine read happens otherwise. */
let active = false;
/** Whether the last snapshot exists to compare against; false after a reset (the next snapshot is a baseline). */
let hasBaseline = false;
/** The last debug stop of the current run; null once a run ended (or nothing stopped yet). */
let lastStop: StopRecord | null = null;
/** Whether the engine is held at a debug stop: nothing can change until it is released. */
let stopHeld = false;

function readWatchValue(api: QspAPI, name: string): WatchValue {
  const size = api.readVariableSize(name);
  const items: WatchValue['items'] = [];
  for (let i = 0, count = itemWindow(size, WATCH_ITEM_CAP); i < count; i++) {
    const { key, value } = api.readVariableItem(name, i);
    items.push({ key, value });
  }
  return { value: api.readVariable(name), size, items };
}

function readSnapshot(api: QspAPI): Record<string, WatchValue> {
  const snapshot: Record<string, WatchValue> = {};
  for (const name of watchList$.value) snapshot[watchKey(name)] = readWatchValue(api, name);
  return snapshot;
}

function liveApi(): QspAPI | null {
  const api = qspApi$.value;
  return active && api && !isRetiredEngine(api) ? api : null;
}

/** Takes a snapshot and marks what changed since the last one; returns the changed names. */
function takeSnapshot(api: QspAPI, where: Omit<ChangeNotice, 'name' | 'from' | 'to'>): string[] {
  const prev = hasBaseline ? watchValues$.value : null;
  const next = readSnapshot(api);
  const changed = changedNames(prev, next);
  hasBaseline = true;
  watchValues$.set(next);
  watchChanged$.set(changed);
  if (prev && changed.length > 0) {
    const pausing = watchPause$.value;
    const reported = changed.find((name) => pausing[name]) ?? changed[0];
    changeNotice$.set({ ...describeChange(reported, prev[reported], next[reported]), ...where });
  }
  return changed;
}

/**
 * The snapshot at a debug stop (call it only while the panel is open). A change seen here since the previous stop
 * of the same run was made by that stop's line; at the first stop of a run it was made between runs. Returns
 * whether to pause: a changed name has its pause toggle on.
 */
export function snapshotAtStop(record: StopRecord): boolean {
  const api = liveApi();
  if (!api) return false;
  const where = lastStop ? { loc: lastStop.loc, line: lastStop.line } : { betweenRuns: true };
  const changed = takeSnapshot(api, where);
  lastStop = { loc: record.loc, line: record.line };
  stopHeld = true;
  const pausing = watchPause$.value;
  return changed.some((name) => pausing[name]);
}

/** The debug stop the last `snapshotAtStop` saw is released: the engine runs on. */
export function releaseWatchStop(): void {
  stopHeld = false;
}

/**
 * The snapshot after an engine run (and when the panel opens). A change seen here was made by the run's last line
 * (the last stop), or, with no stop, by the run itself; it never pauses, there is nothing left to pause at.
 */
export function snapshotAfterRun(): void {
  const api = liveApi();
  if (!api || stopHeld) return;
  takeSnapshot(api, lastStop ? { loc: lastStop.loc, line: lastStop.line } : {});
  lastStop = null;
}

/** The next snapshot is a baseline: no change marks, no notice, no pause (a game start, OPENQST, a load). */
export function resetWatchBaseline(): void {
  hasBaseline = false;
  lastStop = null;
  stopHeld = false;
  watchChanged$.set([]);
  changeNotice$.set(null);
}

// The after-run hook: one engine watcher, read after every engine run. The engine reports its watchers whenever
// it refreshes the screen (the end of every run, and before a dialog or WAIT inside one), and a `%` read always
// gives a fresh tuple, so this watcher's callback runs at every report, whatever the variables did. The watched
// names themselves can't be the hook: a watcher sees only one cell, and an array's later items would slip by.
const TICK_VARIABLE = '%QSPIDER_DEBUG_WATCH_TICK';
let detachTick: (() => void) | null = null;

function attachTick(): void {
  detachTick?.();
  detachTick = null;
  const api = qspApi$.value;
  if (!active || !api || isRetiredEngine(api)) return;
  let initial = true; // the engine calls a new watcher at once; that is not a run
  detachTick = api.watchVariable(TICK_VARIABLE, () => {
    if (initial || isRetiredEngine(api)) return;
    snapshotAfterRun();
  });
  initial = false;
}

/** Turns watching on (the panel opened) or off (it closed: no reads at all, and the after-run hook goes). */
export function setWatchActive(on: boolean): void {
  active = on;
  if (on) {
    attachTick();
  } else {
    detachTick?.();
    detachTick = null;
  }
}

// A fresh engine (after a game stops) and a new game (OPENQST included, which wipes the engine's watchers) start
// from a baseline and need the hook again.
qspApi$.subscribe(() => {
  resetWatchBaseline();
  attachTick();
});
gameOpenEpoch$.subscribe(() => {
  resetWatchBaseline();
  attachTick();
});

function setList(list: string[]): void {
  watchList$.set(list);
  persistWatchList(list);
}

export const watchActions = {
  /** Adds a watch entry. Its value is read at once and is its baseline: adding is never a change. */
  add: (name: string): void => {
    const list = addWatch(watchList$.value, name);
    if (list === watchList$.value) return;
    setList(list);
    const api = liveApi();
    if (!api) return;
    const key = watchKey(name);
    watchValues$.update((values) => ({ ...values, [key]: readWatchValue(api, key) }));
  },

  remove: (name: string): void => {
    const key = watchKey(name);
    setList(removeWatch(watchList$.value, name));
    watchPause$.update(({ [key]: _, ...rest }) => rest);
    watchValues$.update(({ [key]: _, ...rest }) => rest);
    watchChanged$.update((changed) => changed.filter((entry) => entry !== key));
  },

  togglePause: (name: string): void => {
    const key = watchKey(name);
    watchPause$.update((pause) => ({ ...pause, [key]: !pause[key] }));
  },
};
