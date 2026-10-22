import { AssertionError, Question, Task, Wait } from '@serenity-js/core';
import { equals, not } from '@serenity-js/assertions';
import { Attribute, Text } from '@serenity-js/web';
import { MainText } from '../game/elements';
import { isShown, PresenceOf, waitUntilAbsent, TextNow, textIfPresent } from '../support/presence';
import { seeEventually } from '../support/see-eventually';
import { ErrorAlerts, GameRoot, NoticeToastElement, StartupFinishedMarker } from './elements';

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
    return (await actor.answer(TextNow(MainText))) === startText ? { kind: 'started' } : { kind: 'waiting' };
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

/**
 * The player has finished starting up: any game it was launched with has started by now, so a
 * screen checked after this is not about to be replaced by one.
 */
export const SeeStartupFinished = (): Task =>
  seeEventually(StartupFinishedMarker, (e) => PresenceOf(e), equals(true), '#actor sees the player finish starting up');

/** The player shows an error alert (an import failure toast or an engine error dialog). */
export const SeeErrorShown = (): Task =>
  seeEventually(ErrorAlerts.first(), (e) => PresenceOf(e), equals(true), '#actor sees an error alert');

/** The notice toast is showing. */
export const SeeNoticeShown = (): Task =>
  seeEventually(NoticeToastElement, (e) => PresenceOf(e), equals(true), '#actor sees the notice toast');

/** Waits for any notice toast to close (it closes itself), so a later SeeNoticeShown is about a new notice. */
export const WaitNoticeGone = (): Task =>
  Task.where('#actor waits for the notice toast to close', waitUntilAbsent(NoticeToastElement));

/** The player runs the theme with this alias (`qspider:classic`, `qspider:aero`, or a game theme's name). */
export const SeeActiveTheme = (alias: string): Task =>
  seeEventually(
    GameRoot,
    (e) => Attribute.called('data-qsp-theme').of(e),
    equals(alias),
    `#actor sees the active theme "${alias}"`,
  );
