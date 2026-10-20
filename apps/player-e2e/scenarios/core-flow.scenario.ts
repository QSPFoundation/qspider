import { E2E_GAME } from '../fixtures/e2e-game';
import { SeeGameStarted } from '../screenplay/common/checks';
import { SeeMainText } from '../screenplay/game/checks';
import { ClickAction, OpenFixture, ReachCounter, ReturnToShelf } from '../screenplay/game/tasks';
import { SeeSlotEmpty } from '../screenplay/saves/checks';
import { ChooseSaveSlot } from '../screenplay/saves/tasks';
import { SeeShelfTitles } from '../screenplay/shelf/checks';
import { OpenFromShelf } from '../screenplay/shelf/tasks';
import { OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

const { action: ACTION, shelfTitle: SHELF_TITLE, text: TEXT } = E2E_GAME;
const SAVE_SLOT = 1;

// Web starts on an empty shelf and opens the file from it. Desktop launches with the game
// as its argument, so the empty shelf is never shown there.
scenario.webOnly('opening a game file starts it and adds it to the shelf', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeShelfTitles([]), // start state; not a leftover guard (README, "Emptiness needs a settled anchor")
    OpenGameFile(E2E_GAME.path),
    SeeGameStarted(TEXT.start),
    ReturnToShelf(),
    SeeShelfTitles([SHELF_TITLE]),
  );
});

scenario.desktopOnly('opening a game file starts it and adds it to the shelf', async (player) => {
  await player.attemptsTo(OpenFixture(), ReturnToShelf(), SeeShelfTitles([SHELF_TITLE]));
});

scenario('actions update the game text', async (player) => {
  await player.attemptsTo(
    OpenFixture(),
    ClickAction(ACTION.goToRoom),
    SeeMainText(TEXT.room(0)),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.room(1)),
  );
});

scenario('loading a save restores the saved state', async (player) => {
  await player.attemptsTo(
    OpenFixture(),
    ReachCounter(1),
    ClickAction(ACTION.save),
    SeeSlotEmpty(SAVE_SLOT), // start state; not a leftover guard (README, "Emptiness needs a settled anchor")
    ChooseSaveSlot(SAVE_SLOT),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.room(2)),
    ClickAction(ACTION.load),
    ChooseSaveSlot(SAVE_SLOT),
    SeeMainText(TEXT.room(1)), // restore is observable
  );
});

scenario('a game on the shelf can be reopened', async (player) => {
  await player.attemptsTo(OpenFixture(), ReturnToShelf(), OpenFromShelf(SHELF_TITLE), SeeMainText(TEXT.start));
});
