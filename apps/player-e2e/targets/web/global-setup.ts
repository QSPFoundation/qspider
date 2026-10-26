// Builds the derived fixtures: the web test pack (a zip of game.cfg and the games it lists, which
// the web player imports through its Open game input, see OperateWebPlayer.loadTestPack) and the
// open-route archives. Also copies the URL-import games into the served build.
import { copyFileSync, cpSync, mkdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startAssetServer, stopAssetServer } from '../../fixtures/asset-server';
import { ARCHIVES } from '../../fixtures/archives';
import { RESOURCES_GAME } from '../../fixtures/resources-game';
import { buildFixtures } from '../../fixtures/build-fixtures';
import { UTF16_GAME } from '../../fixtures/utf16-game';
import { URL_GAME } from '../../fixtures/url-game';

const SERVED_ROOT = fileURLToPath(new URL('../../../../dist/apps/player/', import.meta.url));

/** Returns the teardown: Playwright runs it when the run ends. */
export default async function globalSetup(): Promise<() => Promise<void>> {
  await buildFixtures();
  const dir = join(SERVED_ROOT, URL_GAME.servedDir);
  mkdirSync(dir, { recursive: true });
  for (const { source, file } of [URL_GAME.valid, URL_GAME.invalid]) copyFileSync(source, join(dir, file));
  // The re-import pair, served so the URL route can import both versions.
  for (const { path } of [ARCHIVES.reimportV1Zip, ARCHIVES.reimportV2Zip])
    copyFileSync(path, join(dir, basename(path)));
  // The resources game as a plain folder (real case), for the plain-URL route.
  cpSync(dirname(ARCHIVES.resourcesFolder.path), join(SERVED_ROOT, RESOURCES_GAME.servedDir), { recursive: true });
  // The UTF-16 game as a plain folder, for the URL routes (the game.cfg itself, and a sibling game file).
  cpSync(dirname(ARCHIVES.utf16Folder.configPath), join(SERVED_ROOT, UTF16_GAME.servedDir), { recursive: true });
  const assetServer = await startAssetServer();
  return () => stopAssetServer(assetServer);
}
