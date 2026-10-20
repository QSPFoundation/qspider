import { E2E_GAME } from '../fixtures/e2e-game';
import { TEST_PACK } from '../fixtures/test-pack';
import { SeeGameStarted } from '../screenplay/common/checks';
import { SeeMainText } from '../screenplay/game/checks';
import { ClickAction, OpenFixture, ReachCounter, ReturnToShelf } from '../screenplay/game/tasks';
import { SeeSlotEmpty } from '../screenplay/saves/checks';
import { ChooseSaveSlot } from '../screenplay/saves/tasks';
import { SeeNotice, SeeShelfIncludes, SeeShelfTitles } from '../screenplay/shelf/checks';
import { OpenFromShelf } from '../screenplay/shelf/tasks';
import { LoadTestPack, OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

const { action: ACTION, shelfTitle: SHELF_TITLE, text: TEXT } = E2E_GAME;
const [PACK_E2E_GAME] = TEST_PACK.titles;
const PACK_NOTICE = `${TEST_PACK.titles.length} games added to shelf`;
const SAVE_SLOT = 1;

scenario('loading a game config adds all its games to the shelf without starting one', async (player) => {
  // No UI marker shows that start-up has finished, so "without starting one" is proven only as far as
  // the notice and the shelf seen after it go (README, "Emptiness needs a settled anchor").
  await player.attemptsTo(
    StartPlayer(),
    LoadTestPack(),
    SeeShelfTitles([...TEST_PACK.titles]),
    SeeNotice(PACK_NOTICE), // the multi-game import branch ran
    SeeShelfTitles([...TEST_PACK.titles]), // still on the shelf after it: no game started
  );
});

scenario('opening a game file starts it and adds it to the shelf', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    OpenGameFile(E2E_GAME.path),
    SeeGameStarted(TEXT.start),
    ReturnToShelf(),
    SeeShelfIncludes(SHELF_TITLE),
  );
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
  await player.attemptsTo(OpenFixture(), ReturnToShelf(), OpenFromShelf(PACK_E2E_GAME), SeeMainText(TEXT.start));
});
