import { readTextFile, writeTextFile, readBinaryFile, BaseDirectory, writeBinaryFile } from '@tauri-apps/api/fs';

import { TauriStorageData } from './contracts';

const storageFile = 'qspider.db';

export async function readStorageData(): Promise<TauriStorageData | null> {
  try {
    const content = await readTextFile(storageFile, { dir: BaseDirectory.App });
    if (content) return JSON.parse(content);
  } catch {
    // no-op
  }
  return null;
}

export async function flushStorageData(data: TauriStorageData): Promise<void> {
  await writeTextFile(storageFile, JSON.stringify(data), { dir: BaseDirectory.App });
}

export async function storeBinaryData(file: string, content: ArrayBuffer): Promise<void> {
  await writeBinaryFile(file, content, { dir: BaseDirectory.App });
}

export async function readBinaryData(file: string): Promise<ArrayBuffer | undefined> {
  try {
    return readBinaryFile(file, { dir: BaseDirectory.App });
  } catch {
    // no-op
  }
  return undefined;
}
