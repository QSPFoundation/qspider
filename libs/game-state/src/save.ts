import { SaveData } from '@qspider/contracts';
import { create } from 'xoid';
import { withCounterPaused } from './counter';
import { currentGame$, onGameAction } from './current-game';
import { qspApi$ } from './qsp-api';
import { storage$ } from './storage';

export const saveLoadedCallback$ = create<null | (() => void)>();
export const gameSavedCallback$ = create<null | (() => void)>();
export const saveSlots$ = create<SaveData[]>([]);

const QUICK_SAVE_KEY = '__quicksave_qpider__';

export async function loadSaveList(): Promise<void> {
  const currentGame = currentGame$.value;
  if (!currentGame) {
    saveSlots$.set([]);
    return;
  }
  const slots = await storage$.value?.getSavedSlots(currentGame.id);
  saveSlots$.set(slots || []);
}

export async function saveToSlot(slot: number): Promise<void> {
  const currentGame = currentGame$.value;
  if (!currentGame) return;
  const saveData = qspApi$.value?.saveGame();
  if (saveData) {
    await storage$.value?.saveBySlot(currentGame.id, slot, saveData);
  }
  const saved = gameSavedCallback$.value;
  saved?.();
  gameSavedCallback$.set(null);
  await loadSaveList();
}

export async function restoreFromSlot(slot: number): Promise<void> {
  const currentGame = currentGame$.value;
  if (!currentGame) return;
  const saveData = await storage$.value?.getSaveDataBySlot(currentGame.id, slot);
  const loaded = saveLoadedCallback$.value;
  loaded?.();
  saveLoadedCallback$.set(null);
  if (saveData) {
    qspApi$.value?.loadSave(saveData);
  }
}

export async function quickSave(): Promise<void> {
  const currentGame = currentGame$.value;
  if (!currentGame) return;
  await withCounterPaused(async () => {
    const saveData = qspApi$.value?.saveGame();
    if (!saveData) return;
    await storage$.value?.saveByKey(currentGame.id, QUICK_SAVE_KEY, saveData);
  });
}

export async function quickLoad(): Promise<void> {
  const currentGame = currentGame$.value;
  if (!currentGame) return;
  await withCounterPaused(async () => {
    const saveData = await storage$.value?.getSaveDataByKey(currentGame.id, QUICK_SAVE_KEY);
    if (saveData) {
      qspApi$.value?.loadSave(saveData);
    }
  });
}

qspApi$.subscribe((api) => {
  api.on('load_save', async (path, loaded) => {
    const currentGame = currentGame$.value;
    if (!currentGame) return loaded();
    if (path) {
      await withCounterPaused(async () => {
        const saveData = await storage$.value?.getSaveDataByKey(currentGame.id, path);
        loaded();
        if (saveData) {
          api.loadSave(saveData);
        }
      });
    } else {
      saveLoadedCallback$.set(loaded);
      onGameAction('load');
    }
  });
  api.on('save_game', async (path, saved) => {
    const currentGame = currentGame$.value;
    if (!currentGame) return saved();
    if (path) {
      await withCounterPaused(async () => {
        const saveData = api.saveGame();
        if (!saveData) return saved();
        await storage$.value?.saveByKey(currentGame.id, path, saveData);
        saved();
      });
    } else {
      gameSavedCallback$.set(saved);
      onGameAction('save');
    }
  });
});
