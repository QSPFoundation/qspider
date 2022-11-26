import { GameDescriptor } from '@qspider/contracts';
import Dexie from 'dexie';

export class QspiderDatabase extends Dexie {
  games!: Dexie.Table<GameDescriptor, string>;
  gameSources!: Dexie.Table<{ id: string; content: ArrayBuffer }, string>;

  constructor() {
    super('QspiderDatabase');
    this.version(1).stores({
      games: 'id, title',
      gameSources: 'id',
    });
  }
}
