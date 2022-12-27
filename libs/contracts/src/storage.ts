import { GameDescriptor } from './game';
import { SaveData } from './save';

export interface Storage {
  getGames(): Promise<Record<string, GameDescriptor>>;
  addGame(id: string, data: GameDescriptor): Promise<void>;
  addGameSource(id: string, content: ArrayBuffer): Promise<void>;
  getGameSource(id: string): Promise<ArrayBuffer | undefined>;
  updateGame(id: string, data: Partial<GameDescriptor>): Promise<void>;
  removeGame(id: string): Promise<void>;

  saveByKey(game_id: string, key: string, data: ArrayBuffer): Promise<void>;
  saveBySlot(game_id: string, slot: number, data: ArrayBuffer): Promise<void>;
  getSaveDataByKey(game_id: string, key: string): Promise<ArrayBuffer | null>;
  getSaveDataBySlot(game_id: string, slot: number): Promise<ArrayBuffer | null>;
  getSavedSlots(game_id: string): Promise<SaveData[]>;
}
