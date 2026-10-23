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
  /** The same game packed without its qspgui.cfg. */
  controlPath: ARCHIVES.guiCfgControlZip.path,
  title: 'GUI cfg game',
  text: { start: 'GUI CFG START', stats: 'GUI CFG STATS' },
  /**
   * Where the stats panel (`vars`) sits. The cfg has dir=4 (wxWidgets left) with dock_size(4,0,0)=300; the
   * default classic theme puts it in the bottom dock (next to the actions).
   */
  dock: { cfg: 'left', default: 'bottom' },
  /**
   * The qspgui.cfg colours and font, as the classic theme should apply them. They are derived from the code,
   * not from a run. QspCLDefaults (classic-layout.tsx) writes them as `--cl-*` with `convertColor(x, false)`:
   * the cfg int is 0xBBGGRR (blue, green, red; no alpha byte), written as `rgb(red,green,blue)`:
   *  - BackColor 0x203040 = 2109504 -> `rgb(64,48,32)`
   *  - FontColor 0x00A0F0 = 41200   -> `rgb(240,160,0)`
   *  - LinkColor 0x10C020 = 1097760 -> `rgb(32,192,16)`
   *  - FontSize 17 -> `17pt`, FontName -> as it is.
   * public/themes/classic.css then maps `--color: var(--code-color, var(--cl-color))` and so on, so these
   * are the values the root should compute for the unprefixed names. (classic.html still defaults the
   * `--code-*` ones, which shadow them: what SHOULD apply, not what applies today.)
   */
  consumed: {
    '--color': 'rgb(240,160,0)',
    '--background-color': 'rgb(64,48,32)',
    '--link-color': 'rgb(32,192,16)',
    '--font-size': '17pt',
    '--font-name': 'Segoe UI',
  } as Record<string, string>,
};

/**
 * The classic look of a game that sets no colours or font and has no qspgui.cfg. Derived from the code:
 * classic.html defaults (#000000, #0000ff, #e0e0e0, 12pt), the contrast from getContrastColor('#e0e0e0')
 * (yiq 224 -> black), the inverted from invertColor (#1F1F1F, Color.hex() is upper-case), its contrast (yiq 31 -> white), and
 * --border-color is the background contrast. All as authored, the names the classic.css maps.
 */
export const CLASSIC_DEFAULT_LOOK: Record<string, string> = {
  '--color': '#000000',
  '--link-color': '#0000ff',
  '--background-color': '#e0e0e0',
  '--background-color-contrast': 'black',
  '--background-color-inverted': '#1F1F1F',
  '--background-color-inverted-contrast': 'white',
  '--border-color': 'black',
  '--font-size': '12pt',
};
