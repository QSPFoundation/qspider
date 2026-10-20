import { AssertionError, Question, Task, Wait } from '@serenity-js/core';
import { equals, not } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
import { MainText } from '../game/elements';
import { isShown, textIfPresent } from '../support/presence';
import { seeEventually } from '../support/seeEventually';
import { ErrorAlerts } from './elements';

type StartOutcome = { kind: 'started' } | { kind: 'waiting' } | { kind: 'error'; text: string };

const normalize = (s: string): string => s.replace(/\s+/g, ' ').trim();

/** One read of what the player shows: the game's start text, an error alert (with its text), or neither yet. */
const GameStartOutcome = (startText: string) =>
  Question.about<StartOutcome>(`whether the game shows "${startText}" or an error`, async (actor) => {
    for (const alert of await actor.answer(ErrorAlerts)) {
      if (!(await isShown(alert))) continue;
      // Read in the same poll that saw it: the import toast closes itself.
      const text = (await textIfPresent(alert)) ?? '(closed before its text could be read)';
      return { kind: 'error', text: normalize(text) };
    }
    return (await textIfPresent(await actor.answer(MainText))) === startText
      ? { kind: 'started' }
      : { kind: 'waiting' };
  });

/** Waits for the game to start or an error alert; fails at once, with the alert's text, on an error. */
const GameStartedOrFailed = (startText: string) =>
  Question.about<'started' | 'waiting'>(`whether the game shows "${startText}"`, async (actor) => {
    const outcome = await actor.answer(GameStartOutcome(startText));
    if (outcome.kind === 'error') throw new AssertionError(`Player shows an error alert: ${outcome.text}`);
    return outcome.kind;
  });

/** The game has started: its start text shows. Fails fast with the alert text if the player shows an error. */
export const SeeGameStarted = (startText: string) =>
  Task.where(
    `#actor sees the game start with "${startText}"`,
    Wait.until(GameStartedOrFailed(startText), not(equals('waiting'))),
    seeEventually(MainText, (e) => Text.of(e).trim(), equals(startText), `#actor sees main text "${startText}"`),
  );
