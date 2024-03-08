import { stringify, parse, JsonMap } from 'iarna-toml-esm';
import { GAME_DESCRIPTOR_NAME, GameDescriptor, GameShelfEntry, PlayerConfig } from '@qspider/contracts';
import { cyrb53 } from '@qspider/utils';
import { isSupportedArchive, readSupportedArchive } from '../utils';
import type { FileDir, File } from '../utils';
import { storage$ } from '../storage';

export async function importArchive(
  archiveName: string,
  source: ArrayBuffer,
  rootDescriptor?: GameDescriptor,
): Promise<GameShelfEntry[]> {
  const storage = storage$.value;
  if (!storage) throw new Error('missing storage');
  if (!isSupportedArchive(source)) throw new Error('unsupporter archive format');
  const root = await readSupportedArchive(source);
  const rootDescriptorFolder = findRootDescriptorFolder(root);
  if (rootDescriptorFolder) {
    const [folder, data] = rootDescriptorFolder;
    const games = await readGameDescriptor(data);
    for (const game of games) {
      try {
        const gameFolder = getGameFolder(folder, game.file);
        await storeFolderContent(game.id, gameFolder);
        const descriptorFile = gameFolder.content.find<File>(
          (entry): entry is File => entry.type === 'file' && entry.name === GAME_DESCRIPTOR_NAME,
        );
        if (!descriptorFile) {
          const descriptorContent = stringify({ game: [game] } as unknown as JsonMap);
          await storage$.value?.addGameResource(
            game.id,
            GAME_DESCRIPTOR_NAME,
            new TextEncoder().encode(descriptorContent),
          );
        } else {
          const [descriptor] = await readGameDescriptor(descriptorFile.data);
          Object.assign(game, descriptor);
        }
      } catch (err) {
        console.error(err);
      }
    }
    return Promise.all(
      games.map(async (game) => {
        const file = game.file.slice(game.file.lastIndexOf('/') + 1);
        const loadConfig = await storage.prepareLoadConfig(game.id, file);
        let icon = game.resources?.icon;
        if (icon) {
          icon = `${loadConfig.url}${icon}`;
        }
        return {
          id: game.id,
          mode: game.mode,
          title: game.title,
          author: game.author,
          ported_by: game.ported_by,
          version: game.version,
          description: game.description,
          icon,
          loadConfig: {
            ...loadConfig,
            descriptor: game,
          },
        };
      }),
    );
  }
  const rootGameFile = findRootGameFileFolder(root);
  if (rootGameFile) {
    const [gameFolder, filename] = rootGameFile;
    const game_id = rootDescriptor?.id || cyrb53(archiveName);
    await storeFolderContent(game_id, gameFolder);
    if (rootDescriptor) {
      const descriptorContent = stringify({ game: [rootDescriptor] } as unknown as JsonMap);
      await storage$.value?.addGameResource(game_id, GAME_DESCRIPTOR_NAME, new TextEncoder().encode(descriptorContent));
    }
    const loadConfig = await storage.prepareLoadConfig(game_id, filename);
    let icon = rootDescriptor?.resources?.icon;
    if (icon) {
      icon = `${loadConfig.url}${icon}`;
    }
    return [
      {
        id: game_id,
        title: rootDescriptor?.title || archiveName.slice(archiveName.lastIndexOf('/') + 1),
        mode: rootDescriptor?.mode || (archiveName.endsWith('aqsp') ? 'aero' : 'classic'),
        author: rootDescriptor?.author,
        ported_by: rootDescriptor?.ported_by,
        version: rootDescriptor?.version,
        description: rootDescriptor?.description,
        icon,
        loadConfig,
      },
    ];
  }

  throw new Error('Game files not found inside archive');
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
      if (entry.name.endsWith('.qsp') || entry.name.endsWith('.gam')) {
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
      if (entry.name === '.DS_Store') continue;
      await storage$.value?.addGameResource(game_id, `${prefix}${entry.name}`, entry.data);
    }
  }
}
