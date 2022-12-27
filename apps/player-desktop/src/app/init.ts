import {
  baseInit$,
  games$,
  initQspApi,
  loadGamesFromConfig,
  loadGamesFromStorage,
  platform$,
  runGame,
  showError,
  // storage$,
  windowManager$,
} from '@qspider/game-state';
import { cli, os, path } from '@tauri-apps/api';
import { use } from 'xoid';
import { prepareGameFromDisk } from './utils';
import { windowManager } from './window-manager';

export async function init(): Promise<void> {
  fillPlatform();
  // storage$.set(new WebStorage());
  windowManager$.set(windowManager);
  await loadGamesFromStorage();

  const matches = await cli.getMatches();
  const filePath = (matches.args.file.value || matches.args.filePath.value) as string | undefined;
  let toRun: string | null = null;
  if (filePath) {
    try {
      if (await path.isAbsolute(filePath)) {
        toRun = await prepareGameFromDisk(filePath);
      } else {
        const resolvedPath = await path.resolve(filePath);
        toRun = await prepareGameFromDisk(resolvedPath);
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    }
  } else if (!Object.keys(games$.value).length) {
    const games = await loadGamesFromConfig(`https://qspfoundation.github.io/qspider/game/game.cfg`);
    for (const game of games) {
      use(games$).add(game.id, game);
    }
  }

  baseInit$.set(true);
  await initQspApi();
  if (toRun) {
    runGame(toRun);
  } else if (Object.keys(games$.value).length === 1) {
    const [id] = Object.keys(games$.value);
    try {
      await runGame(id);
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    }
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
