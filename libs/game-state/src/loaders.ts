import { parse } from 'iarna-toml-esm';
import { GameDescriptor, PlayerConfig } from '@qspider/contracts';
import { fetchProxyFallback } from '@qspider/utils';

export async function loadGamesFromConfig(path: string): Promise<GameDescriptor[]> {
  // TODO? replace with loader
  const data = await fetchProxyFallback(path)
    .then((r) => r.text())
    .then((text) => parse(text) as unknown as PlayerConfig);
  const configPath = path.slice(0, path.lastIndexOf('/') + 1);

  return data.game.map((game) => ({
    ...game,
    file: configPath + game.file,
  }));
}
