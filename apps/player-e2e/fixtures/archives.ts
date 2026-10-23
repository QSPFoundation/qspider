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
  aeroZip: { path: out('aero-game.zip'), title: 'Aero game' },
  themedZip: { path: out('themed-game.zip'), title: 'Themed game' },
  missingAeroZip: { path: out('missing-aero.zip'), title: 'Missing aero theme' },
  missingClassicZip: { path: out('missing-classic.zip'), title: 'Missing classic theme' },
  guiCfgZip: { path: out('gui-cfg-game.zip'), title: 'GUI cfg game' },
  /** The same game without its qspgui.cfg: the control for the cfg's layout. */
  guiCfgControlZip: { path: out('gui-cfg-control.zip'), title: 'GUI cfg game' },
  /** The look-variable game (fixtures/look-game) in Aero and in classic mode, with its generated PNGs. */
  lookAeroZip: { path: out('look-aero.zip'), title: 'Look game (aero)' },
  lookClassicZip: { path: out('look-classic.zip'), title: 'Look game (classic)' },
  /** The e2e game (fixtures/e2e-game) packed with a game.cfg that selects a theme. */
  e2eGameAeroZip: { path: out('e2e-game-aero.zip'), title: 'E2E game (aero)' },
  e2eGameCustomZip: { path: out('e2e-game-custom.zip'), title: 'E2E game (custom theme)' },
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
  aero: fileURLToPath(new URL('./aero-game/', import.meta.url)),
  themed: fileURLToPath(new URL('./themed-game/', import.meta.url)),
  missingTheme: fileURLToPath(new URL('./missing-theme/', import.meta.url)),
  guiCfg: fileURLToPath(new URL('./gui-cfg-game/', import.meta.url)),
  look: fileURLToPath(new URL('./look-game/', import.meta.url)),
  e2eGame: fileURLToPath(new URL('./e2e-game/', import.meta.url)),
} as const;
