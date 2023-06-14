import { GameShelfEntry, SaveData, Storage } from '@qspider/contracts';
import { WebSaveData } from './contracts';
import { QspiderDatabase } from './db';

export class WebStorage implements Storage {
  private db = new QspiderDatabase();

  async prepareLoadConfig(game_id: string, entrypoint: string): Promise<GameShelfEntry['loadConfig']> {
    return {
      url: `/qspider-files/${game_id}/`,
      entrypoint,
    };
  }

  async getGames(): Promise<Record<string, GameShelfEntry>> {
    const games = await this.db.games.toArray();
    return games.reduce<Record<string, GameShelfEntry>>((acc, game) => {
      acc[game.id] = game;
      return acc;
    }, {});
  }
  async addGame(id: string, data: GameShelfEntry): Promise<void> {
    await this.db.games.put(data, id);
  }
  async updateGame(id: string, data: GameShelfEntry): Promise<void> {
    await this.db.games.update(id, data);
  }
  async removeGame(id: string): Promise<void> {
    await this.db.transaction('rw', this.db.games, this.db.gameResources, async () => {
      await this.db.games.delete(id);
      await this.db.gameResources.where('game_id').equals(id).delete();
    });
  }

  async addGameResource(game_id: string, path: string, content: ArrayBuffer): Promise<void> {
    await this.db.gameResources
      .where({
        game_id,
        path,
      })
      .delete();
    await this.db.gameResources.put({
      game_id,
      path,
      content,
    });
  }
  async getGameResource(game_id: string, path: string): Promise<ArrayBuffer | null> {
    const record = await this.db.gameResources.where({ game_id, path }).first();
    return record?.content || null;
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
    return await this.db.gameSaves
      .where({ game_id })
      .and((save) => save.slot > 0)
      .toArray();
  }
  async getNamedSaves(game_id: string): Promise<SaveData[]> {
    return await this.db.gameSaves
      .where({ game_id })
      .and((save) => save.key !== '')
      .toArray();
  }

  async clearSaveSlot(game_id: string, slot: number): Promise<void> {
    await this.db.gameSaves
      .where({
        game_id,
        key: '',
        slot,
      })
      .delete();
  }

  async clearSaveKey(game_id: string, key: string): Promise<void> {
    await this.db.gameSaves
      .where({
        game_id,
        key,
        slot: -1,
      })
      .delete();
  }
}
