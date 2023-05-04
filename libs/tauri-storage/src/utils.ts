import {
  exists,
  readTextFile,
  writeTextFile,
  readBinaryFile,
  BaseDirectory,
  writeBinaryFile,
  createDir,
} from '@tauri-apps/api/fs';
import { appDataDir } from '@tauri-apps/api/path';
import { TauriStorageData } from './contracts';

const storageFile = 'qspider.db';

export async function ensureAppDataDir(): Promise<void> {
  const appDataDirPath = await appDataDir();
  const isCreated = await exists(appDataDirPath);
  if (!isCreated) {
    await createDir(appDataDirPath);
  }
}

export async function readStorageData(): Promise<TauriStorageData | null> {
  try {
    const content = await readTextFile(storageFile, { dir: BaseDirectory.AppData });
    if (content) return JSON.parse(content);
  } catch (err) {
    console.error(err);
  }
  return null;
}

export async function flushStorageData(data: TauriStorageData): Promise<void> {
  await writeTextFile(storageFile, JSON.stringify(data), { dir: BaseDirectory.AppData });
}

export async function storeBinaryData(file: string, content: ArrayBuffer): Promise<void> {
  await writeBinaryFile(file, content, { dir: BaseDirectory.AppData });
}

export async function readBinaryData(file: string): Promise<ArrayBuffer | undefined> {
  try {
    return await readBinaryFile(file, { dir: BaseDirectory.AppData });
  } catch (err) {
    console.error(err);
  }
  return undefined;
}
