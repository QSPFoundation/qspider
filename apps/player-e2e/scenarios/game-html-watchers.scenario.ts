import { GAME_HTML } from '../fixtures/game-html-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeElementText } from '../screenplay/content/checks';
import { QspLayer, QspRegion, QspStyle, QspVariable, ShowChild } from '../screenplay/content/elements';
import { ClickAction } from '../screenplay/game/tasks';
import { LoadGame, StartPlayer } from '../screenplay/support/operate-player';
import { waitUntilAbsent, waitUntilPresent } from '../screenplay/support/presence';
import { scenario } from '../screenplay/support/scenario';

const { actions: ACTION, text: TEXT } = GAME_HTML;

const openWatchers = [
  StartPlayer(),
  SeeStartupFinished(),
  LoadGame(GAME_HTML.path),
  SeeGameStarted(TEXT.start),
  ClickAction(ACTION.watchers),
] as const;

scenario('qsp-variable follows its variable', async (player) => {
  await player.attemptsTo(
    ...openWatchers,
    SeeElementText(QspVariable, TEXT.varOne, `#actor sees the variable read "${TEXT.varOne}"`),
    ClickAction(ACTION.changeVar),
    SeeElementText(QspVariable, TEXT.varTwo, `#actor sees the variable read "${TEXT.varTwo}"`),
  );
});

scenario('qsp-show renders its child only while the condition holds', async (player) => {
  await player.attemptsTo(
    ...openWatchers,
    SeeElementText(QspVariable, TEXT.varOne, `#actor sees the variable read "${TEXT.varOne}"`),
    waitUntilAbsent(ShowChild),
    ClickAction(ACTION.changeVar),
    waitUntilPresent(ShowChild),
  );
});

// QspStyle renders a <style> only while its variable is non-empty. <style> text is not readable
// through every driver, so presence is the portable proof that it follows its variable.
scenario('qsp-style is rendered only once its variable is set', async (player) => {
  await player.attemptsTo(
    ...openWatchers,
    waitUntilAbsent(QspStyle),
    ClickAction(ACTION.changeStyle),
    waitUntilPresent(QspStyle),
  );
});

scenario('qsp-region shows the text put into its region', async (player) => {
  await player.attemptsTo(
    ...openWatchers,
    ClickAction(ACTION.fillRegion),
    SeeElementText(QspRegion, TEXT.regionText, 'region'),
  );
});

// A hidden layer renders nothing (QspLayer returns null), so absent-then-present is the show.
// (Playwright reports the shown full-viewport layer as not visible, so isVisible() cannot be used.)
scenario('qsp-layer is rendered only once shown', async (player) => {
  await player.attemptsTo(
    ...openWatchers,
    waitUntilAbsent(QspLayer),
    ClickAction(ACTION.fillLayer),
    SeeElementText(QspLayer, TEXT.layerText, 'layer'),
  );
});
