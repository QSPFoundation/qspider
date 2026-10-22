import { Task } from '@serenity-js/core';
import { equals, includes, isGreaterThan } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
import { PANELS_GAME } from '../../fixtures/panels-game';
import { waitUntilAbsent } from '../support/presence';
import { seeEventually } from '../support/see-eventually';
import { StatsContent, StatsPanel } from './elements';

/** The stats panel eventually reads exactly `text` (whitespace-trimmed). */
export const SeeStats = (text: string): Task =>
  seeEventually(StatsContent, (e) => Text.of(e).trim(), equals(text), `#actor sees stats "${text}"`);

export const SeeStatsContaining = (text: string): Task =>
  seeEventually(StatsContent, (e) => Text.of(e), includes(text), `#actor sees stats containing "${text}"`);

/**
 * The count `pattern` captures (one group) in the stats panel eventually exceeds `n`, by default the panels
 * fixture's tick count: proof that the timer runs. An exact count would race a fast timer (the poll can miss
 * it), so the check is "above". No match reads as NaN, which fails.
 */
export const SeeStatsCountAbove = (n: number, pattern: RegExp = PANELS_GAME.text.ticksPattern): Task =>
  seeEventually(
    StatsContent,
    (e) => Text.of(e).as((text) => Number(pattern.exec(text)?.[1] ?? Number.NaN)),
    isGreaterThan(n),
    `#actor sees the stats count ${pattern.source} above ${n}`,
  );

/** The stats panel is gone. An absence check: check a settled anchor first (see README, "Reading and waiting"). */
export const SeeNoStatsPanel = (): Task => Task.where('#actor sees no stats panel', waitUntilAbsent(StatsPanel));
