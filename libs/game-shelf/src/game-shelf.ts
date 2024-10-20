import { GameShelfEntry } from '@qspider/contracts';
import {
  currentGame$,
  currentGameEntry$,
  initDeferred$,
  initialBaseUrl$,
  onClosePauseScreen,
  onOpenPauseScreen,
  runGame,
  stopCurrentGame,
} from '@qspider/game-state';
import { atom } from 'xoid';
import history from 'history/browser';
import { getStorage } from '@qspider/env';

interface GamesActions {
  add(id: string, data: GameShelfEntry): void;
  update(id: string, data: Partial<GameShelfEntry>): void;
  remove(id: string): void;
}

export function navigateTo(path: string): void {
  history.push(`?${path}`);
}
export function goToGame(id: string): void {
  history.push(`${initialBaseUrl$.value}?run=${id}`, { pause: false });
}

export const currentMode$ = atom('shelf');

export const games$ = atom<Record<string, GameShelfEntry>, GamesActions>({}, (atom) => {
  return {
    add(id: string, data: GameShelfEntry): void {
      getStorage().addGame(id, data).catch(console.error);
      atom.update((s) => ({
        ...s,
        [id]: data,
      }));
    },
    update(id: string, data: Partial<GameShelfEntry>): void {
      getStorage().updateGame(id, data).catch(console.error);
      atom.update((s) => ({
        ...s,
        [id]: {
          ...(s[id] || {}),
          ...data,
        },
      }));
    },
    remove(id): void {
      getStorage().removeGame(id).catch(console.error);
      atom.update((s) => {
        const { [id]: _, ...rest } = s;
        return rest;
      });
    },
  };
});

export const gamesList$ = atom((get) => Object.values(get(games$)).sort((a, b) => a.title.localeCompare(b.title)));
export const gameSourceMap$ = atom((get) => {
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
    if (currentGame$.value?.id === game_id) {
      if (search.has('pause')) {
        onOpenPauseScreen();
      } else {
        onClosePauseScreen();
      }
      return;
    }
    await initDeferred$.value.promise;
    const descriptor = games$.value[game_id];
    await runGame(descriptor);
    if (search.has('pause')) {
      onOpenPauseScreen();
    }
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
  const games = await getStorage().getGames();
  if (games) {
    games$.set(games);
  }
}
