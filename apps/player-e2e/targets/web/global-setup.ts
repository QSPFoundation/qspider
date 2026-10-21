// Builds the derived fixtures: the web test pack (a zip of game.cfg and the games it lists, which
// the web player imports through its Open game input, see OperateWebPlayer.loadTestPack) and the
// open-route archives. Also copies the URL-import games into the served build.
import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildFixtures } from '../../fixtures/build-fixtures';
import { URL_GAME } from '../../fixtures/url-game';

const SERVED_ROOT = fileURLToPath(new URL('../../../../dist/apps/player/', import.meta.url));

export default async function globalSetup(): Promise<void> {
  await buildFixtures();
  const dir = join(SERVED_ROOT, URL_GAME.servedDir);
  mkdirSync(dir, { recursive: true });
  for (const { source, file } of [URL_GAME.valid, URL_GAME.invalid]) copyFileSync(source, join(dir, file));
}
