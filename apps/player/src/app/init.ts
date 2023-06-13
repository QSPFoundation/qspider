import { games$, goToGame, loadGamesFromStorage, navigateTo, processLocationChange } from '@qspider/game-shelf';
import {
  baseInit$,
  importUrl,
  initDefered$,
  initQspApi,
  initTheme,
  initialBaseUrl$,
  onGameEnd$,
  storage$,
  windowManager$,
} from '@qspider/game-state';
import { WebStorage } from '@qspider/web-storage';
import { windowManager } from './window-manager';

export async function init(): Promise<void> {
  const baseTag = document.querySelector<HTMLBaseElement>('#page-base') as HTMLBaseElement;
  initialBaseUrl$.set(baseTag.href || '/');
  onGameEnd$.set(() => navigateTo(''));
  initTheme();
  storage$.set(new WebStorage());
  windowManager$.set(windowManager);
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
  initDefered$.value.resolve();
  await initQspApi();
  if (toRun) {
    goToGame(toRun);
  } else {
    await processLocationChange(window.location.search);
  }
  baseInit$.set(true);
}
