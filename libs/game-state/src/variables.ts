import type { QspAPI, QspVariableType, QspVariableValue } from '@qsp/wasm-engine';
import { Atom, atom } from 'xoid';
import { useCallback, useSyncExternalStore } from 'react';
import { gameOpenEpoch$, isRetiredEngine, qspApi$ } from './qsp-engine';
import { checkCondition } from './conditions';
import { variableOrDefault } from './engine-event-logic';
import { conditionValue, nextRefCount, sameValue, scalarOrUnset, variableKey } from './variable-logic';

/**
 * One watched game variable cell, shared by every reader of it. The name goes to the engine exactly as written
 * (no implicit `#`); the entry keeps one engine watcher while anyone holds it.
 */
interface VariableEntry {
  atom$: Atom<QspVariableValue>;
  count: number;
  unwatch?: () => void;
  name: string;
  key: string;
  index: number;
}

const entries = new Map<string, VariableEntry>();

function entryFor(name: string, key: string, index: number): VariableEntry {
  const id = variableKey(name, key, index);
  let entry = entries.get(id);
  if (!entry) {
    entry = { atom$: atom<QspVariableValue>(undefined), count: 0, name, key, index };
    entries.set(id, entry);
  }
  return entry;
}

/** Drops the entry's engine watcher and registers it again on `api`, whose immediate callback sets the value. */
function attach(entry: VariableEntry, api: QspAPI | undefined): void {
  entry.unwatch?.();
  entry.unwatch = undefined;
  if (!api) return;
  const { atom$, name, key, index } = entry;
  const onValue = (value: QspVariableValue): void => {
    if (isRetiredEngine(api)) return;
    if (!sameValue(atom$.value, value)) atom$.set(value);
  };
  entry.unwatch = key ? api.watchVariableByKey(name, key, onValue) : api.watchVariableByIndex(name, index, onValue);
}

function reattachAll(): void {
  const api = qspApi$.value;
  if (!api) return;
  for (const entry of entries.values()) {
    if (entry.count > 0) attach(entry, api);
  }
}

// A fresh engine (after a game stops) and a new game (which wipes the engine's watchers) both need every live
// entry to watch again. The leaf qsp-engine module makes subscribing at import safe despite the import cycle.
qspApi$.subscribe(reattachAll);
gameOpenEpoch$.subscribe(reattachAll);

/** The shared atom of a game variable cell (memoized by the case-insensitive name, prefix kept, and key or index). */
function variable$(name: string, key = '', index = 0): Atom<QspVariableValue> {
  return entryFor(name, key, index).atom$;
}

/**
 * Holds a game variable cell: the first holder attaches its engine watcher. The returned release lets go; the
 * last release detaches the watcher and forgets the entry.
 */
function acquireVariable(name: string, key = '', index = 0): () => void {
  const entry = entryFor(name, key, index);
  entry.count = nextRefCount(entry.count, 1);
  if (entry.count === 1) attach(entry, qspApi$.value);
  let released = false;
  return (): void => {
    if (released) return;
    released = true;
    entry.count = nextRefCount(entry.count, -1);
    if (entry.count > 0) return;
    entry.unwatch?.();
    entry.unwatch = undefined;
    const id = variableKey(entry.name, entry.key, entry.index);
    if (entries.get(id) === entry) entries.delete(id);
  };
}

/**
 * Holds a game variable cell for the app's lifetime and returns its shared atom, for module-level readers (the
 * aero format variables) that live as long as the app does.
 */
export function heldVariable$(name: string, key = '', index = 0): Atom<QspVariableValue> {
  acquireVariable(name, key, index);
  return variable$(name, key, index);
}

/** The current value of a cell without creating an entry for it (undefined when nobody holds it). */
function peekVariable(name: string, key: string, index: number): QspVariableValue {
  return entries.get(variableKey(name, key, index))?.atom$.value;
}

const noop = (): void => undefined;

/**
 * The raw value of a game variable cell (a string, a number, a tuple or undefined), held while the component is
 * mounted. The cell is acquired in the store subscription, so its entry is looked up anew on every read: React
 * may subscribe, unsubscribe and subscribe again (StrictMode), and the last release forgets the entry.
 */
export function useQspVariableRaw(name: string | undefined, key: string, index: number): QspVariableValue {
  const subscribe = useCallback(
    (onChange: () => void): (() => void) => {
      if (!name) return noop;
      const release = acquireVariable(name, key, index);
      const unsubscribe = variable$(name, key, index).subscribe(onChange);
      return (): void => {
        unsubscribe();
        release();
      };
    },
    [name, key, index],
  );
  const getSnapshot = (): QspVariableValue => (name ? peekVariable(name, key, index) : undefined);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** A game variable as a string or number; a tuple, unset, `0` and `''` give `defaultValue`. */
export function useQspVariable<Name extends string, T = QspVariableType<Name>>(
  name: Name | undefined,
  key: string,
  index: number,
  defaultValue: T,
): T {
  const raw = useQspVariableRaw(name, key, index);
  return variableOrDefault<unknown>(scalarOrUnset(raw), defaultValue) as T;
}

/** Whether a game variable meets a `<qsp-show>` condition; a tuple or an unset variable compares as 0. */
export function useQspExpression(variable: string, condition: [string, string]): boolean {
  const raw = useQspVariableRaw(variable || undefined, '', 0);
  if (!variable) return false;
  return checkCondition(conditionValue(raw), condition);
}
