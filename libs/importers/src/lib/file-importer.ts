import { cyrb53 } from '@qspider/utils';
import { isSupportedArchive } from './utils';
import { importArchive } from './archive-importer';
import { GameShelfEntry } from '@qspider/contracts';
import { storage$ } from '@qspider/game-state';

export async function importFile(fileName: string, content: ArrayBuffer): Promise<GameShelfEntry[]> {
  if (!storage$.value) throw new Error('missing storage');
  if (isSupportedArchive(content)) return importArchive(fileName, content);
  const game_id = cyrb53(fileName);
  await storage$.value?.addGameResource(game_id, fileName, content);
  return [
    {
      id: cyrb53(fileName),
      title: fileName,
      mode: 'classic',
      loadConfig: await storage$.value.prepareLoadConfig(game_id, fileName),
    },
  ];
}
