import { t } from 'i18next';
import { addImported, goToGame, loadGamesFromStorage, locationSettled, navigateTo } from '@qspider/game-shelf';
import {
  baseInit$,
  initDeferred$,
  initQspApi,
  initTheme,
  initialBaseUrl$,
  onGameEnd$,
  registerDefaultThemes,
  showError,
  startupFinished$,
} from '@qspider/game-state';
import { getLaunchFilePath, importDesktop } from '@qspider/desktop';
import { loadingMessage$ } from '@qspider/renderer';
import { prepareBaseUrl } from '@qspider/utils';

import { checkForUpdates, markStartup, setupEnv } from '@qspider/env';

setupEnv();
markStartup('script');

/**
 * Starts the player. A failure is shown instead of leaving the loader up for good: on the loader (its
 * message) while the player shell is not rendered yet, else as an error alert.
 */
export async function init(): Promise<void> {
  try {
    await startUp();
  } catch (err) {
    markStartup('failed');
    console.error('Player start-up failed:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (baseInit$.value) showError(message);
    else loadingMessage$.set(message);
  }
}

async function startUp(): Promise<void> {
  markStartup('init');
  void checkForUpdates();
  initialBaseUrl$.set(prepareBaseUrl(window.location.href));
  initTheme();
  onGameEnd$.set(() => navigateTo(''));

  await loadGamesFromStorage();
  markStartup('storage');

  const filePath = await getLaunchFilePath();
  markStartup('launch-path');
  let toRun: string | null = null;
  if (filePath) {
    try {
      const imported = await importDesktop(filePath);
      toRun = addImported(imported, t) ?? null;
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    }
  }
  markStartup('imported');
  baseInit$.set(true);
  initDeferred$.value.resolve();
  await initQspApi();
  markStartup('qsp-api');
  await registerDefaultThemes(initialBaseUrl$.value);
  markStartup('themes');
  if (toRun) {
    goToGame(toRun);
    await locationSettled();
    markStartup('game');
  }
  markStartup('finished');
  startupFinished$.set(true);
}
