import { equals } from '@serenity-js/assertions';
import { ARCHIVES } from '../fixtures/archives';
import { UTF16_GAME } from '../fixtures/utf16-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { ReturnToShelf } from '../screenplay/game/tasks';
import { SeeShelfIncludes } from '../screenplay/shelf/checks';
import { LoadGame, OpenGameFile, OpenGameUrl, StartPlayer } from '../screenplay/support/operate-player';
import { SeeCssValue } from '../screenplay/support/page-script';
import { scenario } from '../screenplay/support/scenario';

const { text: TEXT, css: CSS, title: TITLE } = UTF16_GAME;
const served = (file: string): string => `/${UTF16_GAME.servedDir}/${file}`;

// The game.cfg styles and the Cyrillic title exist only if the cfg was decoded: a cfg that fails to decode falls back
// silently, without them. The entries of the archive routes carry the descriptor read at import time; the URL and
// direct-open routes read game.cfg again at run time, so each of the three decode sites needs its own scenario.
scenario('a UTF-16 game.cfg inside an archive is read', async (player) => {
  // Proves the import-time decode (the archive entry carries the descriptor).
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(ARCHIVES.utf16Zip.path),
    SeeGameStarted(TEXT.start),
    SeeCssValue({ root: true }, CSS.property, equals(CSS.value)),
    ReturnToShelf(),
    SeeShelfIncludes(TITLE),
  );
});

scenario.desktopOnly('a UTF-16 game.cfg opened directly is read', async (player) => {
  // Proves the runtime fetch decode and the direct-open decode.
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(ARCHIVES.utf16Folder.configPath),
    SeeGameStarted(TEXT.start),
    SeeCssValue({ root: true }, CSS.property, equals(CSS.value)),
    ReturnToShelf(),
    SeeShelfIncludes(TITLE),
  );
});

scenario.webOnly('a UTF-16 game.cfg next to a game URL is read', async (player) => {
  // The URL entry carries no descriptor: the sibling game.cfg is read at import and again at run time.
  await player.attemptsTo(
    OpenGameUrl(served('utf16.qsps')),
    SeeGameStarted(TEXT.start),
    SeeCssValue({ root: true }, CSS.property, equals(CSS.value)),
    ReturnToShelf(),
    SeeShelfIncludes(TITLE),
  );
});

scenario.webOnly('a UTF-16 game.cfg given by URL is read', async (player) => {
  await player.attemptsTo(
    OpenGameUrl(served('game.cfg')),
    SeeGameStarted(TEXT.start),
    SeeCssValue({ root: true }, CSS.property, equals(CSS.value)),
    ReturnToShelf(),
    SeeShelfIncludes(TITLE),
  );
});
