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
import { pendingWrites$, trackWrite } from './pending-writes';
import { addGame, removeGame, sortByTitle, sourceMap, updateGame } from './shelf-state';

export { pendingWrites$ };

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

export const games$ = atom<Record<string, GameShelfEntry>, GamesActions>({}, (atom) => {
  return {
    add(id: string, data: GameShelfEntry): void {
      trackWrite(getStorage().addGame(id, data));
      atom.update((s) => addGame(s, id, data));
    },
    update(id: string, data: Partial<GameShelfEntry>): void {
      trackWrite(getStorage().updateGame(id, data));
      atom.update((s) => updateGame(s, id, data));
    },
    remove(id): void {
      trackWrite(getStorage().removeGame(id));
      atom.update((s) => removeGame(s, id));
    },
  };
});

export const gamesList$ = atom((get) => sortByTitle(get(games$)));
export const gameSourceMap$ = atom((get) => sourceMap(get(games$)));

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
