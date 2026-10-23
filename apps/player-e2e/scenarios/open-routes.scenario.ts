import { TEST_PACK } from '../fixtures/test-pack';
import { ARCHIVES } from '../fixtures/archives';
import { CYRILLIC_GAME } from '../fixtures/cyrillic-game';
import { URL_GAME } from '../fixtures/url-game';
import {
  SeeErrorShown,
  SeeGameStarted,
  SeeNoticeShown,
  SeeStartupFinished,
  WaitNoticeGone,
} from '../screenplay/common/checks';
import { SeeMainText } from '../screenplay/game/checks';
import { E2E_GAME } from '../fixtures/e2e-game';
import { OpenFromShelf } from '../screenplay/shelf/tasks';
import { ReturnToShelf } from '../screenplay/game/tasks';
import { SeeShelfIncludes, SeeShelfTitles } from '../screenplay/shelf/checks';
import {
  DropGameFile,
  OpenGameFile,
  OpenGameUrl,
  RouteThroughProxy,
  StartPlayer,
} from '../screenplay/support/operate-player';
import { SeeProxied } from '../screenplay/support/proxy';
import { scenario } from '../screenplay/support/scenario';

/** Path of a fixture served by the player's own origin (see global-setup.ts). */
const served = (file: string): string => `/${URL_GAME.servedDir}/${file}`;

scenario.webOnly('importing a game by URL starts it', async (player) => {
  await player.attemptsTo(OpenGameUrl(served(URL_GAME.valid.file)), SeeGameStarted(URL_GAME.valid.startText));
});

scenario.webOnly('a failed URL import clears the loader and shows an error', async (player) => {
  await player.attemptsTo(OpenGameUrl(served(URL_GAME.invalid.file)), SeeStartupFinished(), SeeErrorShown());
});

scenario.webOnly('a game URL the browser cannot fetch loads through the CORS proxy', async (player) => {
  const origin = 'https://e2e-cors.invalid';
  const url = `${origin}${served(URL_GAME.valid.file)}`;
  await player.attemptsTo(
    StartPlayer(),
    RouteThroughProxy(origin),
    OpenGameUrl(url),
    SeeGameStarted(URL_GAME.valid.startText),
    SeeProxied(url),
  );
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
opensArchive('opening a .qsp binary starts it', ARCHIVES.qspBinary);
// Non-ASCII path: on desktop it must survive the GTK dialog's path autocomplete unchanged.
opensArchive('opening a Cyrillic-named game starts it', CYRILLIC_GAME);

scenario('an includer game loads its included file', async (player) => {
  // The marker is pushed by a label that exists only in the included file (inclib).
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(ARCHIVES.includerZip.path),
    SeeMainText(ARCHIVES.includerZip.includedMarker),
  );
});

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
  // Desktop launches with the pack already shelved, so the shelf check alone would pass before the
  // re-import runs. The launch's own notice is waited out first; the new notice then proves the
  // re-import was processed (addImported shows it for a multi-game import), and only then is the
  // shelf checked: a duplicate would fail the exact match (#164: overwrite by id).
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    WaitNoticeGone(),
    OpenGameFile(TEST_PACK.configPath),
    SeeNoticeShown(),
    SeeShelfTitles([...TEST_PACK.titles]),
  );
});

scenario.desktopOnly('dropping a game file opens it', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    DropGameFile(ARCHIVES.singleZip.path),
    SeeGameStarted(ARCHIVES.singleZip.startText),
  );
});
