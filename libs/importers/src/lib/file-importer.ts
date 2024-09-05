import { cyrb53 } from '@qspider/utils';
import { isSupportedArchive } from './utils';
import { importArchive } from './archive-importer';
import { GameShelfEntry } from '@qspider/contracts';
import { getStorage } from '@qspider/env';

export async function importFile(fileName: string, content: ArrayBuffer): Promise<GameShelfEntry[]> {
  const storage = getStorage();
  if (!storage) throw new Error('missing storage');
  if (isSupportedArchive(content)) return importArchive(fileName, content);
  const game_id = cyrb53(fileName);
  await storage.addGameResource(game_id, fileName, content);
  return [
    {
      id: cyrb53(fileName),
      title: fileName,
      mode: 'classic',
      loadConfig: await storage.prepareLoadConfig(game_id, fileName),
    },
  ];
}
