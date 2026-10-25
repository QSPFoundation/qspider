import { GameShelfEntry } from '@qspider/contracts';

type Games = Record<string, GameShelfEntry>;

export function addGame(games: Games, id: string, data: GameShelfEntry): Games {
  return { ...games, [id]: data };
}

export function updateGame(games: Games, id: string, data: Partial<GameShelfEntry>): Games {
  return { ...games, [id]: { ...(games[id] || {}), ...data } as GameShelfEntry };
}

export function removeGame(games: Games, id: string): Games {
  const { [id]: _, ...rest } = games;
  return rest;
}

export function sortByTitle(games: Games): GameShelfEntry[] {
  return Object.values(games).sort((a, b) => a.title.localeCompare(b.title));
}

export function sourceMap(games: Games): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const game of Object.values(games)) {
    if (game.meta?.source) {
      const set = map.get(game.meta.source) ?? new Set();
      set.add(game.meta.source_id);
      map.set(game.meta.source, set);
    }
  }
  return map;
}
