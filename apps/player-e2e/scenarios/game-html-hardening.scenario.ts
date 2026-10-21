import { GAME_HTML } from '../fixtures/game-html-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeElementAttribute } from '../screenplay/content/checks';
import { ErrorAlerts } from '../screenplay/common/elements';
import { ContentMark, PwnedAttribute } from '../screenplay/content/elements';
import { ClickContent } from '../screenplay/content/tasks';
import { SeeMainText, SeeMainTextContaining, SeeMainTextWithout } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { waitUntilAbsent, waitUntilPresent } from '../screenplay/support/presence';
import { scenario } from '../screenplay/support/scenario';

const { actions: ACTION, marks: MARK, text: TEXT } = GAME_HTML;

const openGame = [
  StartPlayer(),
  SeeStartupFinished(),
  OpenGameFile(GAME_HTML.path),
  SeeGameStarted(TEXT.start),
] as const;

scenario('an svg script in game text does not run', async (player) => {
  await player.attemptsTo(
    ...openGame,
    ClickAction(ACTION.hostile),
    ClickAction(ACTION.hostileSvg),
    SeeMainText(TEXT.svgBenign),
  );
});

scenario('an iframe in game text cannot reach the host page', async (player) => {
  await player.attemptsTo(
    ...openGame,
    ClickAction(ACTION.hostile),
    ClickAction(ACTION.hostileIframe),
    SeeMainText(TEXT.iframeBenign),
    waitUntilPresent(ContentMark(MARK.hostileFrame)),
    // Deterministic pin of the sandbox fix; the runtime check below cannot see a late-running script.
    SeeElementAttribute(ContentMark(MARK.hostileFrame), 'sandbox', 'allow-scripts'),
    waitUntilAbsent(PwnedAttribute),
  );
});

scenario('a mixed-case javascript: link does not run', async (player) => {
  await player.attemptsTo(
    ...openGame,
    ClickAction(ACTION.hostile),
    ClickAction(ACTION.hostileJs),
    ClickContent(ContentMark(MARK.jsLink)),
    // The href='#' assertion pins the player's own guard (extractAttributes valueProcessors.href rewrites
    // JavaScript: to '#' before React sees it). React is only a secondary backstop: it throws on a raw
    // javascript: URL.
    SeeElementAttribute(ContentMark(MARK.jsLink), 'href', '#'),
    SeeMainTextContaining(TEXT.jsBenign),
    SeeMainTextWithout(TEXT.inject),
  );
});

scenario('malformed markup still renders', async (player) => {
  await player.attemptsTo(
    ...openGame,
    ClickAction(ACTION.hostile),
    ClickAction(ACTION.hostileMalformed),
    SeeMainTextContaining(TEXT.malformed),
    waitUntilAbsent(ErrorAlerts.first()),
  );
});
