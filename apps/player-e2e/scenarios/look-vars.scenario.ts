import { CLASSIC_DEFAULT_LOOK, GUI_CFG_GAME } from '../fixtures/themes-game';
import { SeeStatsInDock } from '../screenplay/classic/checks';
import { AERO_DEFAULTS_SUBSET, LOOK_AERO_TABLE, LOOK_CLASSIC_TABLE, LOOK_GAME } from '../fixtures/look-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeMainTextContaining } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { SeeLookTable } from '../screenplay/look/checks';
import { SeeMsg } from '../screenplay/msg/checks';
import { OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { SeeCssValues } from '../screenplay/support/page-script';
import { scenario } from '../screenplay/support/scenario';

const { text: TEXT, actions: ACTIONS } = LOOK_GAME;

scenario('the Aero theme maps every look variable', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(LOOK_GAME.aeroPath),
    SeeGameStarted(TEXT.start),
    SeeCssValues({ root: true }, AERO_DEFAULTS_SUBSET),
    ClickAction(ACTIONS.start.setVars),
    SeeMainTextContaining(TEXT.varsSet),
    SeeLookTable({ root: true }, LOOK_AERO_TABLE),
  );
});

scenario('the classic theme maps every look variable', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(LOOK_GAME.classicPath),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTIONS.start.setVars),
    SeeMainTextContaining(TEXT.varsSet),
    SeeLookTable({ root: true }, LOOK_CLASSIC_TABLE),
  );
});

scenario('the look variables reach the dialog portal', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(LOOK_GAME.aeroPath),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTIONS.start.setVars),
    SeeMainTextContaining(TEXT.varsSet),
    ClickAction(ACTIONS.start.toDialogs),
    SeeMainTextContaining(TEXT.dialogs),
    ClickAction(ACTIONS.dialogs.msg),
    SeeMsg(LOOK_GAME.dialog.msg),
    SeeCssValues(
      { qsp: 'msg' },
      { '--color': LOOK_AERO_TABLE['--color']!, '--font-size': LOOK_AERO_TABLE['--font-size']! },
    ),
  );
});

// The original player lets the game's colours win and falls back to the qspgui.cfg ones. The classic theme
// must therefore leave the --code-* variables unset when the game sets nothing.
scenario('qspgui.cfg colours and font apply to the classic layout', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(GUI_CFG_GAME.path),
    SeeGameStarted(GUI_CFG_GAME.text.start),
    SeeStatsInDock(GUI_CFG_GAME.dock.cfg, GUI_CFG_GAME.text.stats),
    SeeCssValues({ root: true }, GUI_CFG_GAME.consumed),
  );
});

scenario('a classic game without qspgui.cfg keeps the default look', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(GUI_CFG_GAME.controlPath),
    SeeGameStarted(GUI_CFG_GAME.text.start),
    SeeStatsInDock(GUI_CFG_GAME.dock.default, GUI_CFG_GAME.text.stats),
    SeeCssValues({ root: true }, CLASSIC_DEFAULT_LOOK),
  );
});
