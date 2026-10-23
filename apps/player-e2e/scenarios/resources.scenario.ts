import { endsWith, equals } from '@serenity-js/assertions';
import { RESOURCES_GAME, RESOURCES_IMAGES, RESOURCES_SVGS } from '../fixtures/resources-game';
import { SeeGameStarted, SeeNoticeContaining, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeMainTextContaining } from '../screenplay/game/checks';
import { ClickAction, ReturnToShelf } from '../screenplay/game/tasks';
import { SeeShelfIncludes } from '../screenplay/shelf/checks';
import { SeeResourceMark } from '../screenplay/resources/checks';
import { SeeGameResourceCount } from '../screenplay/support/game-resources';
import { ARCHIVES } from '../fixtures/archives';
import type { Task } from '@serenity-js/core';
import { SeeMenu } from '../screenplay/menu/checks';
import { CancelMenu } from '../screenplay/menu/tasks';
import { CloseView } from '../screenplay/view/tasks';
import { DelayRequests, OpenGameFile, OpenGameUrl, StartPlayer } from '../screenplay/support/operate-player';
import { SeeCssValue, SeeCssValues } from '../screenplay/support/page-script';
import { SeeImageLoaded } from '../screenplay/support/image-loaded';
import { scenario } from '../screenplay/support/scenario';
import { SeeSoundState, SeeSoundWebAudio } from '../screenplay/support/sound-state';

const { text: TEXT, actions: ACTIONS, images: IMAGES, files: FILES } = RESOURCES_GAME;
const width = (file: string): number => (RESOURCES_IMAGES[file] ?? RESOURCES_SVGS[file])![0];

// Every <img> spelling the game uses must load (the check is the picture's natural width: each file has its own).
// The wrong-case row only loads where the store lowercases paths (archives) or the lookup ignores case per path
// segment (the desktop plain folder); the web plain-URL route is a case-sensitive server and is not asserted.
const SEE_START_IMAGES = Object.values(IMAGES).map((image) => SeeImageLoaded({ qa: image.qa }, width(image.file)));

scenario('game images load from every kind of path (archive)', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(RESOURCES_GAME.zipPath),
    SeeGameStarted(TEXT.start),
    ...SEE_START_IMAGES,
    SeeImageLoaded({ qsp: 'action-image' }, width(FILES.action)),
    SeeImageLoaded({ qsp: 'object-image' }, width(FILES.object)),
    ClickAction(ACTIONS.start.toMedia),
    SeeMainTextContaining(TEXT.media),
    ClickAction(ACTIONS.media.menuImage),
    SeeMenu(),
    SeeImageLoaded({ qsp: 'menu-image' }, width(FILES.menu)),
    CancelMenu(),
    ClickAction(ACTIONS.media.viewBackslash),
    SeeImageLoaded({ qsp: 'view-image' }, width(FILES.view)),
    CloseView(),
    // A custom property keeps its text, so a first-only backslash replace shows as `Img/Sub\Back.png`.
    ClickAction(ACTIONS.media.backimageBackslash),
    SeeCssValue({ root: true }, '--background-image', endsWith(`${FILES.backslash}")`)),
    // Absolute and data: URLs are used as they are (no game base in front).
    ClickAction(ACTIONS.media.backimageData),
    SeeCssValue({ root: true }, '--background-image', equals(`url("${RESOURCES_GAME.dataImage}")`)),
    ClickAction(ACTIONS.media.backimageExternal),
    SeeCssValue({ root: true }, '--background-image', equals(`url("${RESOURCES_GAME.externalImage}")`)),
    // A sound at an absolute URL is fetched by the page itself (Web Audio). With the game base in front of it the
    // fetch fails and Howler falls back to an HTML5 Audio element, which still reports `playing`.
    ClickAction(ACTIONS.media.playExternal),
    SeeSoundState('ext.wav', { playing: true, volume: 1 }),
    SeeSoundWebAudio('ext.wav', true),
    // A game script's XMLHttpRequest to an absolute URL is a real request: the shim would answer it empty.
    ClickAction(ACTIONS.media.fetchText),
    SeeResourceMark(RESOURCES_GAME.marks.xhr, RESOURCES_GAME.externalText.text),
  );
});

scenario.desktopOnly('game images load from a plain folder', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(RESOURCES_GAME.folderGamePath),
    SeeGameStarted(TEXT.start),
    ...SEE_START_IMAGES,
  );
});

// game.cfg resources: styles, scripts and the font are in place before the game's first text, scripts keep their
// order, a failed one is reported, and the game's own resources go with it.
const { marks: MARKS, scriptText: SCRIPT, css: CSS, cfg: CFG } = RESOURCES_GAME;

/** The first start already saw script one; the resources location then shows styles, order and the font. */
const SEE_RESOURCES_APPLIED: Task[] = [
  SeeResourceMark(MARKS.startSeen, SCRIPT.startSeen),
  // At the start the style was already applied and the font loaded.
  SeeResourceMark(MARKS.startFont, SCRIPT.startFont),
  SeeResourceMark(MARKS.startReady, SCRIPT.startReady),
  ClickAction(ACTIONS.start.toResources),
  SeeMainTextContaining(TEXT.resources),
  SeeResourceMark(MARKS.scriptOne, SCRIPT.one),
  SeeResourceMark(MARKS.scriptTwo, SCRIPT.two),
  SeeResourceMark(MARKS.order, SCRIPT.order),
  SeeResourceMark(MARKS.fontStatus, SCRIPT.fontLoaded),
  SeeCssValues({ root: true }, CSS.root),
  SeeCssValues({ qa: MARKS.styled }, CSS.element),
];

const TITLE = 'game.cfg resources load before the game starts, in order';

scenario(TITLE, async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(RESOURCES_GAME.zipPath),
    SeeGameStarted(TEXT.start),
    ...SEE_RESOURCES_APPLIED,
  );
});

// The same game served from a plain URL, where the browser's own network fetches the scripts: script one is
// held back, so it arrives long after script two and after the engine could have started the game; the first style
// and the font are held back too, so a start that did not wait for them sees no style and an unusable font.
scenario.webOnly(TITLE, async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    DelayRequests('/js/one.js', 2500),
    DelayRequests('/css/one.css', 2500),
    DelayRequests('/fonts/e2e.ttf', 2500),
    OpenGameUrl(`/${RESOURCES_GAME.servedDir}/resources-game.qsps`),
    SeeGameStarted(TEXT.start),
    ...SEE_RESOURCES_APPLIED,
  );
});

scenario('game.cfg resources are removed when the game stops', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(RESOURCES_GAME.zipPath),
    SeeGameStarted(TEXT.start),
    // 2 styles + 2 scripts (the font is a FontFace in document.fonts, not an element).
    SeeGameResourceCount(CFG.styles.length + CFG.scripts.length),
    ReturnToShelf(),
    SeeShelfIncludes(ARCHIVES.resourcesZip.title),
    SeeGameResourceCount(0),
    OpenGameFile(ARCHIVES.singleZip.path),
    SeeGameStarted(ARCHIVES.singleZip.startText),
    SeeCssValues({ root: true }, { '--e2e-one': '' }),
    SeeGameResourceCount(0),
  );
});

scenario('a missing game.cfg resource shows a notice and the game still starts', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(RESOURCES_GAME.missingZipPath),
    // One notice names both (styles first, joined by ', '); it hides after 3 s, so check it before anything slow.
    SeeNoticeContaining(`${CFG.missingStyle}, ${CFG.missingScript}`),
    SeeGameStarted(TEXT.start),
    ...SEE_RESOURCES_APPLIED,
  );
});
