import { games$, goToGame, loadGamesFromStorage, navigateTo } from '@qspider/game-shelf';
import {
  baseInit$,
  importDesktop,
  initDeferred$,
  initQspApi,
  initTheme,
  initialBaseUrl$,
  onGameEnd$,
  registerDefaultThemes,
  showError,
  storage$,
  windowManager$,
} from '@qspider/game-state';
import { TauriStorage } from '@qspider/tauri-storage';
import { cli } from '@tauri-apps/api';
import { windowManager } from '@qspider/tauri-window-manager';

export async function init(): Promise<void> {
  // eslint-disable-next-line no-restricted-globals
  initialBaseUrl$.set(location.origin + '/');
  initTheme();
  onGameEnd$.set(() => navigateTo(''));
  storage$.set(new TauriStorage());
  windowManager$.set(windowManager);
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
