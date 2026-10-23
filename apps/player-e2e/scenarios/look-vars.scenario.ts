import { AERO_GAME, CLASSIC_DEFAULT_LOOK, GUI_CFG_GAME } from '../fixtures/themes-game';
import { SeeStatsInDock } from '../screenplay/classic/checks';
import { AERO_DEFAULTS_SUBSET, LOOK_AERO_TABLE, LOOK_CLASSIC_TABLE, LOOK_GAME } from '../fixtures/look-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { AeroMenuItem } from '../screenplay/themes/aero/elements';
import { SeeActionImage, SeeAeroMenuItems, SeeAeroObjects } from '../screenplay/themes/aero/checks';
import { SeeInput, SeeInputGone } from '../screenplay/input/checks';
import { SeeMainTextContaining } from '../screenplay/game/checks';
import { ClickAction, HoverAction, ReturnToShelf } from '../screenplay/game/tasks';
import { Action } from '../screenplay/game/elements';
import { ClickWhenPresent, waitUntilPresent } from '../screenplay/support/presence';
import { SeeStatsContaining } from '../screenplay/stats/checks';
import { SeeLookTable } from '../screenplay/look/checks';
import { SeeMsg, SeeMsgGone } from '../screenplay/msg/checks';
import { DismissMsg } from '../screenplay/msg/tasks';
import { CancelInput } from '../screenplay/input/tasks';
import { Hover } from '../screenplay/support/hover';
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
// must therefore leave the --code-* variables unset when the game sets nothing, and let them win when it does.
scenario('qspgui.cfg colours and font apply to the classic layout', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(GUI_CFG_GAME.path),
    SeeGameStarted(GUI_CFG_GAME.text.start),
    SeeStatsInDock(GUI_CFG_GAME.dock.cfg, GUI_CFG_GAME.text.stats),
    SeeCssValues({ root: true }, GUI_CFG_GAME.consumed),
    // What the game sets wins over the cfg; what it leaves unset (the link colour) stays the cfg one.
    ClickAction(GUI_CFG_GAME.actions.setLook),
    SeeMainTextContaining(GUI_CFG_GAME.text.lookSet),
    SeeCssValues({ root: true }, { ...GUI_CFG_GAME.gameSet, '--link-color': GUI_CFG_GAME.consumed['--link-color']! }),
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

const wrap = (wrapper: string, text: string): string => `${wrapper}[${text}]`;

// The Aero format variables ($MAIN_FORMAT, $ACTION_FORMAT, ...) wrap each panel's text; the selected formats
// apply to the hovered item. 'Pic' reads back through its wrapped label once the formats are set.
scenario('Aero format variables wrap the panels', async (player) => {
  const { format: F, dialog: D } = LOOK_GAME;
  const pic = wrap(F.action, ACTIONS.formats.pic);
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(LOOK_GAME.aeroPath),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTIONS.start.toFormats),
    SeeMainTextContaining(TEXT.formats),
    ClickAction(ACTIONS.formats.setFormats),
    // `pl` ends the line, so the closing bracket of main and stats text sits on the next one.
    SeeMainTextContaining(`${F.main}[${TEXT.formats}`),
    SeeStatsContaining(`${F.stats}[${TEXT.formatsStats}`),
    SeeAeroObjects([wrap(F.object, TEXT.object)]),
    SeeActionImage(pic, LOOK_GAME.images.action),
    ClickAction(pic),
    SeeMainTextContaining(TEXT.pic),
    ClickAction(wrap(F.action, ACTIONS.formats.msg)),
    SeeMsg(wrap(F.msg, D.formatsMsg)),
    DismissMsg(),
    SeeMsgGone(),
    ClickAction(wrap(F.action, ACTIONS.formats.input)),
    SeeInput(wrap(F.input, D.formatsInput)),
    CancelInput(),
    SeeInputGone(),
    ClickAction(wrap(F.action, ACTIONS.formats.menu)),
    SeeAeroMenuItems(D.formatsMenuItems.map((item) => wrap(F.menu, item))),
    // The hovered item takes the selected format, the other keeps the plain one.
    Hover(AeroMenuItem(wrap(F.menu, D.formatsMenuItems[0]!))),
    SeeAeroMenuItems([wrap(F.selectedMenu, D.formatsMenuItems[0]!), wrap(F.menu, D.formatsMenuItems[1]!)]),
    ClickWhenPresent(AeroMenuItem(wrap(F.menu, D.formatsMenuItems[1]!))),
    SeeMainTextContaining(TEXT.menuPicked),
    HoverAction(pic),
    SeeActionImage(wrap(F.selectedAction, ACTIONS.formats.pic), LOOK_GAME.images.action),
    // The next game starts from the default formats: its main text and action labels are unwrapped.
    ReturnToShelf(),
    OpenGameFile(AERO_GAME.path),
    SeeGameStarted(AERO_GAME.text.start),
    waitUntilPresent(Action(AERO_GAME.action.next)),
  );
});
