import { GameDescriptor, PlayerConfig } from '@qspider/contracts';
import { cyrb53 } from '@qspider/utils';
import { tauri, path } from '@tauri-apps/api';
import TOMLparse from '@iarna/toml/parse-string';
import { use } from 'xoid';
import { games$ } from '@qspider/game-state';
import { v4 as uuidv4 } from 'uuid';

export async function prepareGameFromDisk(filePath: string): Promise<string> {
  const uuid = uuidv4();
  await tauri.invoke('prepare_game_start', { path: filePath, id: uuid });
  const name = await path.basename(filePath);

  let urlPrefix = `qsp://${uuid}/`;
  if (navigator.userAgent.includes('Windows')) {
    urlPrefix = `https://qsp.${uuid}/`;
  }

  const gameConfigUrl = `${urlPrefix}game.cfg`;
  let id: string;
  let descriptor: GameDescriptor;
  try {
    const rawConfig = await fetch(gameConfigUrl).then((r) => r.text());
    const config = TOMLparse(rawConfig) as unknown as PlayerConfig;
    if (config.game.length === 1) {
      [descriptor] = config.game;
    } else {
      const found = config.game.find((game) => game.file === name);
      if (!found) throw new Error('Config not found');
      descriptor = found;
    }
    id = descriptor.id;
    descriptor.local_path = filePath;
    descriptor.local_id = uuid;
    descriptor.file = `${urlPrefix}${name}`;
  } catch (err) {
    id = cyrb53(filePath);
    descriptor = {
      id,
      title: name,
      mode: name.endsWith('aqsp') ? 'aero' : 'classic',
      file: `${urlPrefix}${name}`,
      local_id: uuid,
      local_path: filePath,
    };
  }
  use(games$).update(id, descriptor);
  return id;
}
const supportedFileTypes = ['.qsp', '.qsps', '.aqsp', '.zip', '.rar'];
export function isSupportedFileType(path: string): boolean {
  return supportedFileTypes.some((ext) => path.endsWith(ext));
}
