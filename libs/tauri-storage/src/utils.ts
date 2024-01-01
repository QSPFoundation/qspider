import {
  exists,
  readTextFile,
  writeTextFile,
  readBinaryFile,
  BaseDirectory,
  writeBinaryFile,
  createDir,
  removeFile,
  removeDir,
} from '@tauri-apps/api/fs';
import { appDataDir, dirname } from '@tauri-apps/api/path';
import { TauriStorageData } from './contracts';

const storageFile = 'qspider_1.db';

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
  if (file.includes('/')) {
    const dir = await dirname(file);
    if (!(await exists(dir, { dir: BaseDirectory.AppData }))) {
      await createDir(dir, { dir: BaseDirectory.AppData, recursive: true });
    }
  }
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

export async function ensureGameDirectories(game_id: string): Promise<void> {
  await createDir(`${game_id}/game`, { dir: BaseDirectory.AppData, recursive: true });
  await createDir(`${game_id}/saves`, { dir: BaseDirectory.AppData, recursive: true });
}

export async function removeGameDirectories(game_id: string): Promise<void> {
  await removeDir(game_id, { dir: BaseDirectory.AppData, recursive: true });
}

export async function clearBinaryData(file: string): Promise<void> {
  try {
    return await removeFile(file, { dir: BaseDirectory.AppData });
  } catch (err) {
    console.error(err);
  }
}
