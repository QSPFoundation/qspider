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

import { checkForUpdates, setupEnv } from '@qspider/env';

setupEnv();

/**
 * Starts the player. A failure is shown instead of leaving the loader up for good: on the loader (its
 * message) while the player shell is not rendered yet, else as an error alert.
 */
export async function init(): Promise<void> {
  try {
    await startUp();
  } catch (err) {
    console.error('Player start-up failed:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (baseInit$.value) showError(message);
    else loadingMessage$.set(message);
  }
}

async function startUp(): Promise<void> {
  void checkForUpdates();
  initialBaseUrl$.set(prepareBaseUrl(window.location.href));
  initTheme();
  onGameEnd$.set(() => navigateTo(''));

  await loadGamesFromStorage();

  const filePath = await getLaunchFilePath();
  let toRun: string | null = null;
  if (filePath) {
    try {
      const imported = await importDesktop(filePath);
      toRun = addImported(imported, t) ?? null;
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    }
  }
  baseInit$.set(true);
  initDeferred$.value.resolve();
  await initQspApi();
  await registerDefaultThemes(initialBaseUrl$.value);
  if (toRun) {
    goToGame(toRun);
    await locationSettled();
  }
  startupFinished$.set(true);
}
