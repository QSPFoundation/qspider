import { SaveData } from '@qspider/contracts';
import { create } from 'xoid';
import { withCounterPaused } from './counter';
import { currentGameEntry$, onRestore } from './current-game';
import { qspApi$ } from './qsp-api';
import { getStorage } from '@qspider/env';
import { closePauseScreen } from './pause-screen';
import {
  finishSave,
  gameSavedCallback$,
  requestedAction$,
  resumeAfterLoad,
  saveCommandTarget,
  saveLoadedCallback$,
  type QspSaveCommand,
  type SaveContext,
  type SaveTarget,
} from './save-routing';

export { gameSavedCallback$, requestedAction$, saveLoadedCallback$, type QspSaveCommand, type SaveContext };
export const saveSlots$ = create<SaveData[]>([]);
export const namedSlots$ = create<SaveData[]>([]);

export const QUICK_SAVE_KEY = '__quicksave_qspider__';

export async function loadSaveList(): Promise<void> {
  const currentGame = currentGameEntry$.value;
  if (!currentGame) {
    saveSlots$.set([]);
    namedSlots$.set([]);
    return;
  }
  const slots = await getStorage().getSavedSlots(currentGame.id);
  saveSlots$.set(slots || []);
  const named = await getStorage().getNamedSaves(currentGame.id);
  namedSlots$.set(named || []);
}

async function writeSave(gameId: string, target: SaveTarget, saveData: ArrayBuffer): Promise<void> {
  if ('slot' in target) await getStorage().saveBySlot(gameId, target.slot, saveData);
  else await getStorage().saveByKey(gameId, target.path, saveData);
}

async function saveTo(target: SaveTarget): Promise<void> {
  const currentGame = currentGameEntry$.value;
  if (!currentGame) return;
  const saveData = qspApi$.value?.saveGame();
  if (saveData) {
    await writeSave(currentGame.id, target, saveData);
  }
  finishSave();
  await loadSaveList();
}

async function restoreFrom(target: SaveTarget): Promise<void> {
  const currentGame = currentGameEntry$.value;
  if (!currentGame) return;
  try {
    const saveData =
      'slot' in target
        ? await getStorage().getSaveDataBySlot(currentGame.id, target.slot)
        : await getStorage().getSaveDataByKey(currentGame.id, target.path);
    // Engine contract (load_save event): the callback runs after api.loadSave has restored the state.
    if (saveData) {
      qspApi$.value?.loadSave(saveData);
    }
  } finally {
    // Always resume the engine, even if reading or restoring the save failed.
    resumeAfterLoad();
  }
}

async function clearFrom(target: SaveTarget): Promise<void> {
  const currentGame = currentGameEntry$.value;
  if (!currentGame) return;
  if ('slot' in target) await getStorage().clearSaveSlot(currentGame.id, target.slot);
  else await getStorage().clearSaveKey(currentGame.id, target.path);
  await loadSaveList();
}

export const saveToSlot = (slot: number): Promise<void> => saveTo({ slot });
export const saveToPath = (path: string): Promise<void> => saveTo({ path });
export const restoreFromSlot = (slot: number): Promise<void> => restoreFrom({ slot });
export const restoreFromPath = (path: string): Promise<void> => restoreFrom({ path });
export const clearSlot = (slot: number): Promise<void> => clearFrom({ slot });
export const clearPath = (path: string): Promise<void> => clearFrom({ path });

export async function quickSave(): Promise<void> {
  const nosave = qspApi$.value?.readVariable('NOSAVE');
  if (nosave) return;
  const currentGame = currentGameEntry$.value;
  if (!currentGame) return;
  await withCounterPaused(async () => {
    const saveData = qspApi$.value?.saveGame();
    if (!saveData) return;
    await getStorage().saveByKey(currentGame.id, QUICK_SAVE_KEY, saveData);
    await loadSaveList();
  });
}

export async function quickLoad(): Promise<void> {
  const currentGame = currentGameEntry$.value;
  if (!currentGame) return;
  await withCounterPaused(async () => {
    const saveData = await getStorage().getSaveDataByKey(currentGame.id, QUICK_SAVE_KEY);
    if (saveData) {
      qspApi$.value?.loadSave(saveData);
      onRestore();
    }
  });
}

export async function onSaveCommand(action: QspSaveCommand, context: SaveContext): Promise<void> {
  const target = saveCommandTarget(context);
  switch (action) {
    case 'load':
      if (target) await restoreFrom(target);
      onRestore();
      closePauseScreen();
      break;
    case 'save':
      if (target) await saveTo(target);
      closePauseScreen();
      break;
    case 'clear':
      if (target) clearFrom(target);
      break;
    default:
      console.error(`Unknown save action: ${action}`);
  }
}
