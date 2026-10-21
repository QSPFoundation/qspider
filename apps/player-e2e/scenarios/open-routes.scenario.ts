import { TEST_PACK } from '../fixtures/test-pack';
import { ARCHIVES } from '../fixtures/archives';
import { URL_GAME } from '../fixtures/url-game';
import { SeeErrorShown, SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { E2E_GAME } from '../fixtures/e2e-game';
import { OpenFromShelf } from '../screenplay/shelf/tasks';
import { ReturnToShelf } from '../screenplay/game/tasks';
import { SeeShelfIncludes, SeeShelfTitles } from '../screenplay/shelf/checks';
import { OpenGameFile, OpenGameUrl, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

/** Path of a fixture served by the player's own origin (see global-setup.ts). */
const served = (file: string): string => `/${URL_GAME.servedDir}/${file}`;

scenario.webOnly('importing a game by URL starts it', async (player) => {
  await player.attemptsTo(OpenGameUrl(served(URL_GAME.valid.file)), SeeGameStarted(URL_GAME.valid.startText));
});

scenario.webOnly('a failed URL import clears the loader and shows an error', async (player) => {
  await player.attemptsTo(OpenGameUrl(served(URL_GAME.invalid.file)), SeeStartupFinished(), SeeErrorShown());
});

const opensArchive = (name: string, archive: { path: string; title: string; startText: string }) =>
  scenario(name, async (player) => {
    await player.attemptsTo(
      StartPlayer(),
      SeeStartupFinished(),
      OpenGameFile(archive.path),
      SeeGameStarted(archive.startText),
      ReturnToShelf(),
      SeeShelfIncludes(archive.title),
    );
  });

opensArchive('opening a single-game zip starts it', ARCHIVES.singleZip);
opensArchive('opening a .7z starts it', ARCHIVES.sevenZip);

scenario('a multi-game zip is shelved, not started', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(ARCHIVES.multiZip.path),
    SeeShelfTitles([...ARCHIVES.multiZip.titles]),
    // Settle anchor: both games are shelved and still startable from the shelf. Had one auto-started,
    // the shelf would be gone and this fails; opening one shows nothing was running before.
    OpenFromShelf(ARCHIVES.multiZip.titles[0]),
    SeeGameStarted(E2E_GAME.text.start),
  );
});

scenario.desktopOnly('re-opening the launch pack keeps one entry each', async (player) => {
  // Desktop launches with the pack already shelved; opening it again overwrites by id (#164).
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(TEST_PACK.configPath),
    SeeShelfTitles([...TEST_PACK.titles]),
  );
});
