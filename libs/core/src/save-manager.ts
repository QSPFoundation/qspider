import localforage from 'localforage';

const SLOTS_COUNT = 21;

function getDateKey(gameId: string, slot: number): string {
  return `${gameId}_slot_${slot}_date`;
}
function getSlotKey(gameId: string, slot: number): string {
  return `${gameId}_slot_${slot}`;
}
function getQuickSlotKey(gameId: string): string {
  return `${gameId}_quick_slot`;
}
function getPathKey(gameId: string, path: string): string {
  return `${gameId}$$${path}`;
}

export class SaveManager {
  async getSlots(gameId: string): Promise<Array<string | null>> {
    return Promise.all(
      Array.from({ length: SLOTS_COUNT }, (_, index) => localforage.getItem<string>(getDateKey(gameId, index + 1)))
    );
  }

  getSlotData(gameId: string, slot: number): Promise<ArrayBuffer | null> {
    return localforage.getItem<ArrayBuffer>(getSlotKey(gameId, slot));
  }

  async updateSlot(gameId: string, slot: number, data: ArrayBuffer): Promise<string> {
    if (slot < 1 || slot > SLOTS_COUNT) {
      console.error(`Unsupported slot ID: ${slot}`);
    }
    const date = new Date().toISOString();
    await localforage.setItem(getSlotKey(gameId, slot), data);
    await localforage.setItem(getDateKey(gameId, slot), date);
    return date;
  }

  async quickSave(gameId: string, data: ArrayBuffer): Promise<void> {
    await localforage.setItem(getQuickSlotKey(gameId), data);
  }

  quickLoad(gameId: string): Promise<ArrayBuffer | null> {
    return localforage.getItem(getQuickSlotKey(gameId));
  }

  async saveByPath(gameId: string, path: string, data: ArrayBuffer): Promise<void> {
    await localforage.setItem(getPathKey(gameId, path), data);
  }

  loadByPath(gameId: string, path: string): Promise<ArrayBuffer | null> {
    return localforage.getItem(getPathKey(gameId, path));
  }
}
