import { equals } from '@serenity-js/assertions';
import { ARCHIVES } from '../fixtures/archives';
import { UTF16_GAME } from '../fixtures/utf16-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { LoadGame, OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { SeeCssValue } from '../screenplay/support/page-script';
import { scenario } from '../screenplay/support/scenario';

const { text: TEXT, css: CSS } = UTF16_GAME;

// The game.cfg styles apply only if the cfg was decoded: a cfg that fails to decode falls back silently, without them.
scenario('a UTF-16 game.cfg inside an archive is read', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(ARCHIVES.utf16Zip.path),
    SeeGameStarted(TEXT.start),
    SeeCssValue({ root: true }, CSS.property, equals(CSS.value)),
  );
});

scenario.desktopOnly('a UTF-16 game.cfg opened directly is read', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(ARCHIVES.utf16Folder.configPath),
    SeeGameStarted(TEXT.start),
    SeeCssValue({ root: true }, CSS.property, equals(CSS.value)),
  );
});
