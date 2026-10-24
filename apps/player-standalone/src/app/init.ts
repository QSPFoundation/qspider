import {
  baseInit$,
  initDeferred$,
  initQspApi,
  initialBaseUrl$,
  onClosePauseScreen,
  onGameEnd$,
  onOpenPauseScreen,
  registerDefaultThemes,
  runGame,
  startupFinished$,
} from '@qspider/game-state';
import { checkForUpdates, windowManager } from '@qspider/env';
import { prepareBaseUrl } from '@qspider/utils';
import { runConfig } from './config-runner';
import { setupEnv } from '@qspider/env';
import history from 'history/browser';

declare const APP_MODE: string;

setupEnv();

// The pause screen follows the history `pause` flag (openPauseScreen pushes it); counterpart: libs/game-shelf/src/game-shelf.ts.
function syncPauseScreen(search: string): void {
  if (new URLSearchParams(search).has('pause')) onOpenPauseScreen();
  else onClosePauseScreen();
}
history.listen(({ location }) => syncPauseScreen(location.search));

export async function init(): Promise<void> {
  void checkForUpdates();
  document.body.classList.add(`mode-${APP_MODE}`);
  initialBaseUrl$.set(prepareBaseUrl(window.location.href));
  onGameEnd$.set(() => {
    windowManager.closeWindow();
  });

  const configUrl = new URL('game/game.cfg', initialBaseUrl$.value);
  const game = await runConfig(configUrl.toString());
  initDeferred$.value.resolve();
  await initQspApi();
  await registerDefaultThemes(initialBaseUrl$.value);
  await runGame(game);
  if (new URLSearchParams(window.location.search).has('pause')) onOpenPauseScreen();
  baseInit$.set(true);
  startupFinished$.set(true);
}
