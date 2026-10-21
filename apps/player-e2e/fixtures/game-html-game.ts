// The game-html fixture game (game-html/game-html.qsps, packed as ARCHIVES.gameHtmlZip): its path,
// the action labels, the data-qa marks and the strings it writes. Keep this module free of
// test-framework imports: both runners load it.
import { fileURLToPath } from 'node:url';

export const GAME_HTML = {
  path: fileURLToPath(new URL('../artifacts/fixtures/game-html.zip', import.meta.url)),
  title: 'Game HTML',
  /** Action labels. Start-location actions navigate to a feature location; the rest act inside one. */
  actions: {
    markup: 'markup',
    links: 'links',
    events: 'events',
    form: 'form',
    bind: 'bind',
    watchers: 'watchers',
    /** Start location: opens the hostile menu (the start actions panel clips more than eight rows). */
    hostile: 'hostile',
    hostileSvg: 'hostile svg',
    hostileIframe: 'hostile iframe',
    hostileJs: 'hostile js',
    hostileMalformed: 'hostile malformed',
    /** bind location: writes BOUND=<value>. */
    showBind: 'show bind',
    /** watchers location. */
    changeVar: 'change var',
    changeStyle: 'change style',
    fillRegion: 'fill region',
    fillLayer: 'fill layer',
  },
  /** data-qa values of authored elements. */
  marks: {
    bold: 'mk-bold',
    execLink: 'exec-link',
    numLink: 'num-link',
    areaLink: 'area-link',
    /** The <img> the area is mapped onto: Playwright clicks it, as an <area> has no box. */
    areaImage: 'area-image',
    onClick: 'on-click',
    onEnter: 'on-enter',
    onLeave: 'on-leave',
    /** Outcome spans of mouseenter/mouseleave: those handlers append without clearing, so the spans survive the hovered element being detached mid-hover. */
    enterResult: 'enter-result',
    leaveResult: 'leave-result',
    form: 'the-form',
    formField: 'form-field',
    formSubmit: 'form-submit',
    bindField: 'bind-field',
    showChild: 'show-child',
    hostileFrame: 'hostile-frame',
    jsLink: 'js-link',
    /** Attribute the iframe payload sets on <body> if it escapes the sandbox. */
    pwnedAttribute: 'data-qa-pwned',
  },
  text: {
    start: 'GAME HTML START',
    bold: 'MARKUP BOLD',
    execResult: 'EXEC LINK RESULT',
    numResult: 'NUM LINK RESULT',
    areaResult: 'AREA LINK RESULT',
    clickResult: 'ON CLICK RESULT',
    enterResult: 'ON ENTER RESULT',
    leaveResult: 'ON LEAVE RESULT',
    formResult: 'FORM SUBMIT RESULT',
    /** `BOUND=<value>` after the show bind action. */
    bound: (value: string): string => `BOUND=${value}`,
    varOne: 'VAR ONE',
    varTwo: 'VAR TWO',
    shown: 'SHOWN',
    regionText: 'REGION TEXT',
    layerText: 'LAYER TEXT',
    svgBenign: 'SVG BENIGN',
    iframeBenign: 'IFRAME BENIGN',
    jsBenign: 'JS BENIGN',
    jsLink: 'JS LINK',
    malformed: 'MALFORMED OK',
    /** Written by every hostile payload that manages to run. */
    inject: 'PWNED',
  },
  /** Image file bundled in the archive for the <area>/<img> row. */
  image: 'view.png',
} as const;
