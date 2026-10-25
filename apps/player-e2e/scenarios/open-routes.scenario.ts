import { basename } from 'node:path';
import { TEST_PACK } from '../fixtures/test-pack';
import { ARCHIVES } from '../fixtures/archives';
import { CYRILLIC_GAME } from '../fixtures/cyrillic-game';
import { URL_GAME } from '../fixtures/url-game';
import {
  SeeErrorShown,
  SeeGameStarted,
  SeeNoticeContaining,
  SeeStartupFinished,
  WaitNoticeGone,
} from '../screenplay/common/checks';
import { SeeMainText } from '../screenplay/game/checks';
import { OpenFromShelf } from '../screenplay/shelf/tasks';
import { ReturnToShelf } from '../screenplay/game/tasks';
import { SeeShelfIncludes, SeeShelfLacks, SeeShelfTitles, SeeShelfWritesSettled } from '../screenplay/shelf/checks';
import {
  DelayRequests,
  DropGameFile,
  OpenGameFile,
  OpenGameUrl,
  RouteThroughProxy,
  StartPlayer,
} from '../screenplay/support/operate-player';
import { SeeProxied } from '../screenplay/support/proxy';
import { scenario } from '../screenplay/support/scenario';
import { pluralTranslation } from '../screenplay/support/translations';

/** Path of a fixture served by the player's own origin (see global-setup.ts). */
const served = (file: string): string => `/${URL_GAME.servedDir}/${file}`;

scenario.webOnly('importing a game by URL starts it', async (player) => {
  await player.attemptsTo(OpenGameUrl(served(URL_GAME.valid.file)), SeeGameStarted(URL_GAME.valid.startText));
});

scenario.webOnly('importing a game again by URL replaces its shelf entry', async (player) => {
  const { reimportV1Zip: v1, reimportV2Zip: v2 } = ARCHIVES;
  await player.attemptsTo(
    OpenGameUrl(served(basename(v1.path))),
    SeeGameStarted(v1.startText),
    // The v1 entry is shelved and written before the page is reloaded with v2 (else v2 may race the v1 write).
    ReturnToShelf(),
    SeeShelfIncludes(v1.title),
    SeeShelfWritesSettled(),
    OpenGameUrl(served(basename(v2.path))), // the same game id, another title and start text
    SeeGameStarted(v2.startText),
    ReturnToShelf(),
    SeeShelfIncludes(v2.title),
    SeeShelfLacks(v1.title),
  );
});

scenario.webOnly('a first-visit zip link waits for the service worker', async (player) => {
  // An imported zip's files are served from IndexedDB by the service worker (/qspider-files/). On a first
  // visit the worker may not control the page yet when the game starts; the late worker script makes that
  // window wide, so the game must wait for the worker instead of fetching its files from the server.
  const { reimportV1Zip: v1 } = ARCHIVES;
  await player.attemptsTo(
    DelayRequests('/service-worker.js', 4000),
    OpenGameUrl(served(basename(v1.path))),
    SeeGameStarted(v1.startText),
  );
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

scenario('a multi-game zip is shelved with a notice naming the count, not started', async (player) => {
  const { path, titles } = ARCHIVES.tripleZip;
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    // The launch pack shows its own notice at startup on desktop; wait it out so the check below is about this open.
    WaitNoticeGone(),
    OpenGameFile(path),
    SeeNoticeContaining(pluralTranslation('en-US', '{{ count }} games added to shelf', titles.length)),
    // Not an exact list: on desktop the launch pack is on the shelf too.
    ...titles.map(SeeShelfIncludes),
    // Settle anchor: all games are shelved and still startable from the shelf. Had one auto-started,
    // the shelf would be gone and this fails; opening one shows nothing was running before.
    OpenFromShelf(titles[0]),
    SeeGameStarted(ARCHIVES.singleZip.startText),
  );
});

scenario('a multi-game zip with all its games in one folder shelves every game with its own entry', async (player) => {
  const { path, titles, secondStartText } = ARCHIVES.flatMultiZip;
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    WaitNoticeGone(),
    OpenGameFile(path),
    SeeNoticeContaining(pluralTranslation('en-US', '{{ count }} games added to shelf', titles.length)),
    ...titles.map(SeeShelfIncludes),
    // Opening the second shows its own text: its entry was not overwritten by the first game's.
    OpenFromShelf(titles[1]),
    SeeGameStarted(secondStartText),
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
    SeeNoticeContaining(pluralTranslation('en-US', '{{ count }} games added to shelf', TEST_PACK.titles.length)),
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
