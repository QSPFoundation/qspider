import { GameDescriptor, SaveData, Storage } from '@qspider/contracts';
import { WebSaveData } from './contracts';
import { QspiderDatabase } from './db';

export class WebStorage implements Storage {
  private db = new QspiderDatabase();

  async getGames(): Promise<Record<string, GameDescriptor>> {
    const games = await this.db.games.toArray();
    return games.reduce<Record<string, GameDescriptor>>((acc, game) => {
      acc[game.id] = game;
      return acc;
    }, {});
  }
  async addGame(id: string, data: GameDescriptor): Promise<void> {
    await this.db.games.put(data, id);
  }
  async addGameSource(id: string, content: ArrayBuffer): Promise<void> {
    await this.db.gameSources.put({ id, content });
  }
  async getGameSource(id: string): Promise<ArrayBuffer | undefined> {
    return (await this.db.gameSources.get(id))?.content;
  }
  async updateGame(id: string, data: GameDescriptor): Promise<void> {
    await this.db.games.update(id, data);
  }
  async removeGame(id: string): Promise<void> {
    await this.db.transaction('rw', this.db.games, this.db.gameSources, async () => {
      await this.db.games.delete(id);
      await this.db.gameSources.delete(id);
    });
  }

  async saveByKey(game_id: string, key: string, data: ArrayBuffer): Promise<void> {
    await this.db.gameSaves
      .where({
        game_id,
        key,
        slot: -1,
      })
      .delete();
    const record: WebSaveData = {
      timestamp: Date.now(),
      game_id,
      key,
      slot: -1,
      data,
    };
    await this.db.gameSaves.put(record);
  }
  async saveBySlot(game_id: string, slot: number, data: ArrayBuffer): Promise<void> {
    await this.db.gameSaves
      .where({
        game_id,
        key: '',
        slot,
      })
      .delete();
    const record: WebSaveData = {
      timestamp: Date.now(),
      game_id,
      key: '',
      slot,
      data,
    };
    await this.db.gameSaves.put(record);
  }
  async hasSaveByKey(game_id: string, key: string): Promise<boolean | null> {
    const count = await this.db.gameSaves.where({ game_id, key }).count();
    return count > 0;
  }
  async hasSaveBySlot(game_id: string, slot: number): Promise<boolean | null> {
    const count = await this.db.gameSaves.where({ game_id, slot }).count();
    return count > 0;
  }
  async getSaveDataByKey(game_id: string, key: string): Promise<ArrayBuffer | null> {
    const record = await this.db.gameSaves.where({ game_id, key }).first();
    return record?.data || null;
  }
  async getSaveDataBySlot(game_id: string, slot: number): Promise<ArrayBuffer | null> {
    const record = await this.db.gameSaves.where({ game_id, slot }).first();
    return record?.data || null;
  }
  async getSavedSlots(game_id: string): Promise<SaveData[]> {
    return await this.db.gameSaves.where('slot').above(0).toArray();
  }
  async getNamedSaves(game_id: string): Promise<SaveData[]> {
    return await this.db.gameSaves.where('key').notEqual('').toArray();
  }
}
