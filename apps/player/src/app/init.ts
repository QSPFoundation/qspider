import { GameDescriptor, PlayerConfig } from '@qspider/contracts';
import {
  baseInit$,
  games$,
  initQspApi,
  loadGamesFromConfig,
  loadGamesFromStorage,
  runGame,
  storage$,
} from '@qspider/game-state';
import { cyrb53 } from '@qspider/utils';
import { WebStorage } from '@qspider/web-storage';
import { use } from 'xoid';
import TOMLparse from '@iarna/toml/parse-string';

export async function init(): Promise<void> {
  storage$.set(new WebStorage());
  await loadGamesFromStorage();
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const configUrl = urlParams.get('config');
  const gameUrl = urlParams.get('game');
  if (gameUrl) {
    const base = gameUrl.slice(0, gameUrl.lastIndexOf('/') + 1);
    const gameConfigUrl = `${base}game.cfg`;
    const filename = gameUrl.slice(gameUrl.lastIndexOf('/') + 1);
    let id: string;
    let descriptor: GameDescriptor;
    const response = await fetch(gameUrl);
    if (response.ok) {
      try {
        const rawConfig = await fetch(gameConfigUrl).then((r) => r.text());
        const config = TOMLparse(rawConfig) as unknown as PlayerConfig;
        if (config.game.length === 1) {
          [descriptor] = config.game;
        } else {
          const found = config.game.find((game) => game.file === filename);
          if (!found) throw new Error('Config not found');
          descriptor = found;
        }
        id = descriptor.id;
      } catch (err) {
        console.log(err);
        id = cyrb53(gameUrl);
        descriptor = {
          id,
          title: filename,
          mode: gameUrl.endsWith('aqsp') ? 'aero' : 'classic',
          file: gameUrl,
        };
      }
      const existingGame = games$.value[id];
      if (!existingGame) {
        use(games$).add(id, descriptor);
      }
    }
  } else if (configUrl) {
    const games = await loadGamesFromConfig(configUrl);
    for (const game of games) {
      use(games$).add(game.id, game);
    }
  } else if (!Object.keys(games$.value).length) {
    const games = await loadGamesFromConfig(`game/game.cfg`);
    for (const game of games) {
      use(games$).add(game.id, game);
    }
  }
  baseInit$.set(true);
  await initQspApi();
  if (Object.keys(games$.value).length === 1) {
    const [id] = Object.keys(games$.value);
    await runGame(id);
  }
}