// The theme fixtures (aero-game, themed-game, missing-theme, gui-cfg-game and the e2e game's theme
// variants): their archives, the theme aliases and the strings they write.
// Keep this module free of test-framework imports: both runners load it.
import { ARCHIVES } from './archives';

/** A theme the core flows run under: the e2e game packed so that this theme is active. */
export interface ThemeVariant {
  name: string;
  /** The theme alias the player marks on the game root (`data-qsp-theme`). */
  alias: string;
  /** The zip of the e2e game with this theme selected. */
  e2eGamePath: string;
}

export const THEME_ALIAS = { classic: 'qspider:classic', aero: 'qspider:aero', custom: 'e2e-custom' } as const;

/** The themes the core flows run under on web (the e2e game, same locations, other theme). */
export const CORE_THEME_VARIANTS: ThemeVariant[] = [
  { name: 'aero', alias: THEME_ALIAS.aero, e2eGamePath: ARCHIVES.e2eGameAeroZip.path },
  { name: 'custom', alias: THEME_ALIAS.custom, e2eGamePath: ARCHIVES.e2eGameCustomZip.path },
];

export const AERO_GAME = {
  path: ARCHIVES.aeroZip.path,
  title: 'Aero game',
  text: { start: 'AERO START', next: 'AERO NEXT', message: 'AERO MESSAGE' },
  action: { next: 'Next', showMessage: 'Show message' },
};

export const THEMED_GAME = {
  path: ARCHIVES.themedZip.path,
  title: 'Themed game',
  text: { start: 'THEMED START' },
  /** Written by the theme itself (e2e-theme.html, .js): `data-qa` marks of its elements and their text. */
  theme: {
    chromeMark: 'e2e-theme-chrome',
    chrome: 'E2E THEME',
    scriptMark: 'e2e-theme-script',
    script: 'THEME SCRIPT RAN',
    /** The theme-level qsp-layer (outside the main content, so it survives a restart) and its text. */
    layer: 'themelay',
    layerText: 'THEME LAYER',
  },
  action: {
    showLayer: 'Show layer',
    hideLayer: 'Hide layer',
    restart: 'Restart',
    toClassic: 'To classic',
    toCustom: 'To custom',
    /** gs 'qspider_change_theme', 'no-such' */
    toMissing: 'To missing',
  },
};

export const MISSING_THEME_GAME = {
  aeroPath: ARCHIVES.missingAeroZip.path,
  classicPath: ARCHIVES.missingClassicZip.path,
  missingTheme: 'no-such-theme',
  text: { start: 'MISSING START' },
};

export const GUI_CFG_GAME = {
  path: ARCHIVES.guiCfgZip.path,
  title: 'GUI cfg game',
  text: { start: 'GUI CFG START', stats: 'GUI CFG STATS' },
};
