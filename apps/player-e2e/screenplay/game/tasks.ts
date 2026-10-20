import { Interaction, Task, Wait } from '@serenity-js/core';
import { isPresent } from '@serenity-js/assertions';
import { Click, Key, Press } from '@serenity-js/web';
import { E2E_GAME } from '../../fixtures/e2e-game';
import { SeeGameStarted } from '../common/checks';
import { PauseScreen, QuitButton } from '../pause/elements';
import { Shelf } from '../shelf/elements';
import { OpenGameFile, StartPlayer } from '../support/operate-player';
import { Action } from './elements';

/** From a clean app: starts the player and opens the e2e fixture game. */
export const OpenFixture = (): Task =>
  Task.where(
    '#actor opens the e2e fixture game',
    StartPlayer(),
    OpenGameFile(E2E_GAME.path),
    SeeGameStarted(E2E_GAME.text.start),
  );

export const ClickAction = (label: string): Interaction => Click.on(Action(label));

/** Opens the pause screen and quits to the game shelf. */
export const ReturnToShelf = (): Task =>
  Task.where(
    '#actor returns to the shelf',
    Press.the(Key.Escape),
    Wait.until(PauseScreen, isPresent()),
    Click.on(QuitButton),
    Wait.until(Shelf, isPresent()),
  );
