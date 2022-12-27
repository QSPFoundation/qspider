import { GameDescriptor, SaveData } from '@qspider/contracts';

export interface TauriStorageData {
  games: Record<string, GameDescriptor>;
  saves: Record<string, SaveData>;
}
