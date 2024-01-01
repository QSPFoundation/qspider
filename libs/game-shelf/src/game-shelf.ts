import { GameShelfEntry } from '@qspider/contracts';
import { currentGameEntry$, initDefered$, runGame, stopCurrentGame, storage$ } from '@qspider/game-state';
import { create } from 'xoid';
import history from 'history/browser';

interface GamesActions {
  add(id: string, data: GameShelfEntry): void;
  update(id: string, data: Partial<GameShelfEntry>): void;
  remove(id: string): void;
}

export function navigateTo(path: string): void {
  history.push(`?${path}`);
}
export function goToGame(id: string): void {
  navigateTo(`run=${id}`);
}

export const currentMode$ = create('shelf');

export const games$ = create<Record<string, GameShelfEntry>, GamesActions>({}, (atom) => {
  return {
    add(id: string, data: GameShelfEntry): void {
      storage$.value?.addGame(id, data).catch(console.error);
      atom.update((s) => ({
        ...s,
        [id]: data,
      }));
    },
    update(id: string, data: Partial<GameShelfEntry>): void {
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
export const gameSourceMap$ = create((get) => {
  const map = new Map<string, Set<string>>();
  for (const game of Object.values(get(games$))) {
    if (game.meta?.source) {
      const set = map.get(game.meta.source) ?? new Set();
      set.add(game.meta.source_id);
      map.set(game.meta.source, set);
    }
  }
  return map;
});

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
    if (currentGameEntry$.value) stopCurrentGame();
    currentMode$.set('catalog');
  } else {
    if (currentGameEntry$.value) stopCurrentGame();
    currentMode$.set('shelf');
  }
}

export async function loadGamesFromStorage(): Promise<void> {
  const games = await storage$.value?.getGames();
  if (games) {
    games$.set(games);
  }
}
