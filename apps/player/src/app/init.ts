import {
  games$,
  goToGame,
  loadGamesFromStorage,
  moveToShelf,
  navigateTo,
  processLocationChange,
  qspCatalogList$,
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
} from '@qspider/game-state';
import { importUrl } from '@qspider/importers';
import { loadQspCatalog } from '@qspider/game-shelf';
import { loadingMessage$ } from '@qspider/renderer';
import i18n from '@qspider/i18n';
import { prepareBaseUrl } from '@qspider/utils';

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
    const imported = await importUrl(toImport);
    for (const entry of imported) {
      if (!games$.value[entry.id]) {
        games$.actions.add(entry.id, entry);
      }
    }
    toRun = imported[0].id;
  }
  const catalogId = urlParams.get('catalogId');
  if (catalogId) {
    let existing;
    for (const [id, game] of Object.entries(games$.value)) {
      if (game.meta?.source_id === catalogId) {
        existing = id;
        break;
      }
    }
    if (!existing) {
      await loadQspCatalog();
      const catalogGame = qspCatalogList$.value.find((game) => game.id === Number(catalogId));
      if (catalogGame) {
        loadingMessage$.set(i18n.t('Loading game from catalog...'));
        const [imported] = await moveToShelf(catalogGame);
        if (imported) {
          toRun = imported.id;
        }
        loadingMessage$.set('');
      } else {
        showError(i18n.t(`Game with id {{catalogId}} not found in catalog`, { catalogId }));
      }
    } else {
      toRun = existing;
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
}
