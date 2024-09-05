import { GameShelfEntry, SaveData } from '@qspider/contracts';

export interface TauriStorageData {
  games: Record<string, GameShelfEntry>;
  saves: Record<string, Record<string, SaveData>>;
}
