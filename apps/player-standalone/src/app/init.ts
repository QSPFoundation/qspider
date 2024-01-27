import {
  baseInit$,
  importUrl,
  initDeferred$,
  initQspApi,
  initialBaseUrl$,
  onGameEnd$,
  registerDefaultThemes,
  runGame,
  windowManager$,
} from '@qspider/game-state';
import { windowManager } from '@qspider/window-manager';

declare const APP_MODE: string;

export async function init(): Promise<void> {
  document.body.classList.add(`mode-${APP_MODE}`);
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  let baseUrl = url.toString();
  if (!baseUrl.endsWith('/')) {
    baseUrl = `${baseUrl}/`;
  }
  initialBaseUrl$.set(baseUrl);
  windowManager$.set(windowManager);
  onGameEnd$.set(() => {
    windowManager.closeWindow();
  });

  const configUrl = new URL('game/game.cfg', baseUrl);
  const imported = await importUrl(configUrl.toString());
  initDeferred$.value.resolve();
  await initQspApi();
  await registerDefaultThemes(initialBaseUrl$.value);
  await runGame(imported[0]);
  baseInit$.set(true);
}
