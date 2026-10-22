import { PANELS_GAME } from '../fixtures/panels-game';
import { SeeElementText } from '../screenplay/content/checks';
import { FirstQspRegion, QspLayer, QspRegion } from '../screenplay/content/elements';
import { SeeMainText, SeeMainTextContaining } from '../screenplay/game/checks';
import { ClickAction, OpenPanelsFixture, PressEscape, PressKey, PressRestartHotkey } from '../screenplay/game/tasks';
import { SeeNoPauseScreen } from '../screenplay/pause/checks';
import { PauseScreen, RestartButton } from '../screenplay/pause/elements';
import { SeeStatsCountAbove } from '../screenplay/stats/checks';
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

scenario('a game.cfg hotkey runs its location', async (player) => {
  await player.attemptsTo(OpenPanelsFixture(), PressKey(PANELS_GAME.hotkey), SeeMainText(TEXT.hotkeyRan));
});
