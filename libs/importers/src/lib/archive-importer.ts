import { stringify, JsonMap } from 'iarna-toml-esm';
import { GAME_DESCRIPTOR_NAME, GameDescriptor, GameShelfEntry, PlayerConfig } from '@qspider/contracts';
import { decodeText, parseToml } from '@qspider/utils';
import { getStorage } from '@qspider/env';
import { isSupportedArchive, readSupportedArchive } from './utils';
import type { FileDir, File } from './utils';
import { findRootDescriptorFolder, findRootGameFileFolder, getGameFolder } from './archive-tree';
import { archiveFallbackEntry, archiveGameId, descriptorEntry, pickGameDescriptor } from './import-entries';

export async function importArchive(
  archiveName: string,
  source: ArrayBuffer,
  rootDescriptor?: GameDescriptor,
): Promise<GameShelfEntry[]> {
  const storage = getStorage();
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
          await storage.addGameResource(
            game.id,
            GAME_DESCRIPTOR_NAME,
            new TextEncoder().encode(descriptorContent).buffer,
          );
        } else {
          const descriptor = pickGameDescriptor(await readGameDescriptor(descriptorFile.data), game);
          if (descriptor) Object.assign(game, descriptor);
        }
      } catch (err) {
        console.error(err);
      }
    }
    return Promise.all(
      games.map(async (game) => {
        const file = game.file.slice(game.file.lastIndexOf('/') + 1);
        const loadConfig = await storage.prepareLoadConfig(game.id, file);
        return descriptorEntry(game, loadConfig);
      }),
    );
  }
  const rootGameFile = findRootGameFileFolder(root);
  if (rootGameFile) {
    const [gameFolder, filename] = rootGameFile;
    const game_id = archiveGameId(archiveName, rootDescriptor);
    await storeFolderContent(game_id, gameFolder);
    if (rootDescriptor) {
      const descriptorContent = stringify({ game: [rootDescriptor] } as unknown as JsonMap);
      await storage.addGameResource(game_id, GAME_DESCRIPTOR_NAME, new TextEncoder().encode(descriptorContent).buffer);
    }
    const loadConfig = await storage.prepareLoadConfig(game_id, filename);
    return [archiveFallbackEntry(archiveName, loadConfig, rootDescriptor)];
  }

  throw new Error('Game files not found inside archive');
}

async function readGameDescriptor(data: Uint8Array): Promise<GameDescriptor[]> {
  const descriptor = parseToml<PlayerConfig>(decodeText(data));
  return descriptor.game;
}

async function storeFolderContent(game_id: string, folder: FileDir, prefix = ''): Promise<void> {
  const storage = getStorage();
  for (const entry of folder.content) {
    if (entry.type === 'dir') {
      await storeFolderContent(game_id, entry, `${prefix}${entry.name}/`);
    } else {
      if (entry.name === '.DS_Store') continue;
      await storage.addGameResource(game_id, `${prefix}${entry.name}`, entry.data.slice().buffer);
    }
  }
}
