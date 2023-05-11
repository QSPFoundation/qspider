import { GameDescriptor, SaveData, Storage } from '@qspider/contracts';
import { defer } from '@qspider/utils';
import { TauriStorageData } from './contracts';
import { ensureAppDataDir, flushStorageData, readBinaryData, readStorageData, storeBinaryData } from './utils';
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
      if (game.local_path) {
        if (!game.local_id) game.local_id = uuidv4();
        await tauri.invoke('prepare_game_start', { path: game.local_path, id: game.local_id });
      }
    }
    this.initialized.resolve();
  }

  async getGames(): Promise<Record<string, GameDescriptor>> {
    await this.initialized.promise;
    return this.storageData.games;
  }
  async addGame(id: string, data: GameDescriptor): Promise<void> {
    await this.initialized.promise;
    this.storageData.games[id] = data;
    await flushStorageData(this.storageData);
  }
  async addGameSource(id: string, content: ArrayBuffer): Promise<void> {
    await this.initialized.promise;
    await storeBinaryData(id, content);
  }
  async getGameSource(id: string): Promise<ArrayBuffer | undefined> {
    await this.initialized.promise;
    return await readBinaryData(id);
  }
  async updateGame(id: string, data: Partial<GameDescriptor>): Promise<void> {
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
    await flushStorageData(this.storageData);
  }
  async saveByKey(game_id: string, key: string, data: ArrayBuffer): Promise<void> {
    await this.initialized.promise;
    const storageKey = `${game_id}_${key}_-1`;
    this.storageData.saves[storageKey] = {
      timestamp: Date.now(),
      game_id,
      key,
      slot: -1,
    };
    await storeBinaryData(storageKey, data);
    await flushStorageData(this.storageData);
  }
  async saveBySlot(game_id: string, slot: number, data: ArrayBuffer): Promise<void> {
    await this.initialized.promise;
    const storageKey = `${game_id}__${slot}`;
    this.storageData.saves[storageKey] = {
      timestamp: Date.now(),
      game_id,
      key: '',
      slot,
    };
    await storeBinaryData(storageKey, data);
    await flushStorageData(this.storageData);
  }
  async hasSaveByKey(game_id: string, key: string): Promise<boolean | null> {
    await this.initialized.promise;
    const storageKey = `${game_id}_${key}_-1`;
    return storageKey in this.storageData.saves;
  }
  async hasSaveBySlot(game_id: string, slot: number): Promise<boolean | null> {
    await this.initialized.promise;
    const storageKey = `${game_id}__${slot}`;
    return storageKey in this.storageData.saves;
  }
  async getSaveDataByKey(game_id: string, key: string): Promise<ArrayBuffer | null> {
    await this.initialized.promise;
    const storageKey = `${game_id}_${key}_-1`;
    return (await readBinaryData(storageKey)) || null;
  }
  async getSaveDataBySlot(game_id: string, slot: number): Promise<ArrayBuffer | null> {
    await this.initialized.promise;
    const storageKey = `${game_id}__${slot}`;
    return (await readBinaryData(storageKey)) || null;
  }
  async getSavedSlots(game_id: string): Promise<SaveData[]> {
    await this.initialized.promise;
    const found = [];
    for (const row of Object.values(this.storageData.saves)) {
      if (row.game_id === game_id && row.slot > 0) {
        found.push(row);
      }
    }
    return found;
  }
  async getNamedSaves(game_id: string): Promise<SaveData[]> {
    await this.initialized.promise;
    const found = [];
    for (const row of Object.values(this.storageData.saves)) {
      if (row.game_id === game_id && row.key !== '') {
        found.push(row);
      }
    }
    return found;
  }
}
