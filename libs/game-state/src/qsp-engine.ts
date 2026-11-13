import type { QspAPI } from '@qsp/wasm-engine';
import { atom } from 'xoid';

/**
 * The current engine. This module imports nothing from game-state, so any module can subscribe to these atoms at
 * import time, even from inside the qsp-api import cycle.
 */
export const qspApi$ = atom<QspAPI>();

/**
 * Counts the games opened as new. Opening a new game wipes the engine's variable watchers, so the variable layer
 * (variables.ts) re-attaches its watchers when this changes.
 */
export const gameOpenEpoch$ = atom(0);

/**
 * Engines of stopped games. A stopped game may still be inside a statement (a dialog it waits in, or code the
 * engine resumes a tick after an answer): its engine's events are ignored and never answered, so that game's
 * code never reaches the player again, and an engine left waiting can't hold up the next game.
 */
const retiredApis = new WeakSet<QspAPI>();

export function retireEngine(api: QspAPI): void {
  retiredApis.add(api);
}

export function isRetiredEngine(api: QspAPI): boolean {
  return retiredApis.has(api);
}
