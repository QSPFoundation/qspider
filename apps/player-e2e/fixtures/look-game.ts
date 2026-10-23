// The look-variable fixture game (look-game/look-game.qsps, packed once per theme mode as
// ARCHIVES.lookAeroZip / lookClassicZip): its markers, action labels, images and the frozen tables of the
// CSS custom properties the themes derive from its game variables.
// Keep this module free of test-framework imports: both runners load it.
import { ARCHIVES } from './archives';

export const LOOK_GAME = {
  aeroPath: ARCHIVES.lookAeroZip.path,
  classicPath: ARCHIVES.lookClassicZip.path,
  text: {
    start: 'LOOK START',
    /** Written after `Set vars` ran `set_all`. */
    varsSet: 'LOOK VARS SET',
    dialogs: 'LOOK DIALOGS',
    formats: 'LOOK FORMATS',
    formatsStats: 'LOOK FORMATS STATS',
    effects: 'LOOK EFFECTS',
    /** Written by the `arrive` location every effect action goes to. */
    arrived: 'LOOK ARRIVED',
    /** Written by `Keep view`, and by nothing else: the settled anchor of the view checks. */
    log: 'LOOK LOG',
    pic: 'LOOK PIC',
    object: 'LOOK OBJECT',
    menuPicked: 'LOOK MENU PICKED',
  },
  /** Action labels, per location. */
  actions: {
    start: { setVars: 'Set vars', toDialogs: 'To dialogs', toFormats: 'To formats', toEffects: 'To effects' },
    dialogs: {
      msg: 'Msg',
      input: 'Input',
      menu: 'Menu',
      view: 'View',
      noShade: 'No shade',
      place: 'Place',
      fixedMenu: 'Fixed menu',
      keepView: 'Keep view',
    },
    formats: { setFormats: 'Set formats', pic: 'Pic', msg: 'Msg', input: 'Input', menu: 'Menu' },
    effects: { slowFade: 'Slow fade', quickSlide: 'Quick slide', seqFade: 'Seq fade' },
  },
  /** Dialog texts and menu items. */
  dialog: {
    msg: 'LOOK MSG',
    input: 'LOOK INPUT',
    menuItems: ['LOOK MENU ONE', 'LOOK MENU TWO'],
    /** The same dialogs opened from the formats location. */
    formatsMsg: 'LOOK FMT MSG',
    formatsInput: 'LOOK FMT INPUT',
    formatsMenuItems: ['LOOK FMT ONE', 'LOOK FMT TWO'],
  },
  /** `Set formats` wraps every text in `<wrapper>[...]`; the action formats also carry the image (`%IMAGE%`). */
  format: {
    main: 'MAINFMT',
    stats: 'STATSFMT',
    msg: 'MSGFMT',
    input: 'INPUTFMT',
    action: 'ACTFMT',
    selectedAction: 'SELACTFMT',
    object: 'OBJFMT',
    menu: 'MENUFMT',
    selectedMenu: 'SELMENUFMT',
  },
  /** Placement values of the dialogs' `Place` action (MSG_X, MSG_Y, INPUT_X, ...). */
  place: { msg: [111, 112], input: [121, 122], menu: [131, 132] },
  /** Image used by `view` and `act 'Pic'`. */
  images: { view: 'look/msg.png', action: 'look/act.png' },
} as const;

/**
 * The PNGs of the game (`look/...`), as `path: [width, height]` of their natural size. build-fixtures
 * draws them (a transparent PNG of exactly that size) and packs them next to the game, so no binary
 * is committed and the sizes the tables expect are the very numbers the images are made from.
 * Every theme resource variable gets its own file, so a mapping swapped between two variables is seen.
 */
export const LOOK_IMAGES: Record<string, readonly [width: number, height: number]> = {
  'look/back.png': [7, 5],
  'look/top.png': [9, 4],
  'look/msg.png': [11, 3],
  'look/act.png': [13, 6],
  'look/down.png': [6, 7],
  'look/statdesc.png': [2, 2],
  'look/maindesc.png': [2, 2],
  'look/actions.png': [2, 2],
  'look/objects.png': [2, 2],
  'look/msg-ok.png': [4, 9],
  'look/input-back.png': [12, 2],
  'look/input-ok.png': [5, 10],
  'look/input-cancel.png': [8, 11],
  'look/menu-back.png': [10, 13],
};

/**
 * What the themes write for the values `set_all` assigns, per custom property (`name: expected computed value`).
 * Derived from the code, not from a run (custom properties read back exactly as authored):
 *  - unit  (`type="unit"`): `${value}${unit}` of the theme's definition (`px` in Aero, `pt` in classic, none
 *    for the two flags): FSIZE = 17 gives `17px` / `17pt`.
 *  - colour (`type="color"`): `convertColor(Number(value))` of libs/utils/src/colors.ts. The number is an int32
 *    read big-endian as alpha, blue, green, red; `rgba(red,green,blue,A)` with A = 1 when the alpha byte is 1
 *    or 255 (`alpha === 1 ? 1 : alpha / 255`). The game assigns 0xFF as alpha, so A is 1.
 *    `-contrast` is `black` when the YIQ luma (r*299 + g*587 + b*114) / 1000 is >= 128, else `white`;
 *    `-inverted` is `Color(...).negate().hex()` (255 minus each channel, upper-case `#RRGGBB`);
 *    `-inverted-contrast` is the contrast of the inverted colour.
 *  - plain string (no `type`): the value as it is.
 *  - resource (`type="resource"`): `url("<base>/<path>")`. The base depends on the target (blob, tauri asset
 *    protocol, ...), so these rows hold only the stable end, `<path>")`: compare them with `endsWith`
 *    (see `isLookSuffixRow`).
 *  - `with-size` resources add `-w` / `-h` = `${naturalWidth}px` / `${naturalHeight}px` of the image
 *    (LOOK_IMAGES), known once the image has loaded.
 * Every `qsp-css-variable` of public/themes/aero.html has a row (guarded in build-fixtures.spec.ts).
 */
export const LOOK_AERO_TABLE: Record<string, string> = {
  '--font-size': '17px',
  '--font-name': 'Courier New',
  '--color': 'rgba(17,34,51,1)',
  '--link-color': 'rgba(68,85,102,1)',
  '--background-color': 'rgba(200,220,240,1)',
  '--background-color-contrast': 'black',
  '--background-color-inverted': '#37230F',
  '--background-color-inverted-contrast': 'white',
  '--up-arrow': 'look/back.png")',
  '--up-arrow-w': '7px',
  '--up-arrow-h': '5px',
  '--down-arrow': 'look/down.png")',
  '--down-arrow-w': '6px',
  '--down-arrow-h': '7px',
  '--background-image': 'look/back.png")',
  '--aero-foreground-image': 'look/top.png")',
  '--aero-statdesc-x': '597px',
  '--aero-statdesc-y': '398px',
  '--aero-statdesc-w': '203px',
  '--aero-statdesc-h': '204px',
  '--aero-statdesc-image': 'look/statdesc.png")',
  '--aero-maindesc-x': '9px',
  '--aero-maindesc-y': '10px',
  '--aero-maindesc-w': '596px',
  '--aero-maindesc-h': '397px',
  '--aero-maindesc-image': 'look/maindesc.png")',
  '--aero-actions-x': '13px',
  '--aero-actions-y': '406px',
  '--aero-actions-w': '600px',
  '--aero-actions-h': '181px',
  '--aero-actions-image': 'look/actions.png")',
  '--aero-objects-x': '609px',
  '--aero-objects-y': '18px',
  '--aero-objects-w': '215px',
  '--aero-objects-h': '405px',
  '--aero-objects-image': 'look/objects.png")',
  '--aero-cmd-x': '21px',
  '--aero-cmd-y': '586px',
  '--aero-cmd-w': '608px',
  '--aero-cmd-h': '48px',
  '--aero-view-x': '271px',
  '--aero-view-y': '172px',
  '--aero-view-w': '323px',
  '--aero-view-h': '324px',
  '--aero-msg-backimage': 'look/msg.png")',
  '--aero-msg-backimage-w': '11px',
  '--aero-msg-backimage-h': '3px',
  '--aero-msg-text-x': '29px',
  '--aero-msg-text-y': '30px',
  '--aero-msg-text-w': '419px',
  '--aero-msg-text-h': '259px',
  '--aero-msg-ok-x': '215px',
  '--aero-msg-ok-y': '269px',
  '--aero-msg-ok-image': 'look/msg-ok.png")',
  '--aero-msg-ok-image-w': '4px',
  '--aero-msg-ok-image-h': '9px',
  '--aero-input-backimage': 'look/input-back.png")',
  '--aero-input-backimage-w': '12px',
  '--aero-input-backimage-h': '2px',
  '--aero-input-text-x': '35px',
  '--aero-input-text-y': '36px',
  '--aero-input-text-w': '425px',
  '--aero-input-text-h': '265px',
  '--aero-input-bar-x': '39px',
  '--aero-input-bar-y': '274px',
  '--aero-input-bar-w': '349px',
  '--aero-input-bar-h': '66px',
  '--aero-input-ok-x': '363px',
  '--aero-input-ok-y': '279px',
  '--aero-input-ok-image': 'look/input-ok.png")',
  '--aero-input-ok-image-w': '5px',
  '--aero-input-ok-image-h': '10px',
  '--aero-input-cancel-image': 'look/input-cancel.png")',
  '--aero-input-cancel-image-w': '8px',
  '--aero-input-cancel-image-h': '11px',
  '--aero-input-cancel-x': '403px',
  '--aero-input-cancel-y': '281px',
  '--aero-menu-padding': '47px',
  '--aero-menu-border': '45px',
  '--aero-menu-border-color': 'rgba(255,128,0,1)',
  '--aero-menu-backimage': 'look/menu-back.png")',
  '--aero-menu-backimage-w': '10px',
  '--aero-menu-backimage-h': '13px',
  '--aero-menu-list-x': '49px',
  '--aero-menu-list-y': '50px',
  '--aero-menu-list-w': '200px',
  '--aero-menu-list-h': '171px',
  '--aero-disable-shade': '1',
  '--aero-hide-scroll-arrows': '1',
};

/** public/themes/classic.html: the same game variables under the classic names (`--code-*`, `pt`). */
export const LOOK_CLASSIC_TABLE: Record<string, string> = {
  '--code-font-size': '17pt',
  '--code-font-name': 'Courier New',
  '--code-color': 'rgba(17,34,51,1)',
  '--code-link-color': 'rgba(68,85,102,1)',
  '--code-background-color': 'rgba(200,220,240,1)',
  '--code-background-color-contrast': 'black',
  '--code-background-color-inverted': '#37230F',
  '--code-background-color-inverted-contrast': 'white',
  '--background-image': 'look/back.png")',
};

/** A resource row holds only the end of `url("<base>/<path>")`, compared with `endsWith`. */
export const isLookSuffixRow = (expected: string): boolean => expected.endsWith('")');

/** The table split into rows compared exactly and rows compared with `endsWith`. */
export function splitLookTable(table: Record<string, string>): {
  exact: Record<string, string>;
  suffix: Record<string, string>;
} {
  const exact: Record<string, string> = {};
  const suffix: Record<string, string> = {};
  for (const [name, expected] of Object.entries(table)) (isLookSuffixRow(expected) ? suffix : exact)[name] = expected;
  return { exact, suffix };
}

/** A few Aero defaults (public/themes/aero.html default-value attributes), the settled anchor before `Set vars`. */
export const AERO_DEFAULTS_SUBSET: Record<string, string> = {
  '--color': '#000000',
  '--font-size': '12px',
};
