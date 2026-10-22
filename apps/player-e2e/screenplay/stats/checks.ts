import { Expectation, Task } from '@serenity-js/core';
import { equals, includes, isGreaterThan } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
import { PANELS_GAME } from '../../fixtures/panels-game';
import { PageClockAdvanced } from '../support/page-clock';
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

/**
 * The count `pattern` captures (as in SeeStatsCountAbove) eventually rises by at least `by` above the first
 * count this check reads: proof that the timer runs from now on, whatever it counted before (a count above a
 * fixed number could have been reached before a pause). NaN (no match) never sets the baseline.
 */
export const SeeStatsCountRising = (by = 2, pattern: RegExp = PANELS_GAME.text.ticksPattern): Task => {
  let baseline = Number.NaN;
  const risesBy = Expectation.define('risesBy', `rise by ${by} above the first count read`, (count: number) => {
    if (Number.isNaN(count)) return false;
    if (Number.isNaN(baseline)) baseline = count;
    return count >= baseline + by;
  });
  return seeEventually(
    StatsContent,
    (e) => Text.of(e).as((text) => Number(pattern.exec(text)?.[1] ?? Number.NaN)),
    risesBy(),
    `#actor sees the stats count ${pattern.source} rise by ${by}`,
  );
};

/**
 * The count `pattern` captures stays exactly where it is when first read, after `ms` on the page's clock: proof
 * the timer did not run meanwhile (the caller picks ms as a few timer intervals). Counts only rise, so seeing
 * the first reading again means no tick came. Use after a dialog is up, when no tick is in flight.
 * The only allowed use: the counter "does not run while a dialog / the pause screen is open" checks, with
 * ms = 5 x the timer interval (it waits via PageClockAdvanced). Any other use needs maintainer approval.
 */
export const SeeStatsCountStill = (ms: number, pattern: RegExp = PANELS_GAME.text.ticksPattern): Task => {
  let baseline = Number.NaN;
  const read = (e: Parameters<typeof Text.of>[0]) =>
    Text.of(e).as((text) => Number(pattern.exec(text)?.[1] ?? Number.NaN));
  const first = Expectation.define('isFirstRead', 'be read', (count: number) => {
    if (Number.isNaN(count)) return false;
    baseline = count;
    return true;
  });
  const unchanged = Expectation.define(
    'unchanged',
    'still be the first count read',
    (count: number) => count === baseline,
  );
  return Task.where(
    `#actor sees the stats count ${pattern.source} not move for ${ms} ms`,
    seeEventually(StatsContent, read, first(), `#actor reads the stats count ${pattern.source}`),
    PageClockAdvanced(ms),
    seeEventually(StatsContent, read, unchanged(), `#actor sees the stats count ${pattern.source} unchanged`),
  );
};

/** The stats panel is gone. An absence check: check a settled anchor first (see README, "Reading and waiting"). */
export const SeeNoStatsPanel = (): Task => Task.where('#actor sees no stats panel', waitUntilAbsent(StatsPanel));
