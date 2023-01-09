import { GameDescriptor } from '@qspider/contracts';
import { defer } from '@qspider/utils';
import { create } from 'xoid';
import { storage$ } from './storage';

interface GamesActions {
  add(id: string, data: GameDescriptor): void;
  update(id: string, data: Partial<GameDescriptor>): void;
  remove(id: string): void;
}

export const baseInit$ = create(false);
export const initDefered$ = create(defer<void>());
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

export async function loadGamesFromStorage(): Promise<void> {
  const games = await storage$.value?.getGames();
  if (games) {
    games$.set(games);
  }
}
