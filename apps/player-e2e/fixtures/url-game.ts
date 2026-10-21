// Games the web player imports by URL (?game=). global-setup copies the sources into the served
// dist root under `servedDir`; scenarios build absolute URLs from the page's origin.
// Keep this module free of test-framework imports: both runners load it.
import { fileURLToPath } from 'node:url';

const source = (name: string): string => fileURLToPath(new URL(`./url-game/${name}`, import.meta.url));

export const URL_GAME = {
  servedDir: 'e2e-fixtures',
  valid: { source: source('url-game.qsps'), file: 'url-game.qsps', startText: 'URL START' },
  /** Reachable, but a .cfg that is not valid TOML: the import fails after the fetch. */
  invalid: { source: source('invalid.cfg'), file: 'invalid.cfg' },
} as const;
