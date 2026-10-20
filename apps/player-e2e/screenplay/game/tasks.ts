import { Task, Wait } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Key, Press } from '@serenity-js/web';
import { E2E_GAME } from '../../fixtures/e2e-game';
import { SeeGameStarted } from '../common/checks';
import { PauseScreen, QuitButton } from '../pause/elements';
import { Shelf } from '../shelf/elements';
import { OpenGameFile, StartPlayer } from '../support/operate-player';
import { ClickWhenPresent, TextNow, waitUntilPresent } from '../support/presence';
import { Action, MainText } from './elements';

/** From a clean app: starts the player and opens the e2e fixture game. */
export const OpenFixture = (): Task =>
  Task.where(
    '#actor opens the e2e fixture game',
    StartPlayer(),
    OpenGameFile(E2E_GAME.path),
    SeeGameStarted(E2E_GAME.text.start),
  );

/** Clicks the game action labelled `label`, once the game shows it. */
export const ClickAction = (label: string): Task =>
  Task.where(`#actor clicks the "${label}" action`, ClickWhenPresent(Action(label)));

/** Clicks the action `label`, then waits until the main text reads `text`. */
const ClickActionUntil = (label: string, text: string): Task =>
  Task.where(
    `#actor clicks "${label}" until the main text reads "${text}"`,
    ClickAction(label),
    Wait.until(TextNow(MainText), equals(text)),
  );

/** From the game's start: goes to the room and increments its counter to `n`. */
export const ReachCounter = (n: number): Task =>
  Task.where(
    `#actor reaches counter ${n}`,
    ClickActionUntil(E2E_GAME.action.goToRoom, E2E_GAME.text.room(0)),
    ...Array.from({ length: n }, (_, i) => ClickActionUntil(E2E_GAME.action.increment, E2E_GAME.text.room(i + 1))),
  );

/** Opens the pause screen and quits to the game shelf. */
export const ReturnToShelf = (): Task =>
  Task.where(
    '#actor returns to the shelf',
    Press.the(Key.Escape),
    waitUntilPresent(PauseScreen),
    ClickWhenPresent(QuitButton),
    waitUntilPresent(Shelf),
  );
