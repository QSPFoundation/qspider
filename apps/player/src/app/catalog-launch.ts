import { GameShelfEntry } from '@qspider/contracts';

/** The shelf entry imported from the catalog game with this id, if any. */
export function findCatalogEntry(games: Record<string, GameShelfEntry>, catalogId: string): GameShelfEntry | undefined {
  return Object.values(games).find((game) => game.meta?.source_id === catalogId);
}
