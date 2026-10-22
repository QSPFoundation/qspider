import { AERO_GAME, MISSING_THEME_GAME, THEMED_GAME, THEME_ALIAS } from '../fixtures/themes-game';
import { includes } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
import { seeEventually } from '../screenplay/support/see-eventually';
import { ErrorAlerts } from '../screenplay/common/elements';
import { SeeActiveTheme, SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeElementText } from '../screenplay/content/checks';
import { NoticeToastElement } from '../screenplay/common/elements';
import { QspLayer } from '../screenplay/content/elements';
import { SeeMainText } from '../screenplay/game/checks';
import { ClickAction, ReturnToShelf } from '../screenplay/game/tasks';
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

const MISSING_NOTICE = `Theme ${MISSING_THEME_GAME.missingTheme} not found`;

scenario('a missing defaultTheme in Aero mode falls back to Aero, with a notice', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(MISSING_THEME_GAME.aeroPath),
    SeeElementText(NoticeToastElement, MISSING_NOTICE, '#actor sees the theme-not-found notice'),
    SeeGameStarted(MISSING_THEME_GAME.text.start),
    SeeActiveTheme(THEME_ALIAS.aero),
  );
});

scenario(
  'after an Aero game, a classic game with a missing defaultTheme gets the classic theme and a notice',
  async (player) => {
    await player.attemptsTo(
      StartPlayer(),
      SeeStartupFinished(),
      OpenGameFile(AERO_GAME.path),
      SeeGameStarted(TEXT.start),
      SeeActiveTheme(THEME_ALIAS.aero),
      ReturnToShelf(),
      OpenGameFile(MISSING_THEME_GAME.classicPath),
      SeeElementText(NoticeToastElement, MISSING_NOTICE, '#actor sees the theme-not-found notice'),
      SeeGameStarted(MISSING_THEME_GAME.text.start),
      SeeActiveTheme(THEME_ALIAS.classic),
    );
  },
);

scenario('a classic game after an Aero game is shown', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(AERO_GAME.path),
    SeeGameStarted(TEXT.start),
    SeeActiveTheme(THEME_ALIAS.aero),
    ReturnToShelf(),
    OpenGameFile(MISSING_THEME_GAME.classicPath),
    SeeActiveTheme(THEME_ALIAS.classic),
    SeeMainText(MISSING_THEME_GAME.text.start), // guards against the window shrinking below the layout minimum after an Aero game
  );
});

scenario('the game switches theme at runtime', async (player) => {
  const { action } = THEMED_GAME;
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(THEMED_GAME.path),
    SeeGameStarted(THEMED_GAME.text.start),
    SeeActiveTheme(THEME_ALIAS.custom),
    ClickAction(action.toClassic),
    SeeActiveTheme(THEME_ALIAS.classic),
    SeeMainText(THEMED_GAME.text.start), // the game still plays
    ClickAction(action.toCustom), // and its actions still work
    SeeActiveTheme(THEME_ALIAS.custom),
    SeeThemeChrome(),
  );
});

scenario('switching to an unknown theme shows an error and keeps the theme', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(THEMED_GAME.path),
    SeeGameStarted(THEMED_GAME.text.start),
    SeeActiveTheme(THEME_ALIAS.custom),
    ClickAction(THEMED_GAME.action.toMissing),
    seeEventually(
      ErrorAlerts.first(),
      (e) => Text.of(e),
      includes('Theme no-such is not registered'),
      '#actor sees the unknown-theme error',
    ),
    SeeActiveTheme(THEME_ALIAS.custom), // unchanged: anchored on the alert having appeared
  );
});
