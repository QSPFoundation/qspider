import { GameDescriptor } from '@qspider/contracts';
import Dexie from 'dexie';
import { WebSaveData } from './contracts';

export class QspiderDatabase extends Dexie {
  games!: Dexie.Table<GameDescriptor, string>;
  gameResources!: Dexie.Table<{ game_id: string; path: string; content: ArrayBuffer }, string>;
  gameSaves!: Dexie.Table<WebSaveData, string>;

  constructor() {
    super('QspiderDatabase');
    this.version(2).stores({
      games: 'id, title',
      gameResources: '++, game_id, &[game_id+path]',
      gameSaves: '++, game_id, &[game_id+key+slot], slot, [game_id+slot], [game_id+key]',
    });
  }
}
