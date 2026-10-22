// Derived open-route fixtures that build-fixtures.ts writes under artifacts/fixtures/.
// Keep this module free of test-framework imports: both runners load it.
import { fileURLToPath } from 'node:url';

const out = (name: string): string => fileURLToPath(new URL(`../artifacts/fixtures/${name}`, import.meta.url));

export const ARCHIVES = {
  singleZip: { path: out('single-game.zip'), title: 'Single game', startText: 'SINGLE START' },
  /** The test pack's games (game.cfg order), see TEST_PACK.titles. */
  multiZip: { path: out('multi-game.zip'), titles: ['E2E game', 'Second game'] },
  sevenZip: { path: out('single-game.7z'), title: 'Single game', startText: 'SINGLE START' },
  /** Compiled .qsp of the single game; the shelf titles it by file name. */
  qspBinary: { path: out('single.qsp'), title: 'single.qsp', startText: 'SINGLE START' },
  dialogsZip: { path: out('dialogs.zip'), title: 'Dialogs game', image: 'view.png' },
  savesZip: { path: out('saves.zip'), title: 'Saves game' },
  panelsZip: { path: out('panels.zip'), title: 'Panels game' },
  gameHtmlZip: { path: out('game-html.zip'), title: 'Game HTML', image: 'view.png' },
  includerZip: { path: out('includer.zip'), title: 'Includer game', includedMarker: 'INCLUDED MARKER' },
} as const;

/** Authored source folders. */
export const SOURCES = {
  single: fileURLToPath(new URL('./single-game/', import.meta.url)),
  includer: fileURLToPath(new URL('./includer/', import.meta.url)),
  dialogs: fileURLToPath(new URL('./dialogs/', import.meta.url)),
  gameHtml: fileURLToPath(new URL('./game-html/', import.meta.url)),
  saves: fileURLToPath(new URL('./saves/', import.meta.url)),
  panels: fileURLToPath(new URL('./panels/', import.meta.url)),
} as const;
