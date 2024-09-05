import { games$, goToGame, loadGamesFromStorage, navigateTo } from '@qspider/game-shelf';
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
import { importDesktop } from '@qspider/importers';
import { cli } from '@tauri-apps/api';
import { prepareBaseUrl } from '@qspider/utils';

export async function init(): Promise<void> {
  initialBaseUrl$.set(prepareBaseUrl(window.location.href));
  initTheme();
  onGameEnd$.set(() => navigateTo(''));

  await loadGamesFromStorage();

  const matches = await cli.getMatches();
  const filePath = (matches.args.file.value || matches.args.filePath.value) as string | undefined;
  let toRun: string | null = null;
  if (filePath) {
    try {
      const imported = await importDesktop(filePath);
      for (const entry of imported) {
        if (!games$.value[entry.id]) {
          games$.actions.add(entry.id, entry);
        }
      }
      toRun = imported[0].id;
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
  }
}
