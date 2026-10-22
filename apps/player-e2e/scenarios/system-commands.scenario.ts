import { PANELS_GAME } from '../fixtures/panels-game';
import { ErrorAlerts } from '../screenplay/common/elements';
import { SeeElementText } from '../screenplay/content/checks';
import { QspLayer, QspRegion } from '../screenplay/content/elements';
import { SeeMainText, SeeMainTextContaining } from '../screenplay/game/checks';
import { ClickAction, OpenPanelsFixture } from '../screenplay/game/tasks';
import { SeeShelfIncludes } from '../screenplay/shelf/checks';
import { RecordWindowEvents, SeePageProbe, SeeRecordedEvent } from '../screenplay/support/page-script';
import { waitUntilAbsent } from '../screenplay/support/presence';
import { scenario } from '../screenplay/support/scenario';

const { action: ACTION, text: TEXT, event: EVENT } = PANELS_GAME;

scenario('a game event reaches the page', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.system),
    SeeMainText(TEXT.systemRoom), // settled anchor: the room is entered before the recorder starts
    RecordWindowEvents('qspider-event'),
    ClickAction(ACTION.system.fireEvent),
    SeeRecordedEvent('qspider-event', { name: EVENT.name, args: EVENT.args }),
  );
});

scenario('the game updates a region through the qspider module', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.system),
    ClickAction(ACTION.system.region),
    SeeElementText(QspRegion, TEXT.regionOne, 'region'),
  );
});

// A hidden layer renders nothing, so absent-then-present is the show.
scenario('the game shows and hides a layer', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.system),
    SeeMainTextContaining(TEXT.systemRoom), // settled anchor for the absence check below
    waitUntilAbsent(QspLayer),
    ClickAction(ACTION.system.layer),
    SeeElementText(QspLayer, TEXT.layerOn, 'layer'),
    ClickAction(ACTION.system.unlayer),
    waitUntilAbsent(QspLayer),
  );
});

// Web asserts document.fullscreenElement through the page probe; Chromium grants fullscreen on the action click.
scenario.webOnly('going fullscreen', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.system),
    ClickAction(ACTION.system.fullscreen),
    SeeMainTextContaining(TEXT.afterFullscreen),
    SeePageProbe('fullscreenElementMarker', 'qsp-game-root'),
  );
});

// Desktop (Tauri under Xvfb) has no window manager, so fullscreen cannot be observed; it asserts "no error, game continues": the text after the command, a working action and no error alert.
scenario.desktopOnly('going fullscreen', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.system),
    ClickAction(ACTION.system.fullscreen),
    SeeMainTextContaining(TEXT.afterFullscreen),
    ClickAction(ACTION.system.region),
    SeeElementText(QspRegion, TEXT.regionOne, 'region'),
    waitUntilAbsent(ErrorAlerts.first()),
  );
});

scenario('quitting from the game returns to the shelf', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.system),
    ClickAction(ACTION.system.quit),
    SeeShelfIncludes(PANELS_GAME.title),
  );
});
