import { t } from 'i18next';
import { goToGame, loadGamesFromStorage, locationSettled, navigateTo } from '@qspider/game-shelf';
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
import { addImported } from './add-imported';
import { prepareBaseUrl } from '@qspider/utils';

import { checkForUpdates, setupEnv } from '@qspider/env';

setupEnv();

export async function init(): Promise<void> {
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
