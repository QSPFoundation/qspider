import {
  baseInit$,
  initDeferred$,
  initQspApi,
  initialBaseUrl$,
  onGameEnd$,
  registerDefaultThemes,
  runGame,
  windowManager$,
} from '@qspider/game-state';
import { windowManager } from '@qspider/window-manager';
import { prepareBaseUrl } from '@qspider/utils';
import { runConfig } from './config-runner';

declare const APP_MODE: string;

export async function init(): Promise<void> {
  document.body.classList.add(`mode-${APP_MODE}`);
  initialBaseUrl$.set(prepareBaseUrl(window.location.href));
  windowManager$.set(windowManager);
  onGameEnd$.set(() => {
    windowManager.closeWindow();
  });

  const configUrl = new URL('game/game.cfg', initialBaseUrl$.value);
  const game = await runConfig(configUrl.toString());
  initDeferred$.value.resolve();
  await initQspApi();
  await registerDefaultThemes(initialBaseUrl$.value);
  await runGame(game);
  baseInit$.set(true);
}
