// Fails unless the standalone build bundles the staged fixture: its game/game.cfg must be byte-identical to
// the fixture's. NX caches player-standalone:build without the staged dir among its inputs, so this catches a
// stale bundle (or one built from the repo's own public/game/).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STANDALONE_GAME } from '../../fixtures/standalone-game.ts';

const BUILT_CONFIG = fileURLToPath(new URL('../../../../dist/apps/player-standalone/game/game.cfg', import.meta.url));
const FIXTURE_CONFIG = join(STANDALONE_GAME.dir, 'game.cfg');

let built: Buffer | undefined;
try {
  built = readFileSync(BUILT_CONFIG);
} catch {
  built = undefined;
}
if (!built?.equals(readFileSync(FIXTURE_CONFIG))) {
  console.error(`${BUILT_CONFIG} is not the standalone fixture's game.cfg (${FIXTURE_CONFIG}): stale or wrong build.`);
  process.exit(1);
}
console.log('The standalone build bundles the fixture game.');
