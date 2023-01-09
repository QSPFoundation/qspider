import { GameDescriptor, PlayerConfig } from '@qspider/contracts';
import {
  baseInit$,
  games$,
  goToGame,
  initDefered$,
  initQspApi,
  loadGamesFromConfig,
  loadGamesFromStorage,
  showError,
  storage$,
  windowManager$,
} from '@qspider/game-state';
import { cyrb53, fetchProxyFallback } from '@qspider/utils';
import { WebStorage } from '@qspider/web-storage';
import { use } from 'xoid';
import TOMLparse from '@iarna/toml/parse-string';
import { windowManager } from './window-manager';

export async function init(): Promise<void> {
  storage$.set(new WebStorage());
  windowManager$.set(windowManager);
  await loadGamesFromStorage();
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const configUrl = urlParams.get('config');
  const gameUrl = urlParams.get('game');
  let toRun: string | null = null;
  if (gameUrl) {
    const base = gameUrl.slice(0, gameUrl.lastIndexOf('/') + 1);
    const gameConfigUrl = `${base}game.cfg`;
    const filename = gameUrl.slice(gameUrl.lastIndexOf('/') + 1);
    let id: string;
    let descriptor: GameDescriptor;
    const response = await fetchProxyFallback(gameUrl);
    if (response.ok) {
      try {
        const rawConfig = await fetchProxyFallback(gameConfigUrl).then((r) => r.text());
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
        showError(err instanceof Error ? err.message : String(err));
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
      toRun = id;
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
  initDefered$.value.resolve();
  await initQspApi();
  if (toRun) {
    goToGame(toRun);
  }
}
