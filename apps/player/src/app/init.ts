import {
  fetchCatalogGame,
  games$,
  goToGame,
  hasNewerVersion,
  loadGamesFromStorage,
  locationSettled,
  moveToShelf,
  navigateTo,
  processLocationChange,
} from '@qspider/game-shelf';
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
import { importUrl } from '@qspider/importers';
import { loadingMessage$ } from '@qspider/renderer';
import i18n from '@qspider/i18n';
import { prepareBaseUrl } from '@qspider/utils';
import { findCatalogEntry } from './catalog-launch';

import { setupEnv } from '@qspider/env';

setupEnv();

export async function init(): Promise<void> {
  initialBaseUrl$.set(prepareBaseUrl(window.location.href));
  onGameEnd$.set(() => navigateTo(''));
  initTheme();

  await loadGamesFromStorage();
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const configUrl = urlParams.get('config');
  const gameUrl = urlParams.get('game');
  const toImport = gameUrl || configUrl;
  let toRun: string | null = null;
  if (toImport) {
    try {
      const imported = await importUrl(toImport);
      for (const entry of imported) {
        // A URL import overwrites the shelf entry of the same id on every load (e2e defect 52 depends on it).
        games$.actions.add(entry.id, entry);
      }
      toRun = imported[0].id;
    } catch {
      showError(i18n.t(`Failed to load game from {{url}}`, { url: toImport }));
    } finally {
      loadingMessage$.set('');
    }
  }
  const catalogId = urlParams.get('catalogId');
  if (catalogId) {
    const existing = findCatalogEntry(games$.value, catalogId);
    if (!existing) {
      try {
        loadingMessage$.set(i18n.t('Loading game from catalog...'));
        const catalogGame = await fetchCatalogGame(catalogId);
        const [imported] = await moveToShelf(catalogGame);
        if (imported) {
          toRun = imported.id;
        }
      } catch {
        showError(i18n.t(`Game with id {{catalogId}} not found in catalog`, { catalogId }));
      } finally {
        loadingMessage$.set('');
      }
    } else {
      toRun = existing.id;
      try {
        loadingMessage$.set(i18n.t('Checking for updates...'));
        const catalogGame = await fetchCatalogGame(catalogId);
        if (hasNewerVersion(existing.meta?.source_date ?? 0, catalogGame.updated_at)) {
          loadingMessage$.set(i18n.t('Updating game from catalog...'));
          const [imported] = await moveToShelf(catalogGame);
          if (imported) {
            toRun = imported.id;
          }
        }
      } catch {
        // ignore update check failures, run existing version
      } finally {
        loadingMessage$.set('');
      }
    }
  }
  initDeferred$.value.resolve();
  await initQspApi();
  await registerDefaultThemes(initialBaseUrl$.value);
  if (toRun) {
    goToGame(toRun);
  } else {
    await processLocationChange(window.location.search);
  }
  baseInit$.set(true);
  // After the shell renders: the launch game (goToGame) starts asynchronously.
  await locationSettled();
  startupFinished$.set(true);
}
