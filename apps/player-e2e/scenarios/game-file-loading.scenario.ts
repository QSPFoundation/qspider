// A game's own file open (inclib names a file): the engine waits until the player finishes the call.
import { ARCHIVES } from '../fixtures/archives';
import { INCLUDER_GAME } from '../fixtures/includer-game';
import { SeeErrorAlertText, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeMainText } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { LoadGame, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

const { action: ACTION, text: TEXT } = INCLUDER_GAME;

scenario('a game file that fails to open shows an error and the game goes on', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(ARCHIVES.includerZip.path),
    SeeMainText(ARCHIVES.includerZip.includedMarker),
    ClickAction(ACTION.includeMissing),
    SeeErrorAlertText(`Failed to open ${INCLUDER_GAME.missingFile}`),
    SeeMainText(TEXT.afterMissing), // the inclib statement finished, and the action went on after it
    ClickAction(ACTION.goOn),
    SeeMainText(TEXT.wentOn),
  );
});
