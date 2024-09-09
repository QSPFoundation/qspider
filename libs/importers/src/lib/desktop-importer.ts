import { GameShelfEntry, PlayerConfig } from '@qspider/contracts';
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'iarna-toml-esm';
import { importArchive } from './archive-importer';
import { isSupportedArchive } from './utils';
import { cyrb53 } from '@qspider/utils';
import { fetchBinaryContent, fetchTextContent } from '@qspider/env';

function buildGameUrl(uuid: string): string {
  return navigator.userAgent.includes('Windows') ? `https://qsp.${uuid}/` : `qsp://${uuid}/`;
}

export async function importDesktop(filePath: string): Promise<GameShelfEntry[]> {
  const { path, tauri } = await import('@tauri-apps/api');
  if (!(await path.isAbsolute(filePath))) filePath = await path.resolve(filePath);
  const uuid = uuidv4();
  const name = await path.basename(filePath);
  const fileDir = await path.dirname(filePath);
  await tauri.invoke('prepare_game_start', { path: fileDir, id: uuid });

  const urlPrefix = buildGameUrl(uuid);

  const content = await fetchBinaryContent(urlPrefix, name);
  if (isSupportedArchive(content)) {
    return await importArchive(name, content);
  }

  try {
    const rawConfig = await fetchTextContent(urlPrefix, 'game.cfg');
    const config = parse(rawConfig) as unknown as PlayerConfig;
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
