import { AERO_GAME, GUI_CFG_GAME, MISSING_THEME_GAME, THEMED_GAME, THEME_ALIAS } from '../fixtures/themes-game';
import { SeeStatsInDock } from '../screenplay/classic/checks';
import { SeeActiveTheme, SeeErrorAlertText, SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeElementText } from '../screenplay/content/checks';
import { NoticeToastElement } from '../screenplay/common/elements';
import { QspLayer } from '../screenplay/content/elements';
import { SeeGameInfoTags, SeeMainText } from '../screenplay/game/checks';
import { ClickAction, PressEscape, ReturnToShelf } from '../screenplay/game/tasks';
import { PauseScreen, RestartButton } from '../screenplay/pause/elements';
import { ClickWhenPresent, waitUntilAbsent, waitUntilPresent } from '../screenplay/support/presence';
import { SeeMsg, SeeMsgGone } from '../screenplay/msg/checks';
import { DismissMsg } from '../screenplay/msg/tasks';
import { LoadGame, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';
import {
  SeeThemeChrome,
  SeeThemeCssApplied,
  SeeThemeScriptRan,
  SeeThemeWordSpacing,
} from '../screenplay/themes/e2e-custom/checks';

// The start location offers both actions (the `next` location has none), so the message comes first.
const { action: ACTION, text: TEXT } = AERO_GAME;

scenario('an Aero-mode game plays under the Aero theme', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(AERO_GAME.path),
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
    LoadGame(THEMED_GAME.path),
    SeeGameStarted(THEMED_GAME.text.start),
    SeeActiveTheme(THEME_ALIAS.custom),
    SeeThemeChrome(),
    SeeThemeCssApplied(),
    SeeThemeScriptRan(),
    SeeMainText(THEMED_GAME.text.start),
    ClickAction(THEMED_GAME.action.showLayer),
    SeeElementText(QspLayer, THEMED_GAME.theme.layerText, 'the theme layer reads its text'),
  );
});

scenario('a theme template keeps the space between words on separate lines', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(THEMED_GAME.path),
    SeeGameStarted(THEMED_GAME.text.start),
    SeeThemeChrome(),
    SeeThemeWordSpacing(),
  );
});

// The themed game's theme file also defines a theme named qspider:classic. The player keeps its own: the
// next game, whose qspgui.cfg builds its layout from the built-in classic theme, still starts and lays out.
scenario('a game cannot replace a built-in theme', async (player) => {
  const { text, dock } = GUI_CFG_GAME;
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(THEMED_GAME.path),
    SeeGameStarted(THEMED_GAME.text.start),
    ReturnToShelf(),
    LoadGame(GUI_CFG_GAME.path),
    SeeGameStarted(text.start),
    SeeActiveTheme(THEME_ALIAS.classic),
    SeeStatsInDock(dock.cfg, text.stats),
  );
});

scenario("game info tags show the game's title, author, version and description", async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(THEMED_GAME.path),
    SeeGameStarted(THEMED_GAME.text.start),
    SeeGameInfoTags({ title: THEMED_GAME.title, ...THEMED_GAME.info }),
  );
});

const MISSING_NOTICE = `Theme ${MISSING_THEME_GAME.missingTheme} not found`;

scenario('a missing defaultTheme in Aero mode falls back to Aero, with a notice', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(MISSING_THEME_GAME.aeroPath),
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
      LoadGame(AERO_GAME.path),
      SeeGameStarted(TEXT.start),
      SeeActiveTheme(THEME_ALIAS.aero),
      ReturnToShelf(),
      LoadGame(MISSING_THEME_GAME.classicPath),
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
    LoadGame(AERO_GAME.path),
    SeeGameStarted(TEXT.start),
    SeeActiveTheme(THEME_ALIAS.aero),
    ReturnToShelf(),
    LoadGame(MISSING_THEME_GAME.classicPath),
    SeeActiveTheme(THEME_ALIAS.classic),
    SeeMainText(MISSING_THEME_GAME.text.start), // the main text is readable after an Aero game
  );
});

scenario('the game switches theme at runtime', async (player) => {
  const { action } = THEMED_GAME;
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(THEMED_GAME.path),
    SeeGameStarted(THEMED_GAME.text.start),
    SeeActiveTheme(THEME_ALIAS.custom),
    ClickAction(action.toClassic),
    SeeActiveTheme(THEME_ALIAS.classic),
    // the built-in classic theme, not the game's theme of that name (which has no main text)
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
    LoadGame(THEMED_GAME.path),
    SeeGameStarted(THEMED_GAME.text.start),
    SeeActiveTheme(THEME_ALIAS.custom),
    ClickAction(THEMED_GAME.action.toMissing),
    SeeErrorAlertText('Theme no-such is not registered'),
    SeeActiveTheme(THEME_ALIAS.custom), // unchanged: anchored on the alert having appeared
  );
});

// The layer is theme-level (outside the main content), so it stays mounted across a restart and only
// reloadLayers can clear it. A layer inside the main content re-reads the engine on mount and cannot show that
// (see lifecycle.scenario.ts). Kept here: the fixture and its elements are the theme's.
scenario('restart hides a theme-layout layer the game showed', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(THEMED_GAME.path),
    SeeGameStarted(THEMED_GAME.text.start),
    ClickAction(THEMED_GAME.action.showLayer),
    SeeElementText(QspLayer, THEMED_GAME.theme.layerText, 'the theme layer reads its text'),
    PressEscape(),
    waitUntilPresent(PauseScreen),
    ClickWhenPresent(RestartButton),
    SeeMainText(THEMED_GAME.text.start),
    waitUntilAbsent(QspLayer),
  );
});

// The cfg names the stats panel (vars) with dir=4, the left dock. The control is the same game packed without
// its qspgui.cfg: the default classic theme puts the stats in the bottom dock, so the dock tells the two apart.
scenario('a qspgui.cfg moves panels into its docks', async (player) => {
  const { text, dock } = GUI_CFG_GAME;
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(GUI_CFG_GAME.path),
    SeeGameStarted(text.start),
    SeeStatsInDock(dock.cfg, text.stats),
    SeeMainText(text.start), // the game still plays
  );
});

scenario('without a qspgui.cfg the stats panel sits in the default classic dock', async (player) => {
  const { text, dock } = GUI_CFG_GAME;
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(GUI_CFG_GAME.controlPath),
    SeeGameStarted(text.start),
    SeeStatsInDock(dock.default, text.stats),
  );
});
