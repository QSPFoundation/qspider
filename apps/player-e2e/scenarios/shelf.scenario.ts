import { ARCHIVES } from '../fixtures/archives';
import { SAVES_GAME } from '../fixtures/saves-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { ClickAction, OpenSavesFixture, ReachSavesCounter, ReturnToShelf } from '../screenplay/game/tasks';
import { SeeSlotEmpty, SeeSlotFilled } from '../screenplay/saves/checks';
import { CancelSavesPanel, OpenSavesPanel, SaveToSlot } from '../screenplay/saves/tasks';
import { SeeShelfIncludes, SeeShelfLacks, SeeShelfWritesSettled } from '../screenplay/shelf/checks';
import { OpenFromShelf, RemoveFromShelf } from '../screenplay/shelf/tasks';
import { OpenGameFile, RestartPlayer, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

const REMOVED = ARCHIVES.singleZip;
const KEPT = ARCHIVES.qspBinary;
const { action: ACTION, text: TEXT } = SAVES_GAME;

scenario('a removed game stays removed and an added game stays after a restart', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(REMOVED.path),
    SeeGameStarted(REMOVED.startText),
    ReturnToShelf(),
    SeeShelfIncludes(REMOVED.title),
    OpenGameFile(KEPT.path),
    SeeGameStarted(KEPT.startText),
    ReturnToShelf(),
    SeeShelfIncludes(KEPT.title),
    RemoveFromShelf(REMOVED.title),
    SeeShelfIncludes(KEPT.title),
    SeeShelfLacks(REMOVED.title),
    SeeShelfWritesSettled(), // the card going away is optimistic; the delete must reach storage before the restart
    RestartPlayer(),
    SeeStartupFinished(),
    SeeShelfIncludes(KEPT.title), // settled anchor for the absence check
    SeeShelfLacks(REMOVED.title),
    OpenFromShelf(KEPT.title),
    SeeGameStarted(KEPT.startText),
  );
});

scenario('a removed game comes back without its old saves', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.save),
    SaveToSlot(1),
    OpenSavesPanel(),
    SeeSlotFilled(1),
    CancelSavesPanel(), // Escape in ReturnToShelf would toggle the open pause screen shut
    ReturnToShelf(),
    RemoveFromShelf(SAVES_GAME.title),
    SeeShelfLacks(SAVES_GAME.title),
    OpenGameFile(SAVES_GAME.path),
    SeeGameStarted(TEXT.start),
    ReachSavesCounter(0),
    ClickAction(ACTION.save),
    SaveToSlot(2),
    OpenSavesPanel(),
    SeeSlotFilled(2), // settled: one loadSaveList sets all slots
    SeeSlotEmpty(1),
  );
});
