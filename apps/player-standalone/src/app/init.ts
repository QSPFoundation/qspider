import {
  baseInit$,
  importUrl,
  initDeferred$,
  initQspApi,
  initialBaseUrl$,
  registerDefaultThemes,
  runGame,
} from '@qspider/game-state';

export async function init(): Promise<void> {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  initialBaseUrl$.set(url.toString());
  const configUrl = new URL('game/game.cfg', url.toString());
  const imported = await importUrl(configUrl.toString());
  initDeferred$.value.resolve();
  await initQspApi();
  await registerDefaultThemes(initialBaseUrl$.value);
  await runGame(imported[0]);
  baseInit$.set(true);
}
