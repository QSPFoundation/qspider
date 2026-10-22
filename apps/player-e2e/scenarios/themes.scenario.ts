import { AERO_GAME, THEME_ALIAS } from '../fixtures/themes-game';
import { SeeActiveTheme, SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeMainText } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { SeeMsg, SeeMsgGone } from '../screenplay/msg/checks';
import { DismissMsg } from '../screenplay/msg/tasks';
import { OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

// The start location offers both actions (the `next` location has none), so the message comes first.
const { action: ACTION, text: TEXT } = AERO_GAME;

scenario('an Aero-mode game plays under the Aero theme', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(AERO_GAME.path),
    SeeGameStarted(TEXT.start),
    SeeActiveTheme(THEME_ALIAS.aero),
    ClickAction(ACTION.showMessage),
    SeeMsg(TEXT.message),
    DismissMsg(),
    SeeMsgGone(),
    SeeMainText(TEXT.start), // still playing
    ClickAction(ACTION.next),
    SeeMainText(TEXT.next),
  );
});
