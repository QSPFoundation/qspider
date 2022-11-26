import { GameDescriptor, Storage } from '@qspider/contracts';
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
  async saveGames(games: GameDescriptor[]): Promise<void> {
    await this.db.games.bulkPut(games);
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
}
