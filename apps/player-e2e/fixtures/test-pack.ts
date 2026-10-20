// The E2E test pack: game.cfg in this folder lists the fixture games. Desktop launches with
// configPath; web uploads zipPath, which targets/web/global-setup.ts builds from this folder.
// Keep this module free of test-framework imports: both runners load it.
import { fileURLToPath } from 'node:url';

export const TEST_PACK = {
  configPath: fileURLToPath(new URL('./game.cfg', import.meta.url)),
  zipPath: fileURLToPath(new URL('../artifacts/test-pack.zip', import.meta.url)),
  /** Shelf titles of the pack's games, in game.cfg order. */
  titles: ['E2E game', 'Second game'],
} as const;
