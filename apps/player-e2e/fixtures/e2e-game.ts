// The e2e fixture game (e2e-game/e2e-game.qsps): its path and the content it writes.
// Keep this module free of test-framework imports: both runners load it.
import { fileURLToPath } from 'node:url';

export const E2E_GAME = {
  path: fileURLToPath(new URL('./e2e-game/e2e-game.qsps', import.meta.url)),
  shelfTitle: 'e2e-game.qsps',
  text: { start: 'E2E START', room: (n: number): string => `ROOM counter=${n}` },
  action: { goToRoom: 'Go to room', increment: 'Increment', save: 'Save', load: 'Load' },
};
