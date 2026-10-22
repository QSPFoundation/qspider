import { AERO_GAME, THEMED_GAME, THEME_ALIAS } from '../fixtures/themes-game';
import { SeeActiveTheme, SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeElementText } from '../screenplay/content/checks';
import { QspLayer } from '../screenplay/content/elements';
import { SeeMainText } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { SeeMsg, SeeMsgGone } from '../screenplay/msg/checks';
import { DismissMsg } from '../screenplay/msg/tasks';
import { OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';
import { SeeThemeChrome, SeeThemeScriptRan } from '../screenplay/themes/e2e-custom/checks';

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

scenario('a game-provided theme loads with its files', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(THEMED_GAME.path),
    SeeGameStarted(THEMED_GAME.text.start),
    SeeActiveTheme(THEME_ALIAS.custom),
    SeeThemeChrome(),
    SeeThemeScriptRan(),
    SeeMainText(THEMED_GAME.text.start),
    ClickAction(THEMED_GAME.action.showLayer),
    SeeElementText(QspLayer, THEMED_GAME.theme.layerText, 'the theme layer reads its text'),
  );
});
