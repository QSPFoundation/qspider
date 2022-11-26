import { GameDescriptor } from '@qspider/contracts';
import { create } from 'xoid';
import { games$ } from './game-shelf';
import { storage$ } from './storage';
import { basePath$, clearResources, fillLocalFS, mainFileSource$ } from './resources';
import { convertQsps, isZip } from './utils';
import { qspApi$ } from './qsp-api';

export const currentGame$ = create<GameDescriptor | null>();

export async function runGame(id: string): Promise<void> {
  const descriptor = games$.value?.[id];
  if (!descriptor) throw new Error('Game not found');
  const { file } = descriptor;
  const source = await storage$.value?.getGameSource(id);
  if (source) {
    fillLocalFS(source, file);
  } else {
    const source = await fetch(file).then((r) => r.arrayBuffer());
    if (isZip(source.slice(0, 4))) {
      fillLocalFS(source, file);
    } else {
      const isQsps = file.toLowerCase().endsWith('.qsps');
      if (isQsps) {
        const gameSource = convertQsps(source);
        mainFileSource$.set(new Uint8Array(gameSource));
      } else mainFileSource$.set(new Uint8Array(source));
      basePath$.set(file.slice(0, file.lastIndexOf('/') + 1));
    }
  }

  const gameSource = mainFileSource$.value;
  if (!gameSource) throw new Error('Failed to load game');
  currentGame$.set(descriptor);
  qspApi$.value?.openGame(gameSource, true);
  qspApi$.value?.restartGame();
}

export function stopCurrentGame(): void {
  currentGame$.set(null);
  clearResources();
}
