import type { Activity } from '@serenity-js/core';
import { PANELS_GAME } from '../fixtures/panels-game';
import { SeeMainText } from '../screenplay/game/checks';
import { ClickAction, OpenPanelsFixture, PressEscape } from '../screenplay/game/tasks';
import { SeeInput, SeeInputGone } from '../screenplay/input/checks';
import { CancelInput } from '../screenplay/input/tasks';
import { SeeMenu } from '../screenplay/menu/checks';
import { CancelMenu } from '../screenplay/menu/tasks';
import { SeeMsg, SeeMsgGone } from '../screenplay/msg/checks';
import { DismissMsg } from '../screenplay/msg/tasks';
import { SeeNoPauseScreen } from '../screenplay/pause/checks';
import { PauseScreen, ResumeButton } from '../screenplay/pause/elements';
import { SeeStatsCountAbove, SeeStatsCountRising, SeeStatsCountStill } from '../screenplay/stats/checks';
import { ClickWhenPresent, waitUntilPresent } from '../screenplay/support/presence';
import { scenario } from '../screenplay/support/scenario';

const { action: ACTION, text: TEXT } = PANELS_GAME;

/** The counter room's timer (`settimer 100`). */
const TIMER_INTERVAL_MS = 100;
const SEVERAL_TICKS_MS = 5 * TIMER_INTERVAL_MS;

/** Each thing that pauses the counter: how to open it, and how to close it again. */
const PAUSERS: { name: string; open: () => Activity[]; close: () => Activity[] }[] = [
  {
    name: 'a message',
    open: () => [ClickAction(ACTION.counter.message), SeeMsg(TEXT.counterMsg)],
    close: () => [DismissMsg(), SeeMsgGone()],
  },
  {
    name: 'an input prompt',
    open: () => [ClickAction(ACTION.counter.input), SeeInput(TEXT.counterInputPrompt)],
    close: () => [CancelInput(), SeeInputGone()],
  },
  {
    name: 'a menu',
    open: () => [ClickAction(ACTION.counter.menu), SeeMenu()],
    close: () => [CancelMenu()],
  },
  {
    name: 'the pause screen',
    open: () => [PressEscape(), waitUntilPresent(PauseScreen)],
    close: () => [ClickWhenPresent(ResumeButton), SeeNoPauseScreen()],
  },
];

/** From the start: enters the counter room (ticks reset to 0 there) and sees the timer run. */
const EnterCounterRoom = () => [
  OpenPanelsFixture(),
  ClickAction(ACTION.start.counter),
  SeeMainText(TEXT.counterRoom),
  SeeStatsCountAbove(2),
];

scenario("the counter runs the game's timer location", async (player) => {
  await player.attemptsTo(...EnterCounterRoom());
});

// These also cover the resume: the count stays still while open, then rises once closed.
for (const { name, open, close } of PAUSERS) {
  // Elapsed time has no UI event: PageClockAdvanced is the one bounded wait, on the page's own clock.
  scenario(`the counter does not run while ${name} is open`, async (player) => {
    await player.attemptsTo(
      ...EnterCounterRoom(),
      ...open(),
      SeeStatsCountStill(SEVERAL_TICKS_MS),
      ...close(),
      SeeStatsCountRising(),
    );
  });
}
