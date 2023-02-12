export * from './constants';
export * from './game';
export * from './window-manager';
export * from './storage';

export interface Resource {
  url: string;
  type: string;
}

export interface SaveData {
  game_id: string;
  timestamp: number;
  key: string;
  slot: number;
}
