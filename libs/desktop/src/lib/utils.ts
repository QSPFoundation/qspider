import {
  exists,
  readTextFile,
  writeTextFile,
  readFile,
  BaseDirectory,
  writeFile,
  mkdir,
  remove,
} from '@tauri-apps/plugin-fs';
import { appDataDir, dirname } from '@tauri-apps/api/path';
import { TauriStorageData } from './contracts';

const storageFile = 'qspider_1.db';

export async function ensureAppDataDir(): Promise<void> {
  const appDataDirPath = await appDataDir();
  const isCreated = await exists(appDataDirPath);
  if (!isCreated) {
    await mkdir(appDataDirPath, { recursive: true });
  }
}

export async function readStorageData(): Promise<TauriStorageData | null> {
  try {
    const content = await readTextFile(storageFile, { baseDir: BaseDirectory.AppData });
    if (content) return JSON.parse(content);
  } catch (err) {
    console.error(err);
  }
  return null;
}

export async function flushStorageData(data: TauriStorageData): Promise<void> {
  await writeTextFile(storageFile, JSON.stringify(data), { baseDir: BaseDirectory.AppData });
}

export async function storeBinaryData(file: string, content: ArrayBuffer): Promise<void> {
  if (file.includes('/')) {
    const dir = await dirname(file);
    if (!(await exists(dir, { baseDir: BaseDirectory.AppData }))) {
      await mkdir(dir, { baseDir: BaseDirectory.AppData, recursive: true });
    }
  }
  await writeFile(file, new Uint8Array(content), { baseDir: BaseDirectory.AppData });
}

export async function readBinaryData(file: string): Promise<ArrayBuffer | undefined> {
  try {
    const bytes = await readFile(file, { baseDir: BaseDirectory.AppData });
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  } catch (err) {
    console.error(err);
  }
  return undefined;
}

export async function ensureGameDirectories(game_id: string): Promise<void> {
  await mkdir(`${game_id}/game`, { baseDir: BaseDirectory.AppData, recursive: true });
  await mkdir(`${game_id}/saves`, { baseDir: BaseDirectory.AppData, recursive: true });
}

export async function removeGameDirectories(game_id: string): Promise<void> {
  await remove(game_id, { baseDir: BaseDirectory.AppData, recursive: true });
}

export async function clearBinaryData(file: string): Promise<void> {
  try {
    return await remove(file, { baseDir: BaseDirectory.AppData });
  } catch (err) {
    console.error(err);
  }
}
