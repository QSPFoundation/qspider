import { IGameManager } from '@qspider/contracts';
import { cyrb53 } from '@qspider/utils';
import { tauri, path } from '@tauri-apps/api';

export async function openGameFromDisk(file_path: string, gameManager: IGameManager): Promise<void> {
  const uuid = await tauri.invoke('prepare_game_start', { path: file_path });
  const name = await path.basename(file_path);

  let url = `qsp://${uuid}/${name}`;
  if (navigator.userAgent.includes('Windows')) {
    url = `https://qsp.${uuid}/${name}`;
  }
  gameManager.openGameDescriptor(
    {
      id: cyrb53(file_path),
      mode: url.endsWith('aqsp') ? 'aero' : 'classic',
      title: '',
      file: url,
    },
    false
  );
}

export function isSupportedFileType(path: string): boolean {
  return path.endsWith('.qsp') || path.endsWith('.aqsp') || path.endsWith('zip');
}
