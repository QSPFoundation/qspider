import { TFunction } from 'i18next';
import { GameShelfEntry } from '@qspider/contracts';
import { showNotice } from '@qspider/game-state';
import { games$ } from './game-shelf';
import { importOutcome } from './import-outcome';

/**
 * The shared start decision after an import (web and desktop: launch, drop, Open game).
 * Every imported entry is added to the shelf, overwriting an entry with the same id.
 * - more than one entry: they only land on the shelf, with a notice; returns undefined (start nothing);
 * - one entry: returns its id, for the caller to start;
 * - none: throws.
 */
export function addImported(imported: GameShelfEntry[], t: TFunction): string | undefined {
  const outcome = importOutcome(imported);
  for (const entry of imported) {
    games$.actions.add(entry.id, entry);
  }
  if ('notice' in outcome) {
    showNotice(t(`{{ count }} games added to shelf`, { count: outcome.notice }));
    return undefined;
  }
  return outcome.start;
}
