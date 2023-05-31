import { stringify, parse, JsonMap } from 'iarna-toml-esm';
import { GAME_DESCRIPTOR_NAME, GameDescriptor, PlayerConfig } from '@qspider/contracts';
import { cyrb53 } from '@qspider/utils';
import { extractFileTree, isSupportedArchive, readSupportedArchive } from '../utils';
import type { FileDir } from '../utils';
import { storage$ } from '../storage';

export async function importArchive(archiveName: string, source: ArrayBuffer): Promise<GameDescriptor[]> {
  if (!isSupportedArchive(source.slice(0, 4))) throw new Error('unsupporter archive format');
  const resources = await readSupportedArchive(source);
  const root = extractFileTree(resources);
  const rootDescriptorFolder = findRootDescriptorFolder(root);
  if (rootDescriptorFolder) {
    const [folder, data] = rootDescriptorFolder;
    const games = await readGameDescriptor(data);
    for (const game of games) {
      try {
        const gameFolder = getGameFolder(folder, game.file);
        await storeFolderContent(game.id, gameFolder);
        // TODO add merging nested config
        const descriptorContent = stringify(game as unknown as JsonMap);
        await storage$.value?.addGameResource(
          game.id,
          GAME_DESCRIPTOR_NAME,
          new TextEncoder().encode(descriptorContent)
        );
      } catch (err) {
        console.error(err);
      }
    }
  }
  const rootGameFile = findRootGameFileFolder(root);
  if (rootGameFile) {
    const [gameFolder, filename] = rootGameFile;
    const game_id = cyrb53(archiveName);
    await storeFolderContent(game_id, gameFolder);
    const descriptor: GameDescriptor = {
      id: game_id,
      title: archiveName.slice(archiveName.lastIndexOf('/') + 1),
      mode: archiveName.endsWith('aqsp') ? 'aero' : 'classic',
      file: filename,
    };
    const descriptorContent = stringify(descriptor as unknown as JsonMap);
    await storage$.value?.addGameResource(game_id, GAME_DESCRIPTOR_NAME, new TextEncoder().encode(descriptorContent));
    return [descriptor];
  }

  throw new Error('game files not foound inside archive');
}

function findRootDescriptorFolder(root: FileDir): [FileDir, Uint8Array] | null {
  for (const entry of root.content) {
    if (entry.type === 'file' && entry.name === GAME_DESCRIPTOR_NAME) {
      return [root, entry.data];
    }
  }
  for (const entry of root.content) {
    if (entry.type === 'dir') {
      const found = findRootDescriptorFolder(entry);
      if (found) return found;
    }
  }
  return null;
}

function findRootGameFileFolder(root: FileDir): [FileDir, string] | null {
  let qspFile: string | null = null;
  let qspsFile: string | null = null;
  for (const entry of root.content) {
    if (entry.type === 'file') {
      if (entry.name.endsWith('.qsp')) {
        qspFile = entry.name;
      }
      if (entry.name.endsWith('.qsps')) {
        qspsFile = entry.name;
      }
    }
  }
  if (qspFile) return [root, qspFile];
  if (qspsFile) return [root, qspsFile];
  for (const entry of root.content) {
    if (entry.type === 'dir') {
      const found = findRootGameFileFolder(entry);
      if (found) return found;
    }
  }
  return null;
}

function getGameFolder(root: FileDir, filename: string): FileDir {
  const path = filename.split('/');
  path.pop();
  let dir: FileDir = root;
  for (const dirName of path) {
    const existing = dir.content.find((d): d is FileDir => d.type === 'dir' && d.name === dirName);
    if (!existing) throw new Error(`Failed to find game file ${filename} in archvive`);
    dir = existing;
  }
  return dir;
}

async function readGameDescriptor(data: Uint8Array): Promise<GameDescriptor[]> {
  const blob = new Blob([data]);
  const text = await blob.text();
  const descriptor = parse(text) as unknown as PlayerConfig;
  return descriptor.game;
}

async function storeFolderContent(game_id: string, folder: FileDir, prefix = ''): Promise<void> {
  for (const entry of folder.content) {
    if (entry.type === 'dir') {
      await storeFolderContent(game_id, entry, `${prefix}${entry.name}/`);
    } else {
      await storage$.value?.addGameResource(game_id, `${prefix}${entry.name}`, entry.data);
    }
  }
}
