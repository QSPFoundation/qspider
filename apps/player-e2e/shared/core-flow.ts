// Constants shared by the web (Playwright) and desktop (WebdriverIO) core-flow tests.
// Keep this module free of test-framework imports: both runners load it.
import { fileURLToPath } from 'node:url';

export const FIXTURE_PATH: string = fileURLToPath(new URL('../fixtures/e2e-game.qsps', import.meta.url));
export const SHELF_TITLE = 'e2e-game.qsps';
export const TEXT = { start: 'E2E START', room: (n: number): string => `ROOM counter=${n}` };
export const ACTION = { goToRoom: 'Go to room', increment: 'Increment', save: 'Save', load: 'Load' };
export const SAVE_SLOT = 1;
