import { games$, goToGame, loadGamesFromStorage, navigateTo } from '@qspider/game-shelf';
import {
  baseInit$,
  importDesktop,
  initDefered$,
  initQspApi,
  initTheme,
  onGameEnd$,
  platform$,
  showError,
  storage$,
  windowManager$,
} from '@qspider/game-state';
import { TauriStorage } from '@qspider/tauri-storage';
import { cli, os } from '@tauri-apps/api';
import { windowManager } from './window-manager';

export async function init(): Promise<void> {
  fillPlatform();
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
      toRun && goToGame(toRun);
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    }
  }

  baseInit$.set(true);
  initDefered$.value.resolve();
  await initQspApi();
  if (toRun) {
    goToGame(toRun);
  }
}

const platformsMap = {
  Darwin: 'Macintosh',
  Linux: 'Linux',
  Windows_NT: 'Windows',
};
function fillPlatform(): void {
  os.type().then((type) => {
    const resolved = platformsMap[type];
    if (resolved) platform$.set(resolved);
  });
}
