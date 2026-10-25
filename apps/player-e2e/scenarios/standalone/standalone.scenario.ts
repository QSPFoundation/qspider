// The standalone player (apps/player-standalone): it plays the game bundled in game/ next to its
// index.html, with no shelf. Run only by the standalone targets (e2e-standalone-web and
// e2e-standalone-desktop).
import { STANDALONE_GAME } from '../../fixtures/standalone-game';
import { SeeActiveTheme, SeeErrorAlertText, SeeGameStarted, SeeStartupFinished } from '../../screenplay/common/checks';
import { SeeMainText } from '../../screenplay/game/checks';
import { ClickAction } from '../../screenplay/game/tasks';
import { SeeResourceMark } from '../../screenplay/resources/checks';
import { SeeAppClosed } from '../../screenplay/standalone/checks';
import { ClickActionClosingTheApp } from '../../screenplay/standalone/tasks';
import { SeeSlotEmpty, SeeSlotFilled } from '../../screenplay/saves/checks';
import { CancelSavesPanel, ChooseSaveSlot } from '../../screenplay/saves/tasks';
import { SeeThemeChrome, SeeThemeCssApplied, SeeThemeScriptRan } from '../../screenplay/themes/e2e-custom/checks';
import { RestartPlayer, StartPlayer } from '../../screenplay/support/operate-player';
import { SeeCssValues } from '../../screenplay/support/page-script';
import { scenario } from '../../screenplay/support/scenario';

const { action: ACTION, text: TEXT, css: CSS, mark: MARK } = STANDALONE_GAME;
const SAVE_SLOT = 1;

// The game's quit (qspider_quit, the qspider.action:quit command) ends the game, and the standalone
// player closes its window. Not last: the next scenario restarts after an app that already exited.
scenario.desktopOnly('quitting the game closes the window', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.goToRoom),
    SeeMainText(TEXT.room(0)),
    ClickActionClosingTheApp(ACTION.quit),
    SeeAppClosed(),
  );
});

// The bundled game.cfg lists two games; the exact start text fails if the second one started.
scenario('the bundled game starts by itself', async (player) => {
  await player.attemptsTo(StartPlayer(), SeeStartupFinished(), SeeGameStarted(TEXT.start));
});

scenario('actions update the game text', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.goToRoom),
    SeeMainText(TEXT.room(0)),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.room(1)),
  );
});

scenario('loading a save restores the saved state', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.goToRoom),
    SeeMainText(TEXT.room(0)),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.room(1)),
    ClickAction(ACTION.save),
    SeeSlotEmpty(SAVE_SLOT), // start state; not a leftover guard (README, "Emptiness needs a settled anchor")
    ChooseSaveSlot(SAVE_SLOT),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.room(2)),
    ClickAction(ACTION.load),
    ChooseSaveSlot(SAVE_SLOT),
    SeeMainText(TEXT.room(1)), // restore is observable
  );
});

scenario('a save survives a restart', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.goToRoom),
    SeeMainText(TEXT.room(0)),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.room(1)),
    ClickAction(ACTION.save),
    ChooseSaveSlot(SAVE_SLOT),
    // Settled anchor before the restart: the reopened dialog reads the save back as filled.
    ClickAction(ACTION.save),
    SeeSlotFilled(SAVE_SLOT),
    CancelSavesPanel(),
    RestartPlayer(),
    SeeStartupFinished(),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.goToRoom),
    SeeMainText(TEXT.room(0)),
    ClickAction(ACTION.load),
    ChooseSaveSlot(SAVE_SLOT),
    SeeMainText(TEXT.room(1)), // the save outlived the page
  );
});

// The game.cfg entry's defaultTheme (from themes) and its resources (styles, scripts) all apply.
scenario("the game's theme and resources apply", async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeGameStarted(TEXT.start),
    SeeActiveTheme(STANDALONE_GAME.theme),
    SeeThemeChrome(),
    SeeThemeScriptRan(),
    SeeThemeCssApplied(),
    SeeCssValues({ root: true }, { [CSS.property]: CSS.value }),
    SeeResourceMark(MARK.qa, MARK.text),
  );
});

// The desktop app reads its own files through read_app_asset (src-tauri/src/main.rs), not fetch: the asset
// server answers a missing file with index.html (status 200), which the engine would get as the game file.
scenario.desktopOnly('a missing bundled file is rejected, not served as the page', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.includeMissing),
    SeeErrorAlertText('file not found: game/missing.qsps'), // read_app_asset's cause
    ClickAction(ACTION.goToRoom),
    SeeMainText(TEXT.room(0)),
  );
});
