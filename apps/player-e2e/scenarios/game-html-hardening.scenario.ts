import { GAME_HTML } from '../fixtures/game-html-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeElementAttribute, SeeNeutralizedHref } from '../screenplay/content/checks';
import { ErrorAlerts } from '../screenplay/common/elements';
import { ContentMark, DocumentMark, PwnedAttribute } from '../screenplay/content/elements';
import { ClickContent } from '../screenplay/content/tasks';
import { SeeMainText, SeeMainTextContaining, SeeMainTextWithout } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { LoadGame, StartPlayer } from '../screenplay/support/operate-player';
import { waitUntilAbsent, waitUntilPresent } from '../screenplay/support/presence';
import { scenario } from '../screenplay/support/scenario';

const { actions: ACTION, marks: MARK, text: TEXT } = GAME_HTML;

const openGame = [StartPlayer(), SeeStartupFinished(), LoadGame(GAME_HTML.path), SeeGameStarted(TEXT.start)] as const;

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
    // Pins the player's own guard (extractAttributes valueProcessors.href rewrites JavaScript: to '#' before
    // React sees it). React is only a secondary backstop: it throws on a raw javascript: URL.
    SeeNeutralizedHref(ContentMark(MARK.jsLink)),
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

scenario('tags that redirect or embed are dropped from game text', async (player) => {
  await player.attemptsTo(
    ...openGame,
    ClickAction(ACTION.hostile),
    ClickAction(ACTION.hostileTags),
    // The benign line renders after the risky tags, so the absence checks below cannot pass before the render.
    SeeMainTextContaining(TEXT.tagsBenign),
    waitUntilAbsent(DocumentMark(MARK.hostileBase)),
    waitUntilAbsent(DocumentMark(MARK.hostileMeta)),
    waitUntilAbsent(DocumentMark(MARK.hostileEmbed)),
    waitUntilAbsent(DocumentMark(MARK.hostileObject)),
    waitUntilAbsent(ErrorAlerts.first()),
  );
});

scenario('a tag attribute cannot smuggle a dropped tag or an unsandboxed iframe', async (player) => {
  await player.attemptsTo(
    ...openGame,
    ClickAction(ACTION.hostile),
    ClickAction(ACTION.hostileTagAttr),
    // The benign line renders after the risky elements, so the absence checks below cannot pass before the render.
    SeeMainTextContaining(TEXT.tagAttrBenign),
    waitUntilAbsent(ErrorAlerts.first()),
    waitUntilPresent(ContentMark(MARK.hostileTagFrame)),
    // Deterministic pin of the sandbox; the PwnedAttribute check below cannot see a late-running srcdoc script.
    SeeElementAttribute(ContentMark(MARK.hostileTagFrame), 'sandbox', 'allow-scripts'),
    waitUntilAbsent(PwnedAttribute),
    waitUntilAbsent(DocumentMark(MARK.hostileTagBase)),
    waitUntilAbsent(DocumentMark(MARK.hostileTagMeta)),
  );
});

scenario('a namespaced script in game text does not run', async (player) => {
  await player.attemptsTo(
    ...openGame,
    ClickAction(ACTION.hostile),
    ClickAction(ACTION.hostileTagAttr),
    // The benign line renders after the svg:script lines; a script element inserted by React runs synchronously,
    // so a script that escaped the drop has already set the attribute by then.
    SeeMainTextContaining(TEXT.tagAttrBenign),
    waitUntilAbsent(PwnedAttribute),
  );
});
