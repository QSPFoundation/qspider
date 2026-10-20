import { resolve } from 'node:path';
import { E2E_GAME } from '../../fixtures/e2e-game';

/** The game file tauri-driver passes to the app at launch (wdio.conf.ts); the only one desktop opens. */
export const LAUNCH_FIXTURE = E2E_GAME.path;

/**
 * Throws unless `path` is the launch fixture. The desktop app opens its game from the launch
 * argument, set once per run, so OpenGameFile cannot open any other file there.
 */
export function assertLaunchFixture(path: string, launchFixture: string = LAUNCH_FIXTURE): void {
  if (resolve(path) !== resolve(launchFixture)) {
    throw new Error(
      `Desktop opens only the launch fixture ${launchFixture}, not ${path}; per-scenario fixtures need a launch-argument change (targets/desktop/wdio.conf.ts).`,
    );
  }
}
