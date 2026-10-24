import { E2E_GAME } from '../fixtures/e2e-game';
import { SAVES_GAME } from '../fixtures/saves-game';
import { TEST_PACK } from '../fixtures/test-pack';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeMainText } from '../screenplay/game/checks';
import { SeeMsgGone } from '../screenplay/msg/checks';
import {
  ClickAction,
  OpenSavesFixture,
  PressQuickLoad,
  PressQuickSave,
  ReachCounter,
  ReturnToShelf,
} from '../screenplay/game/tasks';
import { SeeQuickSaveFilled, SeeRequestedSaveCommand, SeeSlotEmpty, SeeSlotFilled } from '../screenplay/saves/checks';
import { CancelSavesPanel, ClearSlot, LoadFromSlot, OpenSavesPanel, SaveToSlot } from '../screenplay/saves/tasks';
import { SeeShelfIncludes, SeeShelfWritesSettled } from '../screenplay/shelf/checks';
import { OpenFromShelf } from '../screenplay/shelf/tasks';
import { LoadTestPack, LoadGame, RestartPlayer, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

const { action: ACTION, text: TEXT } = SAVES_GAME;
const [PACK_E2E_GAME] = TEST_PACK.titles;

scenario('several save slots each restore their own state', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(1)),
    ClickAction(ACTION.save),
    SaveToSlot(1),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(2)),
    ClickAction(ACTION.save),
    SaveToSlot(2),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(3)),
    ClickAction(ACTION.load),
    LoadFromSlot(1),
    SeeMainText(TEXT.counter(1)),
    ClickAction(ACTION.load),
    LoadFromSlot(2),
    SeeMainText(TEXT.counter(2)),
  );
});

scenario('saving over an occupied slot keeps the newer save', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(1)),
    ClickAction(ACTION.save),
    SaveToSlot(1),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(2)),
    ClickAction(ACTION.save),
    SaveToSlot(1),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(3)),
    ClickAction(ACTION.load),
    LoadFromSlot(1),
    SeeMainText(TEXT.counter(2)),
  );
});

scenario('clearing a slot empties it', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(1)),
    ClickAction(ACTION.save),
    SaveToSlot(1),
    OpenSavesPanel(),
    SeeSlotFilled(1), // settled anchor for the emptiness check below
    ClearSlot(1),
    SeeSlotEmpty(1),
  );
});

scenario('saves belong to their game', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(1)),
    ClickAction(ACTION.save),
    SaveToSlot(1),
    OpenSavesPanel(),
    SeeSlotFilled(1),
    CancelSavesPanel(), // Escape in ReturnToShelf would toggle the open pause screen shut
    ReturnToShelf(),
    LoadTestPack(),
    OpenFromShelf(PACK_E2E_GAME),
    SeeGameStarted(E2E_GAME.text.start),
    ReachCounter(0),
    ClickAction(E2E_GAME.action.save),
    SaveToSlot(2),
    OpenSavesPanel(),
    SeeSlotFilled(2), // settled: one loadSaveList sets all slots
    SeeSlotEmpty(1),
  );
});

scenario('a named save restores by name', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(1)),
    ClickAction(ACTION.saveNamed),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(2)),
    ClickAction(ACTION.loadNamed),
    SeeMainText(TEXT.counter(1)),
  );
});

scenario('cancelling the save panel resumes the game', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.saveThenMark),
    SeeRequestedSaveCommand('save'),
    CancelSavesPanel(),
    SeeMainText(TEXT.afterSavePanel),
  );
});

scenario('cancelling the load panel resumes the game', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.loadThenMark),
    SeeRequestedSaveCommand('load'),
    CancelSavesPanel(),
    SeeMainText(TEXT.afterLoadPanel),
  );
});

scenario('loading from the panel opened by the game restores the slot', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(1)),
    ClickAction(ACTION.save),
    SaveToSlot(1),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(2)),
    ClickAction(ACTION.loadThenMark),
    SeeRequestedSaveCommand('load'),
    LoadFromSlot(1),
    // Per the engine contract, loaded() is called after loadSave (restoreFromSlot). The engine shows the
    // restored state and does not write the code after `opengame` (no AFTER LOAD PANEL), on both targets.
    SeeMainText(TEXT.counter(1)),
    // 2 = restored 1 + 1 (not 3): the game state is the save, not the state before the load.
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(2)),
  );
});

scenario('loading from the panel opened by the game does not run the code after opengame', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(SAVES_GAME.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.goToMessageRoom),
    SeeMainText(TEXT.counter(0)),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(1)),
    ClickAction(ACTION.save),
    SaveToSlot(1),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(2)),
    ClickAction(ACTION.loadThenMessage),
    SeeRequestedSaveCommand('load'),
    LoadFromSlot(1),
    // loadSave runs before loaded(), so the engine drops the rest of the action. With loaded() first,
    // the msg box after `opengame` (TEXT.afterLoadMsg, outside the save) opened over the restored
    // text and blocked the game. The Increment result is the anchor.
    SeeMainText(TEXT.counter(1)),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(2)),
    SeeMsgGone(),
  );
});

scenario('saves survive a restart of the player', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(1)),
    ClickAction(ACTION.save),
    SaveToSlot(1),
    // Settled "save written" anchors: each save has reached storage before the app is ended.
    OpenSavesPanel(),
    SeeSlotFilled(1),
    CancelSavesPanel(),
    PressQuickSave(),
    OpenSavesPanel(),
    SeeQuickSaveFilled(),
    CancelSavesPanel(),
    ReturnToShelf(),
    SeeShelfIncludes(SAVES_GAME.title),
    SeeShelfWritesSettled(),
    RestartPlayer(),
    SeeStartupFinished(),
    OpenFromShelf(SAVES_GAME.title),
    ClickAction(ACTION.goToRoom),
    SeeMainText(TEXT.counter(0)),
    ClickAction(ACTION.load),
    LoadFromSlot(1),
    SeeMainText(TEXT.counter(1)),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(2)),
    PressQuickLoad(),
    SeeMainText(TEXT.counter(1)),
  );
});
