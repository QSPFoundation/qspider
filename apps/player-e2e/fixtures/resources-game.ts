// The resources fixture game (resources-game/resources-game.qsps): images by every path spelling, a
// view, menu and $BACKIMAGE, game.cfg styles / scripts / font, and two sounds. Packed as
// ARCHIVES.resourcesZip (web and desktop archive imports lowercase every path on disk / in storage, so
// case never matters there), as ARCHIVES.resourcesMissingZip (the cfg also lists a script and a style
// that are not in the archive) and as a PLAIN FOLDER (ARCHIVES.resourcesFolder, real case on disk, the
// only variant where case and backslashes can fail). Keep this module free of test-framework imports:
// both runners load it.
import { ARCHIVES } from './archives';
import { ASSET_SERVER, assetUrl } from './asset-server';

export const RESOURCES_GAME = {
  zipPath: ARCHIVES.resourcesZip.path,
  missingZipPath: ARCHIVES.resourcesMissingZip.path,
  /** The .qsps inside the plain folder: open it directly (desktop `local_path`); its game.cfg sits next to it. */
  folderGamePath: ARCHIVES.resourcesFolder.path,
  /** The same folder served on web under `<origin>/<servedDir>/` (see targets/web/global-setup.ts). */
  servedDir: 'e2e-fixtures/resources-game',
  /** Written by the game. Locations: start, media, resources, sound. */
  text: {
    start: 'RES START',
    actionClicked: 'RES ACTION CLICKED',
    media: 'RES MEDIA',
    menuPicked: 'RES MENU PICKED',
    resources: 'RES RESOURCES',
    soundReady: 'SND READY',
  },
  /** Action labels, per location. */
  actions: {
    start: { action: 'Act image', toMedia: 'To media', toResources: 'To resources', toSound: 'To sound' },
    media: {
      viewBackslash: 'View backslash',
      menuImage: 'Menu image',
      backimageData: 'Backimage data',
      backimageBackslash: 'Backimage backslash',
      backimageExternal: 'Backimage external',
      playExternal: 'Play external',
      fetchText: 'Fetch text',
      fetchRelative: 'Fetch relative',
    },
    sound: {
      play: 'Play',
      playAgain: 'Play again',
      isPlaying: 'Is playing',
      close: 'Close',
      playTwo: 'Play two',
      closeAll: 'Close all',
      playBackslash: 'Play backslash',
      closeBackslash: 'Close backslash',
    },
  },
  /** The menu item the `Menu image` action opens (its image is `files.menu`). */
  menuItem: 'RES MENU ONE',
  /**
   * `data-qa` of the game-authored <img> elements on the start location, with the file each one names.
   * `src` is the spelling in the game; `file` the real name in the archive / folder.
   */
  images: {
    forward: { qa: 'res-img-forward', src: 'Img/Sub/Mixed.png', file: 'Img/Sub/Mixed.png' },
    backslash: { qa: 'res-img-backslash', src: 'Img\\Sub\\Back.png', file: 'Img/Sub/Back.png' },
    space: { qa: 'res-img-space', src: 'Img/With Space/Pic One.png', file: 'Img/With Space/Pic One.png' },
    cyrillic: { qa: 'res-img-cyrillic', src: 'Img/Папка/Рис.png', file: 'Img/Папка/Рис.png' },
    /** Wrong case on purpose (`img/sub/CASE.png` for `Img/Sub/Case.png`): the only reference that is not byte-exact. */
    wrongCase: { qa: 'res-img-case', src: 'img/sub/CASE.png', file: 'Img/Sub/Case.png' },
    query: { qa: 'res-img-query', src: 'Img/Sub/Query.png?v=2', file: 'Img/Sub/Query.png' },
    /** A vector picture: browsers do not sniff SVG, so it only renders when served with an image Content-Type. */
    svg: { qa: 'res-img-svg', src: 'Img/Vector.svg', file: 'Img/Vector.svg' },
  },
  /** Natural sizes (width, height) tell the files apart: every image is a different size. */
  files: {
    forward: 'Img/Sub/Mixed.png',
    backslash: 'Img/Sub/Back.png',
    space: 'Img/With Space/Pic One.png',
    cyrillic: 'Img/Папка/Рис.png',
    wrongCase: 'Img/Sub/Case.png',
    query: 'Img/Sub/Query.png',
    action: 'Img/Act.png',
    object: 'Img/Obj.png',
    view: 'Img/View.png',
    menu: 'Img/Menu.png',
    svg: 'Img/Vector.svg',
  },
  /**
   * The $BACKIMAGE `data:` action: a 1x1 PNG. The game spells the same URI;
   * keep both in sync (guarded in build-fixtures.spec.ts).
   */
  /** The start location's <img> with the same data: PNG in src: it must load (1px wide), so data: images work. */
  dataImageQa: 'res-img-data',
  dataImage:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  /**
   * Absolute http URLs the game spells (`$BACKIMAGE`, `PLAY`), served by fixtures/asset-server.ts on a fixed port.
   * Keep them in sync with the game (guarded in build-fixtures.spec.ts).
   */
  externalImage: assetUrl(ASSET_SERVER.paths.image),
  externalSound: assetUrl(ASSET_SERVER.paths.sound),
  /** Script one reads this URL with XMLHttpRequest (spelled in js/one.js) and writes `text` into the `xhr` mark. */
  externalText: { url: assetUrl(ASSET_SERVER.paths.text), text: ASSET_SERVER.text },
  /** Script one reads this game file by a relative URL (spelled in js/one.js) and writes `text` into the `xhrRel` mark. */
  relativeText: { path: 'data/rel.txt', text: 'REL TEXT' },
  /** Objects/actions: `img[data-qsp="action-image"]`, `[data-qsp="object-image"]`; the object's label. */
  objectLabel: 'RES OBJECT',
  /**
   * Resources section of game.cfg: `data-qa`-less, read from <head> (`[data-qspider-resource]`) and from the
   * page. Paths are as written in game.cfg (mixed case on purpose: `css/Two.css`, `js/Two.js`).
   */
  cfg: {
    styles: ['css/one.css', 'css/Two.css'],
    scripts: ['js/one.js', 'js/Two.js'],
    font: { family: 'E2eFont', path: 'fonts/e2e.ttf' },
    /** Added by the missing variant, first in each list; none of them is in the archive. */
    missingStyle: 'css/missing.css',
    missingScript: 'js/missing.js',
  },
  /**
   * `data-qa` of the elements. The two game-authored ones sit on the `resources` location; the rest are created
   * by the game scripts in <body> when the game fires an event (`exec 'qspider.event:<name>'`, delivered as a
   * `qspider-event` window event by setTimeout 0).
   */
  marks: {
    /** Game-authored: carries `--e2e-element: styled` (style one) next to the root custom properties. */
    styled: 'res-styled',
    /** Game-authored: `font-family: E2eFont, monospace` (style one). */
    font: 'res-font',
    /**
     * Script one writes it when it hears `res_start`, which the start location fires the moment the game starts.
     * A game that started before the scripts loaded never shows it (its listener came too late).
     */
    startSeen: 'res-start-seen',
    /**
     * Script one writes both on `res_start` too: `startReady` the value of `--e2e-one` at that moment (the style was
     * applied before the start); `startFont` whether the E2eFont face had status `loaded` (no load requested).
     */
    startReady: 'res-start-ready',
    startFont: 'res-start-font',
    /** Scripts one / two, on `res_show` (fired when the `resources` location opens). */
    scriptOne: 'res-script-one',
    scriptTwo: 'res-script-two',
    /** Script two: `RES ORDER one,two` = the order the scripts ran in. */
    order: 'res-order',
    /** Script two: `RES FONT LOADED` once a FontFace named E2eFont has status `loaded`, else `RES FONT NOT LOADED`. */
    fontStatus: 'res-font-status',
    /** Script one, on `res_xhr`: the responseText of an XMLHttpRequest to an absolute http URL. */
    xhr: 'res-xhr',
    /** Script one, on `res_xhr_rel`: the decoded response of a relative XMLHttpRequest for `relativeText.path`. */
    xhrRel: 'res-xhr-rel',
  },
  scriptText: {
    startSeen: 'RES SCRIPT SAW START',
    startReady: 'RES START ONE=ONE',
    startFont: 'RES START FONT=true',
    one: 'RES SCRIPT ONE',
    two: 'RES SCRIPT TWO',
    order: 'RES ORDER one,two',
    fontLoaded: 'RES FONT LOADED',
  },
  /** Custom properties of the styles (read with the CSS probe): on :root, and on the styled element. */
  css: {
    root: { '--e2e-one': 'ONE', '--e2e-two': 'TWO', '--e2e-both': 'two' },
    element: { '--e2e-element': 'styled' },
  },
  /**
   * Sound lines written by the sound location: `<prefix><0|1>` per sound, from `str(ISPLAY(...))` right after the
   * statement. Prefixes are unique in the game text.
   */
  sound: {
    a: 'snd/a.wav',
    b: 'snd/b.wav',
    /**
     * b.wav is played as `snd\b.wav`; `Play backslash` and `Close backslash` also write ISPLAY of the forward
     * spelling (` F=`). The engine only hands CLOSE to the player for the exact spelling PLAY used, so a CLOSE in
     * the other spelling never arrives.
     */
    backslashB: 'snd\\b.wav',
    lines: {
      play: 'SND PLAY A=',
      playAgain: 'SND AGAIN A=',
      isPlaying: 'SND IS A=',
      close: 'SND CLOSE A=',
      playTwo: 'SND TWO A=',
      closeAll: 'SND CLOSEALL A=',
      backslash: 'SND BACKSLASH B=',
      closeBackslashB: 'SND CLOSEB B=',
    },
    /** Volumes the `Play` / `Play again` actions pass. */
    volume: { play: 50, playAgain: 80 },
    /** Seconds of each wav: long enough that nothing ends by itself during a scenario. */
    seconds: 20,
  },
} as const;

/** The generated PNGs: path, natural width and height. */
export const RESOURCES_IMAGES: Record<string, readonly [width: number, height: number]> = {
  [RESOURCES_GAME.files.forward]: [3, 2],
  [RESOURCES_GAME.files.backslash]: [4, 2],
  [RESOURCES_GAME.files.space]: [5, 2],
  [RESOURCES_GAME.files.cyrillic]: [6, 2],
  [RESOURCES_GAME.files.wrongCase]: [7, 2],
  [RESOURCES_GAME.files.query]: [8, 2],
  [RESOURCES_GAME.files.action]: [9, 2],
  [RESOURCES_GAME.files.object]: [10, 2],
  [RESOURCES_GAME.files.view]: [11, 2],
  [RESOURCES_GAME.files.menu]: [12, 2],
};

/** The generated SVGs: path, natural width and height (the file states both). */
export const RESOURCES_SVGS: Record<string, readonly [width: number, height: number]> = {
  [RESOURCES_GAME.files.svg]: [13, 2],
};
