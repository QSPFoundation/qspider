// The routing and the handshakes of saving and loading (save.ts, pause-screen.ts, qsp-api.ts), apart from the
// storage and the engine. Light: only xoid atoms.
import { create } from 'xoid';

/** Set while the engine waits on a load (OPENGAME): the player answers it when the load is done. */
export const saveLoadedCallback$ = create<null | (() => void)>();
/** Set while the engine waits on a save (SAVEGAME): the player answers it when the save is done. */
export const gameSavedCallback$ = create<null | (() => void)>();
/** What the player asked the saves panel for (`save` or `load`); null when nothing, so the panel shows both. */
export const requestedAction$ = create<string | null>(null);

export type QspSaveCommand = 'load' | 'save' | 'clear';
export type SaveContext = { slot_index: number; save_path: string };
/** A numbered slot or a named path. */
export type SaveTarget = { slot: number } | { path: string };

/** Where a save command from the saves panel goes: a slot above 0, else the path, else nowhere. */
export function saveCommandTarget(context: SaveContext): SaveTarget | null {
  if (context.slot_index > 0) return { slot: context.slot_index };
  if (context.save_path) return { path: context.save_path };
  return null;
}

/** A save is stored: answers the engine's SAVEGAME, if it waits, and drops the saves panel's request. */
export function finishSave(): void {
  const saved = gameSavedCallback$.value;
  saved?.();
  gameSavedCallback$.set(null);
  requestedAction$.set(null);
}

/** A load is over, done or failed: drops the request and the engine's OPENGAME callback, then answers it. */
export function resumeAfterLoad(): void {
  const loaded = saveLoadedCallback$.value;
  saveLoadedCallback$.set(null);
  requestedAction$.set(null);
  loaded?.();
}

/** The saves panel is closed: the engine's waiting SAVEGAME / OPENGAME are answered as cancelled. */
export function cancelPendingSaveCallbacks(): void {
  requestedAction$.set(null);
  if (saveLoadedCallback$.value) {
    saveLoadedCallback$.value();
    saveLoadedCallback$.set(null);
  }
  if (gameSavedCallback$.value) {
    gameSavedCallback$.value();
    gameSavedCallback$.set(null);
  }
}
