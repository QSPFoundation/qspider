import { E2E_GAME } from '../fixtures/e2e-game';
import { SAVES_GAME } from '../fixtures/saves-game';
import { TEST_PACK } from '../fixtures/test-pack';
import { SeeGameStarted } from '../screenplay/common/checks';
import { SeeMainText } from '../screenplay/game/checks';
import { ClickAction, OpenSavesFixture, ReachCounter, ReturnToShelf } from '../screenplay/game/tasks';
import { SeeSlotEmpty, SeeSlotFilled } from '../screenplay/saves/checks';
import { CancelSavesPanel, ClearSlot, LoadFromSlot, OpenSavesPanel, SaveToSlot } from '../screenplay/saves/tasks';
import { OpenFromShelf } from '../screenplay/shelf/tasks';
import { LoadTestPack } from '../screenplay/support/operate-player';
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
