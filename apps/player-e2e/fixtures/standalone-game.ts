// The standalone fixture (standalone/): the game the standalone player bundles in its game/ folder,
// staged by targets/standalone/stage-public.ts. Its paths, the texts it writes and its markers.
// Keep this module free of test-framework imports (and of extensionless relative imports: Node runs the
// staging script, which imports it, as plain TypeScript).
import { fileURLToPath } from 'node:url';

/** The theme files the game uses, taken from the themed fixture (themed-game/). */
const THEME_FILES = ['e2e-theme.html', 'e2e-theme.css', 'e2e-theme.js'];

export const STANDALONE_GAME = {
  dir: fileURLToPath(new URL('./standalone/', import.meta.url)),
  /** Where the theme files in `files` come from. */
  themeDir: fileURLToPath(new URL('./themed-game/', import.meta.url)),
  /** The staged game folder, relative to it: from `dir`, except the theme files (from `themeDir`). */
  files: ['game.cfg', 'standalone.qsps', 'other.qsps', 'css/standalone.css', 'js/standalone.js', ...THEME_FILES],
  themeFiles: THEME_FILES,
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
