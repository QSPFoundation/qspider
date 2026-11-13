import { PANELS_GAME } from '../fixtures/panels-game';
import { SeeElementText } from '../screenplay/content/checks';
import { FirstQspRegion, QspLayer, QspRegion } from '../screenplay/content/elements';
import { SeeMainText, SeeMainTextContaining } from '../screenplay/game/checks';
import {
  ClickAction,
  OpenPanelsFixture,
  PressEscape,
  PressKey,
  PressQuickLoad,
  PressQuickSave,
  PressRestartHotkey,
  ReturnToShelf,
} from '../screenplay/game/tasks';
import { SeeQuickSaveFilled } from '../screenplay/saves/checks';
import { CancelSavesPanel, OpenSavesPanel } from '../screenplay/saves/tasks';
import { OpenFromShelf } from '../screenplay/shelf/tasks';
import { SeeNoPauseScreen } from '../screenplay/pause/checks';
import { PauseScreen, RestartButton } from '../screenplay/pause/elements';
import { SeeMsg, SeeMsgGone } from '../screenplay/msg/checks';
import { DismissMsg } from '../screenplay/msg/tasks';
import { ChooseMenuItem } from '../screenplay/menu/tasks';
import { SeeStatsCountAbove, SeeStatsCountRising } from '../screenplay/stats/checks';
import { ClickWhenPresent, waitUntilAbsent, waitUntilPresent } from '../screenplay/support/presence';
import { scenario } from '../screenplay/support/scenario';

const { action: ACTION, text: TEXT } = PANELS_GAME;

/** From the start: enters the counter room (ticks reset to 0 there) and sees the timer tick on. */
const SeeCounterRunning = () => [
  ClickAction(ACTION.start.counter),
  SeeMainText(TEXT.counterRoom),
  SeeStatsCountAbove(2),
];

scenario("the pause screen's restart starts the game over", async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.lifecycle),
    SeeMainTextContaining(TEXT.lifeRoom),
    PressEscape(),
    waitUntilPresent(PauseScreen),
    ClickWhenPresent(RestartButton),
    SeeNoPauseScreen(),
    SeeMainText(TEXT.start),
    ...SeeCounterRunning(),
  );
});

// Restart during play (no pause screen) must stay on the game screen and leave the timer running.
scenario('Ctrl+R restarts the game in place', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.lifecycle),
    SeeMainTextContaining(TEXT.lifeRoom),
    PressRestartHotkey(),
    SeeMainText(TEXT.start),
    ...SeeCounterRunning(),
  );
});

scenario('the game can restart itself', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.lifecycle),
    ClickAction(ACTION.life.restart),
    SeeMainText(TEXT.start),
    ...SeeCounterRunning(),
  );
});

// Region: QspRegion renders regions$[name] and never re-reads the engine, so without reloadRegions on restart
// the re-entered life room would still show LIFE REGION. Layer: QspLayer re-reads the engine on mount
// (registerLayer), so its absence here holds even without reloadLayers; it checks behaviour, not the reload.
// The reload itself is proved by 'restart hides a theme-layout layer the game showed' (themes.scenario.ts):
// a layout-level layer stays mounted across a restart.
scenario('restart resets regions and layers', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.lifecycle),
    ClickAction(ACTION.life.fill),
    SeeElementText(QspRegion, TEXT.lifeRegion, 'region'),
    SeeElementText(QspLayer, TEXT.lifeLayer, 'layer'),
    PressEscape(),
    waitUntilPresent(PauseScreen),
    ClickWhenPresent(RestartButton),
    SeeMainText(TEXT.start),
    ClickAction(ACTION.start.lifecycle),
    SeeMainTextContaining(TEXT.lifeRoom), // settled anchor for the checks below
    SeeElementText(FirstQspRegion, '', 'region'),
    waitUntilAbsent(QspLayer),
  );
});

// The region and the layer live in the save. Returning to the shelf drops what the player knew of them, so
// after quickload they must come from the loaded game's variables.
scenario('a quickload in a reopened game brings back its region and layer', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.lifecycle),
    ClickAction(ACTION.life.fill),
    SeeElementText(QspRegion, TEXT.lifeRegion, 'region'),
    SeeElementText(QspLayer, TEXT.lifeLayer, 'layer'),
    PressQuickSave(),
    OpenSavesPanel(),
    SeeQuickSaveFilled(), // F5 is async and silent: settle on the filled slot
    CancelSavesPanel(),
    ReturnToShelf(),
    OpenFromShelf(PANELS_GAME.title),
    SeeMainText(TEXT.start),
    PressQuickLoad(),
    SeeMainTextContaining(TEXT.lifeRoom),
    SeeElementText(QspRegion, TEXT.lifeRegion, 'region'),
    SeeElementText(QspLayer, TEXT.lifeLayer, 'layer'),
  );
});

scenario('a game.cfg hotkey runs its location', async (player) => {
  await player.attemptsTo(OpenPanelsFixture(), PressKey(PANELS_GAME.hotkey), SeeMainText(TEXT.hotkeyRan));
});

// A restart behind an open message used to render the start under it and leave the engine stuck inside the
// old msg call (actions dead after OK). Ctrl+R is now ignored while a dialog is open.
scenario('Ctrl+R is ignored while a message is open', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.counter),
    SeeMainText(TEXT.counterRoom),
    ClickAction(ACTION.counter.message),
    SeeMsg(TEXT.counterMsg),
    PressRestartHotkey(),
    DismissMsg(),
    SeeMsgGone(),
    SeeMainText(TEXT.counterRoom),
    ClickAction(ACTION.counter.menu),
    ChooseMenuItem(TEXT.counterMenuItem),
    SeeMainTextContaining(TEXT.counterMenuPicked),
    SeeStatsCountRising(),
  );
});
