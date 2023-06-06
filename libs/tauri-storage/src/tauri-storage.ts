import { GameShelfEntry, SaveData, Storage } from '@qspider/contracts';
import { defer } from '@qspider/utils';
import { TauriStorageData } from './contracts';
import {
  clearBinaryData,
  ensureAppDataDir,
  ensureGameDirectories,
  flushStorageData,
  readBinaryData,
  readStorageData,
  removeGameDirectories,
  storeBinaryData,
} from './utils';
import { v4 as uuidv4 } from 'uuid';
import { tauri } from '@tauri-apps/api';

export class TauriStorage implements Storage {
  private storageData!: TauriStorageData;
  private initialized = defer<void>();

  constructor() {
    this.initialize();
  }

  async initialize(): Promise<void> {
    await ensureAppDataDir();
    this.storageData = (await readStorageData()) || {
      games: {},
      saves: {},
    };
    for (const game of Object.values(this.storageData.games)) {
      if (game.loadConfig.local_path) {
        if (!game.loadConfig.local_id) game.loadConfig.local_id = uuidv4();
        await tauri.invoke('prepare_game_start', { path: game.loadConfig.local_path, id: game.loadConfig.local_id });
      }
    }
    this.initialized.resolve();
  }

  async getGames(): Promise<Record<string, GameShelfEntry>> {
    await this.initialized.promise;
    return this.storageData.games;
  }
  async addGame(id: string, data: GameShelfEntry): Promise<void> {
    await this.initialized.promise;
    this.storageData.games[id] = data;
    await ensureGameDirectories(id);
    await flushStorageData(this.storageData);
  }
  async updateGame(id: string, data: Partial<GameShelfEntry>): Promise<void> {
    await this.initialized.promise;
    this.storageData.games[id] = {
      ...(this.storageData.games[id] || {}),
      ...data,
    };
    await flushStorageData(this.storageData);
  }
  async removeGame(id: string): Promise<void> {
    await this.initialized.promise;
    delete this.storageData.games[id];
    delete this.storageData.saves[id];
    await flushStorageData(this.storageData);
    await removeGameDirectories(id);
  }

  async addGameResource(game_id: string, path: string, data: ArrayBuffer): Promise<void> {
    await this.initialized.promise;
    await storeBinaryData(`${game_id}/game/${path}`, data);
  }
  async getGameResource(game_id: string, path: string): Promise<ArrayBuffer | null> {
    await this.initialized.promise;
    return (await readBinaryData(`${game_id}/game/${path}`)) ?? null;
  }

  async saveByKey(game_id: string, key: string, data: ArrayBuffer): Promise<void> {
    await this.initialized.promise;
    const gameSaves = this.storageData.saves[game_id] ?? {};
    const storageKey = `${key}_-1`;
    gameSaves[storageKey] = {
      timestamp: Date.now(),
      game_id,
      key,
      slot: -1,
    };
    this.storageData.saves[game_id] = gameSaves;
    await storeBinaryData(`${game_id}/saves/${storageKey}`, data);
    await flushStorageData(this.storageData);
  }
  async saveBySlot(game_id: string, slot: number, data: ArrayBuffer): Promise<void> {
    await this.initialized.promise;
    const gameSaves = this.storageData.saves[game_id] ?? {};
    const storageKey = `__${slot}`;
    gameSaves[storageKey] = {
      timestamp: Date.now(),
      game_id,
      key: '',
      slot,
    };
    this.storageData.saves[game_id] = gameSaves;
    await storeBinaryData(`${game_id}/saves/${storageKey}`, data);
    await flushStorageData(this.storageData);
  }
  async hasSaveByKey(game_id: string, key: string): Promise<boolean | null> {
    await this.initialized.promise;
    const storageKey = `${key}_-1`;
    return storageKey in this.storageData.saves[game_id] ?? {};
  }
  async hasSaveBySlot(game_id: string, slot: number): Promise<boolean | null> {
    await this.initialized.promise;
    const storageKey = `__${slot}`;
    return storageKey in this.storageData.saves[game_id] ?? {};
  }
  async getSaveDataByKey(game_id: string, key: string): Promise<ArrayBuffer | null> {
    await this.initialized.promise;
    const storageKey = `${key}_-1`;
    return (await readBinaryData(storageKey)) || null;
  }
  async getSaveDataBySlot(game_id: string, slot: number): Promise<ArrayBuffer | null> {
    await this.initialized.promise;
    const storageKey = `${game_id}__${slot}`;
    return (await readBinaryData(`${game_id}/saves/${storageKey}`)) || null;
  }
  async getSavedSlots(game_id: string): Promise<SaveData[]> {
    await this.initialized.promise;
    const found = [];
    for (const row of Object.values(this.storageData.saves[game_id] ?? {})) {
      if (row.slot > 0) {
        found.push(row);
      }
    }
    return found;
  }
  async getNamedSaves(game_id: string): Promise<SaveData[]> {
    await this.initialized.promise;
    const found = [];
    for (const row of Object.values(this.storageData.saves[game_id] ?? {})) {
      if (row.key !== '') {
        found.push(row);
      }
    }
    return found;
  }

  async clearSaveSlot(game_id: string, slot: number): Promise<void> {
    await this.initialized.promise;
    const storageKey = `__${slot}`;
    delete this.storageData.saves[game_id][storageKey];
    await clearBinaryData(`${game_id}/saves/${storageKey}`);
    await flushStorageData(this.storageData);
  }
  async clearSaveKey(game_id: string, key: string): Promise<void> {
    await this.initialized.promise;
    const storageKey = `${key}_-1`;
    delete this.storageData.saves[game_id][storageKey];
    await clearBinaryData(`${game_id}/saves/${storageKey}`);
    await flushStorageData(this.storageData);
  }
}
