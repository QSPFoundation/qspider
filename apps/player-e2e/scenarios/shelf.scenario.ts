import { ARCHIVES } from '../fixtures/archives';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { ReturnToShelf } from '../screenplay/game/tasks';
import { SeeShelfIncludes, SeeShelfLacks, SeeShelfWritesSettled } from '../screenplay/shelf/checks';
import { OpenFromShelf, RemoveFromShelf } from '../screenplay/shelf/tasks';
import { OpenGameFile, RestartPlayer, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

const REMOVED = ARCHIVES.singleZip;
const KEPT = ARCHIVES.qspBinary;

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
