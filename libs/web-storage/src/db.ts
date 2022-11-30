import { GameDescriptor, SaveData } from '@qspider/contracts';
import Dexie from 'dexie';

export class QspiderDatabase extends Dexie {
  games!: Dexie.Table<GameDescriptor, string>;
  gameSources!: Dexie.Table<{ id: string; content: ArrayBuffer }, string>;
  gameSaves!: Dexie.Table<SaveData, string>;

  constructor() {
    super('QspiderDatabase');
    this.version(1).stores({
      games: 'id, title',
      gameSources: 'id',
      gameSaves: '++, game_id, &[game_id+key+slot]',
    });
  }
}
