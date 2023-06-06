import { GameDescriptor, PlayerConfig } from '@qspider/contracts';
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'iarna-toml-esm';
import { importArchive } from './archive-importer';
import { isSupportedArchive } from '../utils';
import { cyrb53 } from '@qspider/utils';

export async function importDesktop(filePath: string): Promise<GameDescriptor[]> {
  const { path, tauri } = await import('@tauri-apps/api');
  if (!(await path.isAbsolute(filePath))) filePath = await path.resolve(filePath);

  const uuid = uuidv4();
  await tauri.invoke('prepare_game_start', { path: filePath, id: uuid });

  const name = await path.basename(filePath);

  let urlPrefix = `qsp://${uuid}/`;
  if (navigator.userAgent.includes('Windows')) {
    urlPrefix = `https://qsp.${uuid}/`;
  }

  const content = await fetch(`${urlPrefix}${name}`).then((r) => r.arrayBuffer());
  if (isSupportedArchive(content)) return importArchive(name, content);

  const gameConfigUrl = `${urlPrefix}game.cfg`;

  try {
    const rawConfig = await fetch(gameConfigUrl).then((r) => r.text());
    const config = parse(rawConfig) as unknown as PlayerConfig;
    if (config.game.length === 1) {
      return config.game;
    } else {
      const found = config.game.find((game) => game.file === name);
      if (!found) throw new Error('Config not found');
      return [found];
    }
    // descriptor.local_path = filePath;
    // descriptor.local_id = uuid;
    // descriptor.file = `${urlPrefix}${name}`;
  } catch (err) {
    return [
      {
        id: cyrb53(filePath),
        title: name,
        mode: name.endsWith('aqsp') ? 'aero' : 'classic',
        file: `${urlPrefix}${name}`,
      },
    ];
  }
}
