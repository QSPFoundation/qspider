import { GAME_HTML } from '../fixtures/game-html-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeElementAttribute, SeeNeutralizedHref, SeeNeutralizedUrl } from '../screenplay/content/checks';
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

scenario('a javascript: link with whitespace in its scheme is neutralized', async (player) => {
  await player.attemptsTo(
    ...openGame,
    ClickAction(ACTION.hostile),
    ClickAction(ACTION.hostileJs),
    // Browsers ignore a leading space and a tab inside the scheme, so the player's guard must strip them too.
    // React's own guard would replace the URL with a javascript:throw one, which this check rejects.
    SeeNeutralizedHref(ContentMark(MARK.jsTabLink)),
    ClickContent(ContentMark(MARK.jsTabLink)),
    SeeMainTextContaining(TEXT.jsBenign),
    SeeMainTextWithout(TEXT.inject),
  );
});

scenario('javascript: in formaction does not run', async (player) => {
  await player.attemptsTo(
    ...openGame,
    ClickAction(ACTION.hostile),
    ClickAction(ACTION.hostileForm),
    SeeMainTextContaining(TEXT.formBenign),
    // React sanitises only the camelCase formAction prop; game text reaches it as lowercase formaction.
    SeeNeutralizedUrl(ContentMark(MARK.hostileFormaction), 'formaction'),
    SeeNeutralizedUrl(ContentMark(MARK.hostileInputFormaction), 'formaction'),
    SeeNeutralizedUrl(ContentMark(MARK.hostileFormAction), 'action'),
    SeeNeutralizedUrl(ContentMark(MARK.hostileFormDash), 'formaction'),
    // The absence check after the click proves something only in a red run (the payload ran). On green, submitting
    // to the neutralized '#' reloads the player, as any form without qsp-on:submit does, which also clears it: the
    // attribute checks above are the green proof.
    ClickContent(ContentMark(MARK.hostileFormaction)),
    waitUntilAbsent(PwnedAttribute),
  );
});

scenario('script URLs in images and svg links are neutralized', async (player) => {
  await player.attemptsTo(
    ...openGame,
    ClickAction(ACTION.hostile),
    ClickAction(ACTION.hostileUrls),
    SeeMainTextContaining(TEXT.urlsBenign),
    // src keeps data: (games use data: images), so a blocked src becomes about:blank, never the page URL.
    SeeElementAttribute(DocumentMark(MARK.hostileImgSrc), 'src', 'about:blank'),
    SeeNeutralizedUrl(DocumentMark(MARK.hostileSvgLink), 'xlink:href'),
    SeeNeutralizedUrl(DocumentMark(MARK.hostileSvgData), 'xlink:href'),
    // Dashed names are camelCased into xlinkHref later; React would rewrite only the javascript: one.
    SeeNeutralizedUrl(DocumentMark(MARK.hostileSvgDash), 'xlink:href'),
    SeeNeutralizedUrl(DocumentMark(MARK.hostileSvgDashData), 'xlink:href'),
  );
});

scenario('an svg image keeps its data: picture', async (player) => {
  await player.attemptsTo(
    ...openGame,
    ClickAction(ACTION.hostile),
    ClickAction(ACTION.hostileUrls),
    SeeMainTextContaining(TEXT.urlsBenign),
    SeeElementAttribute(DocumentMark(MARK.svgDataImage), 'xlink:href', GAME_HTML.dataImage),
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
