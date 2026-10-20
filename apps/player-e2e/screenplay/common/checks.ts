import { Check, Interaction, Question, Task, Wait } from '@serenity-js/core';
import { equals, isPresent, not } from '@serenity-js/assertions';
import { type PageElement, Text } from '@serenity-js/web';
import { MainText } from '../game/elements';
import { seeEventually } from '../support/seeEventually';
import { ErrorAlert, ErrorAlerts } from './elements';

// Polled reads of elements that may not be rendered yet. WebKitWebDriver (desktop) answers a
// missing element with a raw "no such element" error instead of false, so any read error counts as "not shown".
const isShown = async (element: PageElement): Promise<boolean> => {
  try {
    return await element.isVisible();
  } catch {
    return false;
  }
};

const textIfPresent = async (element: PageElement): Promise<string | undefined> => {
  try {
    return (await element.isPresent()) ? (await element.text()).trim() : undefined;
  } catch {
    return undefined;
  }
};

/** Whether the game has started (main text is `startText`) or the player shows an error instead. */
const GameStartOutcome = (startText: string) =>
  Question.about<'started' | 'error' | 'waiting'>(
    `whether the game shows "${startText}" or an error`,
    async (actor) => {
      for (const alert of await actor.answer(ErrorAlerts)) {
        if (await isShown(alert)) return 'error';
      }
      return (await textIfPresent(await actor.answer(MainText))) === startText ? 'started' : 'waiting';
    },
  );

const FailWithAlertText = () =>
  Interaction.where('#actor reads the error alert', async (actor) => {
    const text = await actor.answer(Text.of(ErrorAlert));
    throw new Error(`Player shows an error alert: ${text.replace(/\s+/g, ' ').trim()}`);
  });

/** The game has started: its start text shows. Fails fast with the alert text if the player shows an error. */
export const SeeGameStarted = (startText: string) =>
  Task.where(
    `#actor sees the game start with "${startText}"`,
    Wait.until(GameStartOutcome(startText), not(equals('waiting'))),
    Check.whether(ErrorAlert, isPresent()).andIfSo(FailWithAlertText()),
    seeEventually(MainText, (e) => Text.of(e).trim(), equals(startText), `#actor sees main text "${startText}"`),
  );
