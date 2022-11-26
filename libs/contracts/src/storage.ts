import { GameDescriptor } from './game';

export interface Storage {
  getGames(): Promise<Record<string, GameDescriptor>>;
  saveGames(games: GameDescriptor[]): Promise<void>;
  addGame(id: string, data: GameDescriptor): Promise<void>;
  addGameSource(id: string, content: ArrayBuffer): Promise<void>;
  getGameSource(id: string): Promise<ArrayBuffer | undefined>;
  updateGame(id: string, data: Partial<GameDescriptor>): Promise<void>;
  removeGame(id: string): Promise<void>;
}
