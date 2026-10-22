import { Task } from '@serenity-js/core';
import { equals, includes } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
import { waitUntilAbsent } from '../support/presence';
import { seeEventually } from '../support/see-eventually';
import { StatsContent, StatsPanel } from './elements';

/** The stats panel eventually reads exactly `text` (whitespace-trimmed). */
export const SeeStats = (text: string): Task =>
  seeEventually(StatsContent, (e) => Text.of(e).trim(), equals(text), `#actor sees stats "${text}"`);

export const SeeStatsContaining = (text: string): Task =>
  seeEventually(StatsContent, (e) => Text.of(e), includes(text), `#actor sees stats containing "${text}"`);

/** The stats panel is gone. An absence check: check a settled anchor first (see README, "Reading and waiting"). */
export const SeeNoStatsPanel = (): Task => Task.where('#actor sees no stats panel', waitUntilAbsent(StatsPanel));
