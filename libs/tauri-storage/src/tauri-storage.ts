import { GameDescriptor, SaveData, Storage } from '@qspider/contracts';
import { defer } from '@qspider/utils';
import { writeBinaryFile } from '@tauri-apps/api/fs';
import { TauriStorageData } from './contracts';
import { flushStorageData, readBinaryData, readStorageData } from './utils';

export class TauriStorage implements Storage {
  private storageData!: TauriStorageData;
  private initialized = defer<void>();

  constructor() {
    this.initialize();
  }
  async initialize(): Promise<void> {
    this.storageData = (await readStorageData()) || {
      games: {},
      saves: {},
    };
    this.initialized.resolve();
  }

  async getGames(): Promise<Record<string, GameDescriptor>> {
    return this.storageData.games;
  }
  async addGame(id: string, data: GameDescriptor): Promise<void> {
    this.storageData.games[id] = data;
    await flushStorageData(this.storageData);
  }
  async addGameSource(id: string, content: ArrayBuffer): Promise<void> {
    await writeBinaryFile(id, content);
  }
  async getGameSource(id: string): Promise<ArrayBuffer | undefined> {
    return await readBinaryData(id);
  }
  async updateGame(id: string, data: Partial<GameDescriptor>): Promise<void> {
    this.storageData.games[id] = {
      ...(this.storageData.games[id] || {}),
      ...data,
    };
    await flushStorageData(this.storageData);
  }
  async removeGame(id: string): Promise<void> {
    delete this.storageData.games[id];
    await flushStorageData(this.storageData);
  }
  async saveByKey(game_id: string, key: string, data: ArrayBuffer): Promise<void> {
    const storageKey = `${game_id}_${key}_-1`;
    this.storageData.saves[storageKey] = {
      timestamp: Date.now(),
      game_id,
      key,
      slot: -1,
    };
    await writeBinaryFile(storageKey, data);
    await flushStorageData(this.storageData);
  }
  async saveBySlot(game_id: string, slot: number, data: ArrayBuffer): Promise<void> {
    const storageKey = `${game_id}__${slot}`;
    this.storageData.saves[storageKey] = {
      timestamp: Date.now(),
      game_id,
      key: '',
      slot,
    };
    await writeBinaryFile(storageKey, data);
    await flushStorageData(this.storageData);
  }
  async getSaveDataByKey(game_id: string, key: string): Promise<ArrayBuffer | null> {
    const storageKey = `${game_id}_${key}_-1`;
    return (await readBinaryData(storageKey)) || null;
  }
  async getSaveDataBySlot(game_id: string, slot: number): Promise<ArrayBuffer | null> {
    const storageKey = `${game_id}__${slot}`;
    return (await readBinaryData(storageKey)) || null;
  }
  async getSavedSlots(game_id: string): Promise<SaveData[]> {
    const found = [];
    for (const row of Object.values(this.storageData.saves)) {
      if (row.game_id === game_id && row.slot > 0) {
        found.push(row);
      }
    }
    return found;
  }
}
