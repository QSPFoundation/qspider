import { type Interaction, Task, Wait } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Key, Press } from '@serenity-js/web';
import { E2E_GAME } from '../../fixtures/e2e-game';
import { SAVES_GAME } from '../../fixtures/saves-game';
import { SeeGameStarted, SeeStartupFinished } from '../common/checks';
import { PauseScreen, QuitButton } from '../pause/elements';
import { TEST_PACK } from '../../fixtures/test-pack';
import { Shelf } from '../shelf/elements';
import { OpenFromShelf } from '../shelf/tasks';
import { LoadTestPack, OpenGameFile, StartPlayer } from '../support/operate-player';
import { ClickWhenPresent, TextNow, waitUntilPresent } from '../support/presence';
import { Action, MainText } from './elements';

/** The e2e fixture game's title in the test pack. */
const PACK_E2E_GAME = TEST_PACK.titles[0];

/** From a clean app: starts the player, loads the test pack and opens the e2e game from the shelf. */
export const OpenFixture = (): Task =>
  Task.where(
    '#actor opens the e2e fixture game',
    StartPlayer(),
    LoadTestPack(),
    OpenFromShelf(PACK_E2E_GAME),
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

/** From the game's start: clicks `goToRoom`, then `increment` n times, waiting for each counter text. */
const ReachCounterWith = (
  n: number,
  game: { goToRoom: string; increment: string; room: (n: number) => string },
): Task =>
  Task.where(
    `#actor reaches counter ${n}`,
    ClickActionUntil(game.goToRoom, game.room(0)),
    ...Array.from({ length: n }, (_, i) => ClickActionUntil(game.increment, game.room(i + 1))),
  );

/** From the game's start: goes to the room and increments its counter to `n`. */
export const ReachCounter = (n: number): Task =>
  ReachCounterWith(n, {
    goToRoom: E2E_GAME.action.goToRoom,
    increment: E2E_GAME.action.increment,
    room: E2E_GAME.text.room,
  });

/** From a clean app: starts the player and opens the saves fixture game from a file, at counter 0. */
export const OpenSavesFixture = (): Task =>
  Task.where(
    '#actor opens the saves fixture game',
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(SAVES_GAME.path),
    SeeGameStarted(SAVES_GAME.text.start),
    ReachSavesCounter(0),
  );

/** In the saves fixture, from its start: goes to the room and increments the counter to `n`. */
export const ReachSavesCounter = (n: number): Task =>
  ReachCounterWith(n, {
    goToRoom: SAVES_GAME.action.goToRoom,
    increment: SAVES_GAME.action.increment,
    room: SAVES_GAME.text.counter,
  });

/** Opens the pause screen and quits to the game shelf. */
export const ReturnToShelf = (): Task =>
  Task.where(
    '#actor returns to the shelf',
    Press.the(Key.Escape),
    waitUntilPresent(PauseScreen),
    ClickWhenPresent(QuitButton),
    waitUntilPresent(Shelf),
  );

/** Presses Escape, whichever overlay is up. */
export const PressEscape = (): Interaction => Press.the(Key.Escape);

/** Presses the hotkey of the action at 1-based `position` (digit keys 1-9). */
export const PressActionHotkey = (position: number): Interaction => Press.the(String(position));

/** F5: quicksave. */
export const PressQuickSave = (): Interaction => Press.the(Key.F5);

/** F9: quickload. */
export const PressQuickLoad = (): Interaction => Press.the(Key.F9);

/** Ctrl+S: opens the saves panel for saving. */
export const PressSaveHotkey = (): Interaction => Press.the(Key.Control, 's');

/** Ctrl+O: opens the saves panel for loading. */
export const PressLoadHotkey = (): Interaction => Press.the(Key.Control, 'o');
