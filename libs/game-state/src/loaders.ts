import TOMLparse from '@iarna/toml/parse-string';
import { GameDescriptor, PlayerConfig } from '@qspider/contracts';

export async function loadGamesFromConfig(path: string): Promise<GameDescriptor[]> {
  const data = await fetch(path)
    .then((r) => r.text())
    .then((text) => TOMLparse(text) as unknown as PlayerConfig);
  const configPath = path.slice(0, path.lastIndexOf('/') + 1);

  return data.game.map((game) => ({
    ...game,
    file: configPath + game.file,
  }));
}
