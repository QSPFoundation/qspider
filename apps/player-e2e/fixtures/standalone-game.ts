// The standalone fixture (standalone/): the game the standalone player bundles in its game/ folder,
// staged by targets/standalone/stage-public.ts. Its paths, the texts it writes and its markers.
// Keep this module free of test-framework imports (and of extensionless relative imports: Node runs the
// staging script, which imports it, as plain TypeScript).
import { fileURLToPath } from 'node:url';

export const STANDALONE_GAME = {
  dir: fileURLToPath(new URL('./standalone/', import.meta.url)),
  /** The game's own files, relative to `dir`; staged at the same paths in game/. */
  files: ['game.cfg', 'standalone.qsps', 'other.qsps', 'css/standalone.css', 'js/standalone.js'],
  /** The themed fixture (themed-game/), where the game's theme comes from. */
  themeDir: fileURLToPath(new URL('./themed-game/', import.meta.url)),
  /** The theme files, relative to `themeDir`; staged next to game.cfg in game/. */
  themeFiles: ['e2e-theme.html', 'e2e-theme.css', 'e2e-theme.js'],
  text: {
    start: 'STANDALONE START',
    /** The second [[game]]: written only if the player started it instead of the first. */
    other: 'OTHER START',
    room: (n: number): string => `ROOM counter=${n}`,
  },
  action: { goToRoom: 'Go to room', increment: 'Increment', save: 'Save', load: 'Load', quit: 'Quit' },
  /** The game's defaultTheme (from the themed fixture's e2e-theme.html). */
  theme: 'e2e-custom',
  /** Set on :root by css/standalone.css (a game.cfg style). */
  css: { property: '--e2e-standalone', value: 'STANDALONE' },
  /** Written by js/standalone.js (a game.cfg script). */
  mark: { qa: 'standalone-script', text: 'STANDALONE SCRIPT' },
  /** The author's desktop config, for tools/standalone-config. */
  desktopConfig: fileURLToPath(new URL('./standalone/qspider.desktop.json', import.meta.url)),
};
