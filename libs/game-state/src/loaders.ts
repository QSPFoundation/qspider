import { GameDescriptor, PlayerConfig } from '@qspider/contracts';
import { fetchProxyFallback, parseToml } from '@qspider/utils';
import { directoryOf } from './engine-event-logic';

export async function loadGamesFromConfig(path: string): Promise<GameDescriptor[]> {
  const data = await fetchProxyFallback(path)
    .then((r) => r.text())
    .then((text) => parseToml<PlayerConfig>(text));
  return data.game.map((game) => ({
    ...game,
    file: directoryOf(path) + game.file,
  }));
}
