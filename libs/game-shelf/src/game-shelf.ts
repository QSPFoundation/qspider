import { GameDescriptor } from '@qspider/contracts';
import { currentGame$, initDefered$, runGame, stopCurrentGame, storage$ } from '@qspider/game-state';
import { create } from 'xoid';
import history from 'history/browser';

interface GamesActions {
  add(id: string, data: GameDescriptor): void;
  update(id: string, data: Partial<GameDescriptor>): void;
  remove(id: string): void;
}

export function navigateTo(path: string): void {
  history.push(`?${path}`);
}
export function goToGame(id: string): void {
  navigateTo(`run=${id}`);
}

export const currentMode$ = create('shelf');

export const games$ = create<Record<string, GameDescriptor>, GamesActions>({}, (atom) => {
  return {
    add(id: string, data: GameDescriptor): void {
      storage$.value?.addGame(id, data).catch(console.error);
      atom.update((s) => ({
        ...s,
        [id]: data,
      }));
    },
    update(id: string, data: Partial<GameDescriptor>): void {
      storage$.value?.updateGame(id, data).catch(console.error);
      atom.update((s) => ({
        ...s,
        [id]: {
          ...(s[id] || {}),
          ...data,
        },
      }));
    },
    remove(id): void {
      storage$.value?.removeGame(id).catch(console.error);
      atom.update((s) => {
        const { [id]: _, ...rest } = s;
        return rest;
      });
    },
  };
});

export const gamesList$ = create((get) => Object.values(get(games$)).sort((a, b) => a.title.localeCompare(b.title)));

history.listen(({ location }) => {
  processLocationChange(location.search);
});

export async function processLocationChange(location: string): Promise<void> {
  const search = new URLSearchParams(location);
  const game_id = search.get('run');
  if (game_id) {
    await initDefered$.value.promise;
    const descriptor = games$.value[game_id];
    await runGame(descriptor);
    currentMode$.set('game');
  } else if (search.has('catalog')) {
    if (currentGame$.value) stopCurrentGame();
    currentMode$.set('catalog');
  } else {
    if (currentGame$.value) stopCurrentGame();
    currentMode$.set('shelf');
  }
}

export async function loadGamesFromStorage(): Promise<void> {
  const games = await storage$.value?.getGames();
  if (games) {
    games$.set(games);
  }
}
