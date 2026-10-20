import { GameShelfEntry, PlayerConfig } from '@qspider/contracts';
import { v4 as uuidv4 } from 'uuid';
import { invoke } from '@tauri-apps/api/core';
import { basename, dirname, isAbsolute, resolve } from '@tauri-apps/api/path';
import { importArchive, isSupportedArchive } from '@qspider/importers';
import { cyrb53, parseToml } from '@qspider/utils';
import { fetchBinaryContent, fetchTextContent } from './data-fetcher';
import { entriesFromConfig } from './config-entries';
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

  if (name === 'game.cfg') {
    const entries = entriesFromConfig(
      parseToml<PlayerConfig>(new TextDecoder().decode(content)),
      urlPrefix,
      fileDir,
      uuid,
    );
    if (!entries.length) throw new Error('No games listed in game.cfg');
    return entries;
  }

  try {
    const rawConfig = await fetchTextContent(urlPrefix, 'game.cfg');
    const config = parseToml<PlayerConfig>(rawConfig);
    const found = entriesFromConfig(config, urlPrefix, fileDir, uuid).find(
      (entry) => entry.loadConfig.entrypoint === name,
    );
    if (!found) throw new Error('Config not found');
    return [found];
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
