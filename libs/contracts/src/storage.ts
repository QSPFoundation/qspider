import { GameShelfEntry } from './game-shelf';

export interface SaveData {
  game_id: string;
  timestamp: number;
  key: string;
  slot: number;
}

export interface Storage {
  getGames(): Promise<Record<string, GameShelfEntry>>;
  addGame(id: string, data: GameShelfEntry): Promise<void>;
  updateGame(id: string, data: Partial<GameShelfEntry>): Promise<void>;
  removeGame(id: string): Promise<void>;

  prepareLoadConfig(game_id: string, entrypoint: string): Promise<GameShelfEntry['loadConfig']>;

  addGameResource(game_id: string, path: string, data: ArrayBuffer): Promise<void>;
  getGameResource(game_id: string, path: string): Promise<ArrayBuffer | null>;

  saveByKey(game_id: string, key: string, data: ArrayBuffer): Promise<void>;
  saveBySlot(game_id: string, slot: number, data: ArrayBuffer): Promise<void>;
  hasSaveByKey(game_id: string, key: string): Promise<boolean>;
  hasSaveBySlot(game_id: string, slot: number): Promise<boolean>;
  getSaveDataByKey(game_id: string, key: string): Promise<ArrayBuffer | null>;
  getSaveDataBySlot(game_id: string, slot: number): Promise<ArrayBuffer | null>;
  getSavedSlots(game_id: string): Promise<SaveData[]>;
  getNamedSaves(game_id: string): Promise<SaveData[]>;
  clearSaveSlot(game_id: string, slot: number): Promise<void>;
  clearSaveKey(game_id: string, key: string): Promise<void>;
}
