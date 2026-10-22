import { Task } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
import { StatsContent, StatsPanel } from '../stats/elements';
import { PresenceOf } from '../support/presence';
import { seeEventually } from '../support/see-eventually';
import { ClassicDock } from './elements';

/** The stats panel is inside the `place` dock of the classic layout (and reads `text`, so it is the visible one). */
export const SeeStatsInDock = (place: string, text: string): Task =>
  Task.where(
    `#actor sees the stats panel in the ${place} dock`,
    seeEventually(
      StatsPanel.of(ClassicDock(place)),
      (e) => PresenceOf(e),
      equals(true),
      `#actor sees the stats panel inside the ${place} dock`,
    ),
    seeEventually(
      StatsContent.of(ClassicDock(place)),
      (e) => Text.of(e).trim(),
      equals(text),
      `#actor sees the ${place} dock's stats read "${text}"`,
    ),
  );
