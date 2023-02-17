import { GameDescriptor } from '@qspider/contracts';
import { storage$ } from '@qspider/game-state';
import { create } from 'xoid';

interface GamesActions {
  add(id: string, data: GameDescriptor): void;
  update(id: string, data: Partial<GameDescriptor>): void;
  remove(id: string): void;
}

export const basename$ = create('/');

export function navigateTo(path: string): void {
  window.location.href = basename$.value + path;
}

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

export function goToGame(id: string): void {
  navigateTo(`game/${id}`);
}

export async function loadGamesFromStorage(): Promise<void> {
  const games = await storage$.value?.getGames();
  if (games) {
    games$.set(games);
  }
}
