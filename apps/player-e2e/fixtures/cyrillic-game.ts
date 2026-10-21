// A game whose file name is non-ASCII (cyrillic-game/игра.qsps): its path, shelf title and start text.
// Keep this module free of test-framework imports: both runners load it.
import { fileURLToPath } from 'node:url';

export const CYRILLIC_GAME = {
  path: fileURLToPath(new URL('./cyrillic-game/игра.qsps', import.meta.url)),
  /** A loose file is shelved under its file name. */
  title: 'игра.qsps',
  startText: 'КИРИЛЛИЦА СТАРТ',
} as const;
