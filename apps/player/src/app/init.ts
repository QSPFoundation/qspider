import { GameDescriptor, PlayerConfig } from '@qspider/contracts';
import { games$, goToGame, loadGamesFromStorage, navigateTo, processLocationChange } from '@qspider/game-shelf';
import {
  baseInit$,
  initDefered$,
  initQspApi,
  initTheme,
  loadGamesFromConfig,
  onGameEnd$,
  showError,
  storage$,
  windowManager$,
} from '@qspider/game-state';
import { cyrb53, fetchProxyFallback } from '@qspider/utils';
import { WebStorage } from '@qspider/web-storage';
import { parse } from 'iarna-toml-esm';
import { windowManager } from './window-manager';

export async function init(): Promise<void> {
  onGameEnd$.set(() => navigateTo(''));
  initTheme();
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
        const config = parse(rawConfig) as unknown as PlayerConfig;
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
        games$.actions.add(id, descriptor);
      }
      toRun = id;
    }
  } else if (configUrl) {
    const games = await loadGamesFromConfig(configUrl);
    for (const game of games) {
      games$.actions.add(game.id, game);
    }
  }
  initDefered$.value.resolve();
  await initQspApi();
  if (toRun) {
    goToGame(toRun);
  } else {
    processLocationChange(window.location.search);
  }
  baseInit$.set(true);
}
