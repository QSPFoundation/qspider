import { endsWith } from '@serenity-js/assertions';
import { RESOURCES_GAME, RESOURCES_IMAGES, RESOURCES_SVGS } from '../fixtures/resources-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeMainTextContaining } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { SeeMenu } from '../screenplay/menu/checks';
import { CancelMenu } from '../screenplay/menu/tasks';
import { CloseView } from '../screenplay/view/tasks';
import { OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { SeeCssValue } from '../screenplay/support/page-script';
import { SeeImageLoaded } from '../screenplay/support/image-loaded';
import { scenario } from '../screenplay/support/scenario';

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
