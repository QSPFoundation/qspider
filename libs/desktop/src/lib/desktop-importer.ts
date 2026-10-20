import { GameShelfEntry, PlayerConfig } from '@qspider/contracts';
import { v4 as uuidv4 } from 'uuid';
import { invoke } from '@tauri-apps/api/core';
import { basename, dirname, isAbsolute, resolve } from '@tauri-apps/api/path';
import { importArchive, isSupportedArchive } from '@qspider/importers';
import { cyrb53, parseToml } from '@qspider/utils';
import { fetchBinaryContent, fetchTextContent } from './data-fetcher';
import { buildGameUrl } from './game-url';

export async function importDesktop(filePath: string): Promise<GameShelfEntry[]> {
  if (!(await isAbsolute(filePath))) filePath = await resolve(filePath);
  const uuid = uuidv4();
  const name = await basename(filePath);
  const fileDir = await dirname(filePath);
  await invoke('prepare_game_start', { path: fileDir, id: uuid });

  const urlPrefix = buildGameUrl(uuid);

  const content = await fetchBinaryContent(urlPrefix, name);
  if (isSupportedArchive(content)) {
    return await importArchive(name, content);
  }

  try {
    const rawConfig = await fetchTextContent(urlPrefix, 'game.cfg');
    const config = parseToml<PlayerConfig>(rawConfig);
    const found = config.game.find((game) => game.file === name);
    if (!found) throw new Error('Config not found');
    return [
      {
        id: found.id,
        mode: found.mode,
        title: found.title,
        author: found.author,
        ported_by: found.ported_by,
        version: found.version,
        description: found.description,
        icon: found.resources?.icon ? `${urlPrefix}${found.resources.icon}` : undefined,
        loadConfig: {
          url: urlPrefix,
          entrypoint: found.file,
          local_path: fileDir,
          local_id: uuid,
        },
      },
    ];
  } catch {
    return [
      {
        id: cyrb53(filePath),
        title: name,
        mode: 'classic',
        loadConfig: {
          url: urlPrefix,
          entrypoint: name,
          local_path: fileDir,
          local_id: uuid,
        },
      },
    ];
  }
}
