// Stages the public dir of the E2E standalone builds: a copy of the repo's public/ without its game/
// folder, with the standalone fixture game in game/ instead. The builds read it through
// QSPIDER_E2E_STANDALONE_PUBLIC_DIR (apps/player-standalone/vite.config.mts).
// The repo's public/game/ is never read or written: maintainers keep a local game there.
import { copyFileSync, cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STANDALONE_GAME } from '../../fixtures/standalone-game.ts';

const WORKSPACE_ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
const PUBLIC_DIR = join(WORKSPACE_ROOT, 'public');
const PUBLIC_GAME_DIR = join(PUBLIC_DIR, 'game');

export const STANDALONE_STAGE = join(WORKSPACE_ROOT, 'dist/e2e/standalone-public');

export function stageStandalonePublic(): void {
  rmSync(STANDALONE_STAGE, { recursive: true, force: true });
  // The filter drops public/game itself, so cpSync never descends into it.
  cpSync(PUBLIC_DIR, STANDALONE_STAGE, { recursive: true, filter: (src) => resolve(src) !== PUBLIC_GAME_DIR });
  const gameDir = join(STANDALONE_STAGE, 'game');
  const copy = (sourceDir: string, files: string[]): void => {
    for (const file of files) {
      const target = join(gameDir, file);
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(join(sourceDir, file), target);
    }
  };
  copy(STANDALONE_GAME.dir, STANDALONE_GAME.files);
  copy(STANDALONE_GAME.themeDir, STANDALONE_GAME.themeFiles);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  stageStandalonePublic();
  console.log(`Staged the standalone public dir in ${STANDALONE_STAGE}`);
}
