import { GameShelfEntry } from '@qspider/contracts';
import {
  currentGame$,
  currentGameEntry$,
  initDeferred$,
  onClosePauseScreen,
  onOpenPauseScreen,
  playerUrl,
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
  history.push(playerUrl(path));
}
export function goToGame(id: string): void {
  history.push(playerUrl(`run=${id}`), { pause: false });
}

export const currentMode$ = atom('shelf');

/**
 * Storage writes of games$ actions still in flight. The UI stays optimistic (it does not wait for
 * them); this counter lets a caller that must not unload the page yet (e.g. e2e before a restart)
 * see when they have settled.
 */
export const pendingWrites$ = atom(0);

function tracked(write: Promise<void>): void {
  pendingWrites$.update((n) => n + 1);
  write.catch(console.error).finally(() => pendingWrites$.update((n) => n - 1));
}

export const games$ = atom<Record<string, GameShelfEntry>, GamesActions>({}, (atom) => {
  return {
    add(id: string, data: GameShelfEntry): void {
      tracked(getStorage().addGame(id, data));
      atom.update((s) => ({
        ...s,
        [id]: data,
      }));
    },
    update(id: string, data: Partial<GameShelfEntry>): void {
      tracked(getStorage().updateGame(id, data));
      atom.update((s) => ({
        ...s,
        [id]: {
          ...(s[id] || {}),
          ...data,
        },
      }));
    },
    remove(id): void {
      tracked(getStorage().removeGame(id));
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

let locationChange: Promise<void> = Promise.resolve();
history.listen(({ location }) => {
  locationChange = processLocationChange(location.search);
});

/**
 * Resolves once the latest navigation (e.g. goToGame, whose game starts asynchronously) has been
 * handled, whether it succeeded or not.
 */
export function locationSettled(): Promise<void> {
  return locationChange.then(
    () => undefined,
    () => undefined,
  );
}

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
