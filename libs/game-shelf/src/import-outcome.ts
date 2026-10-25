import { GameShelfEntry } from '@qspider/contracts';

/** What follows an import: one entry is started, several only get a notice with their count. */
export function importOutcome(imported: readonly GameShelfEntry[]): { start: string } | { notice: number } {
  if (!imported.length) throw new Error('No games imported');
  if (imported.length > 1) return { notice: imported.length };
  return { start: imported[0].id };
}
