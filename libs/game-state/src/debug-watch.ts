import type { QspAPI } from '@qsp/wasm-engine';
import { atom } from 'xoid';
import { gameOpenEpoch$, isRetiredEngine, qspApi$ } from './qsp-engine';
import { msg$ } from './msg';
import { menu$ } from './menu';
import { input$ } from './input';
import { wait$ } from './wait';
import {
  addWatch,
  afterRunMode,
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
/**
 * The snapshot changes are measured against; null after a reset (the next snapshot is a baseline). It moves on at
 * each stop and at the end of a run, not when the shown values merely refresh while a run waits in a dialog.
 */
let baseline: Record<string, WatchValue> | null = null;
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

/** Takes a snapshot, marks what changed since the baseline and makes it the new baseline; returns the changed names. */
function takeSnapshot(
  api: QspAPI,
  where: Omit<ChangeNotice, 'name' | 'from' | 'to'>,
  keepWhenClean: boolean,
): string[] {
  const prev = baseline;
  const next = readSnapshot(api);
  const changed = changedNames(prev, next);
  baseline = next;
  watchValues$.set(next);
  if (keepWhenClean && changed.length === 0) return changed;
  watchChanged$.set(changed);
  if (prev && changed.length === 0) {
    // The notice names the last change seen: the next debug stop that sees none clears it.
    changeNotice$.set(null);
  } else if (prev) {
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
  const changed = takeSnapshot(api, where, false);
  lastStop = { loc: record.loc, line: record.line };
  stopHeld = true;
  const pausing = watchPause$.value;
  return changed.some((name) => pausing[name]);
}

/** The debug stop the last `snapshotAtStop` saw is released: the engine runs on. */
export function releaseWatchStop(): void {
  stopHeld = false;
}

/** Whether the engine waits inside a run for a dialog or a WAIT it showed. */
function isDialogPending(): boolean {
  return msg$.value.isOpen || menu$.value.isOpen || input$.value.isOpen || wait$.value !== null;
}

/**
 * The snapshot after an engine run (and when the panel opens). A change seen here was made by the run's last line
 * (the last stop), or, with no stop, by the run itself; it never pauses, there is nothing left to pause at.
 * The engine also reports before a dialog or WAIT inside a run: then only the shown values refresh, and the change
 * stays for the next stop to pause on and blame on its line (`afterRunMode`).
 */
export function snapshotAfterRun(): void {
  const api = liveApi();
  if (!api) return;
  const mode = afterRunMode({ stopHeld, dialogPending: isDialogPending() });
  if (mode === 'ignore') return;
  if (mode === 'display') {
    const next = readSnapshot(api);
    baseline ??= next; // opened mid-dialog: what shows now is the baseline
    watchValues$.set(next);
    watchChanged$.set(changedNames(baseline, next));
    return;
  }
  // A clean after-run snapshot keeps the marks and the notice: the engine runs often with nothing to report (qspider
  // runs the counter every 500 ms), and a change's marks must outlive those runs until the next stop or change.
  takeSnapshot(api, lastStop ? { loc: lastStop.loc, line: lastStop.line } : {}, true);
  lastStop = null;
}

/** The next snapshot is a baseline: no change marks, no notice, no pause (a game start, OPENQST, a load). */
export function resetWatchBaseline(): void {
  baseline = null;
  lastStop = null;
  stopHeld = false;
  watchChanged$.set([]);
  changeNotice$.set(null);
}

// The after-run hook: one engine watcher used as a tick, so its callback runs after every engine run. The watched
// names themselves can't be the hook: a watcher sees only one cell, and an array's later items would slip by.
// It relies on three internals of @qsp/wasm-engine 2.0.0 (qsp-api.js), so check them on every engine upgrade:
// 1. `applyTypePrefix` returns a fresh `[]` for a `%` read of a variable that holds no tuple (and a tuple read
//    builds a new array), so the watcher's `!==` comparison always sees a "change".
// 2. `onRefresh` (the end of every run, and before a dialog or WAIT inside one) schedules
//    `setTimeout(() => this.reportWatched(), 0)`, which calls every watcher.
// Runs are frequent: qspider's counter calls `execCounter()` every 500 ms, so the tick fires at least that often
// with nothing to report (see `takeSnapshot`: a clean after-run snapshot keeps the change marks).
// 3. Watchers read through `readCached`, whose cache `clearCache()` empties at every `exec` start and end and every
//    `notify`, so each report reads anew instead of returning the cached (same) array.
// An upstream fix that compares tuple watcher values structurally (C12) would silence this tick: it would then fire
// only on its first attach, and the watch list would stop refreshing after runs.
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
    const value = readWatchValue(api, key);
    if (baseline) baseline = { ...baseline, [key]: value };
    watchValues$.update((values) => ({ ...values, [key]: value }));
  },

  remove: (name: string): void => {
    const key = watchKey(name);
    setList(removeWatch(watchList$.value, name));
    watchPause$.update(({ [key]: _, ...rest }) => rest);
    watchValues$.update(({ [key]: _, ...rest }) => rest);
    if (baseline) {
      const { [key]: _, ...rest } = baseline;
      baseline = rest;
    }
    watchChanged$.update((changed) => changed.filter((entry) => entry !== key));
    // the notice names this entry (or an item of it): it goes with it
    changeNotice$.update((notice) =>
      notice && (notice.name === key || notice.name.startsWith(`${key}[`)) ? null : notice,
    );
  },

  togglePause: (name: string): void => {
    const key = watchKey(name);
    watchPause$.update((pause) => ({ ...pause, [key]: !pause[key] }));
  },
};
