import { TFunction } from 'i18next';
import { GameShelfEntry } from '@qspider/contracts';
import { games$ } from '@qspider/game-shelf';
import { showNotice } from '@qspider/game-state';

/**
 * Adds (or overwrites) freshly imported entries to the shelf. Several entries only land on the
 * shelf (with a notice); a single entry is returned so the caller can start it.
 */
export function addImported(imported: GameShelfEntry[], t: TFunction): string | undefined {
  if (!imported.length) throw new Error('No games imported');
  for (const entry of imported) {
    games$.actions.add(entry.id, entry);
  }
  if (imported.length > 1) {
    showNotice(t(`{{ count }} games added to shelf`, { count: imported.length }));
    return undefined;
  }
  return imported[0].id;
}
