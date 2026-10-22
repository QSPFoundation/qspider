// The panels fixture game (panels/panels.qsps, packed as ARCHIVES.panelsZip with obj.png): its path
// and the strings it writes. Keep this module free of test-framework imports: both runners load it.
//
// QSP 5.9 choices (engine @qsp/wasm-engine 1.6.1):
// - `*pl` / `*clr` write the main text; `pl` / `clr` (no star) write the stats panel.
// - Handlers are set by assigning a location name to a special string variable: `$onobjsel`
//   (object selected; the object's name is in `$selobj`), `$usercom` (text typed in the input line;
//   the text is in `$user_text`), `$counter` (called by the `settimer` interval).
// - Assigning `$user_text` does NOT change the input line (observed: the input line keeps its text);
//   game code empties the input line with `cmdclear`.
// - `addobj 'Name', 'image'` adds an object with an image; `showstat` / `showobjs` / `showacts` /
//   `showinput` take 0 or 1.
// - Every location has at most 8 actions.
// - The start location runs `inclib 'qspider'`: the qspider_* locations (event, region, layer)
//   live in the player's qspider module, which a game must include before calling them.
// - The start location also runs `inclib 'panels-lib.qsps'`, a real file in the zip: unlike the built-in
//   qspider module, it is fetched asynchronously, so a restart exercises the player's async library load.
import { ARCHIVES } from './archives';

export const PANELS_GAME = {
  path: ARCHIVES.panelsZip.path,
  title: 'Panels game',
  /** Action labels, grouped by the location that holds them. */
  action: {
    /** Start location: one action per room. */
    start: {
      stats: 'Stats',
      objects: 'Objects',
      command: 'Command line',
      keys: 'Action keys',
      system: 'System',
      lifecycle: 'Lifecycle',
      counter: 'Counter',
    },
    stats: {
      /** Clears the stats panel, then writes text.statsOne there. */
      write: 'Write stats',
      /** Appends text.statsTwo to the stats panel. */
      add: 'Add stats',
      hideStats: 'Hide stats',
      showStats: 'Show stats',
      /** showacts 0, then writes text.actionsHidden in the main text. */
      hideActions: 'Hide actions',
    },
    objects: {
      /** addobj 'Lamp', 'obj.png' */
      addLamp: 'Add object',
      /** addobj 'Key' (no image) */
      addKey: 'Add plain',
      removeKey: 'Remove plain',
      hideObjects: 'Hide objects',
      showObjects: 'Show objects',
    },
    command: {
      showInput: 'Show input',
      hideInput: 'Hide input',
      /** `cmdclear`: empties the input line. */
      clearInput: 'Clear input',
    },
    keys: {
      // first and third are fixture labels (they log digits 1 and 3 when run by the digit keys); only second is referenced by name.
      first: 'First',
      second: 'Second',
      third: 'Third',
      /** Goes to the room whose only action is single.only. */
      single: 'Single',
    },
    single: { only: 'Only' },
    system: {
      /** qspider_event 'e2e_event' with args 'A' and 7 (see event). */
      fireEvent: 'Fire event',
      /** Fills the region `reg` with text.regionOne. */
      region: 'Region',
      /**
       * Shows the layer `lay` (text.layerOn). It is hidden on entering the system room. A hidden
       * qsp-layer renders nothing (the renderer returns null), so "layer shown" is the presence of
       * `[data-layer-name="lay"]` content in the DOM, not visibility of an always-present element.
       */
      layer: 'Layer',
      unlayer: 'Unlayer',
      /** exec 'qspider.fullscreen:on', then writes text.afterFullscreen. */
      fullscreen: 'Fullscreen',
      quit: 'Quit',
    },
    life: {
      /** Fills region `lifereg` with text.lifeRegion and shows layer `lifelay` (text.lifeLayer). */
      fill: 'Fill',
      restart: 'Restart via game',
    },
    counter: {
      message: 'Message',
      input: 'Input',
      menu: 'Menu',
    },
  },
  text: {
    start: 'PANELS START',
    statsOne: 'STATS ONE',
    statsTwo: 'STATS TWO',
    actionsHidden: 'ACTIONS HIDDEN',
    /** Written after selecting the object with the given name. */
    selected: (name: string): string => `SELECTED ${name}`,
    /** Written after the player submitted the given text in the input line. */
    typed: (text: string): string => `TYPED ${text}`,
    keysRoom: 'KEYS ROOM',
    /** The keys room appends the digit of each action run (First=1, Second=2, Third=3) to a log. */
    keyLog: (digits: string): string => `LOG=${digits}`,
    singleRoom: 'SINGLE ROOM',
    /** Written by the only action of the single room (the Space key). */
    spaceRan: 'SPACE RAN',
    /** Written by location hotkey_loc, bound to the key `k` in game.cfg. */
    hotkeyRan: 'HOTKEY RAN',
    systemRoom: 'SYSTEM ROOM',
    regionOne: 'REGION ONE',
    layerOn: 'LAYER ON',
    afterFullscreen: 'AFTER FULLSCREEN',
    lifeRoom: 'LIFE ROOM',
    /** The life room writes region `lifereg` (empty) and layer `lifelay` (hidden); action life.fill fills and shows them. */
    lifeRegion: 'LIFE REGION',
    lifeLayer: 'LIFE LAYER',
    counterRoom: 'COUNTER ROOM',
    /** Every timer tick writes `[TICKS=n]` to the stats panel (delimited so TICKS=1 is not a substring of TICKS=10; the counter resets to 0 on entering the counter room). This parses it: one capture group, the tick count. */
    ticksPattern: /\[TICKS=(\d+)\]/,
    counterMsg: 'COUNTER MSG',
    /** Prompt of the Input action's dialog (not a prefix of the echo). */
    counterInputPrompt: 'ENTER COUNTER VALUE',
    counterMenuItem: 'Only item',
    counterMenuPicked: 'COUNTER MENU PICKED',
  },
  /** Object names added by the objects room. */
  object: { lamp: 'Lamp', key: 'Key' },
  /** The object image shipped in the zip. */
  objectImage: 'obj.png',
  /** The keyboard key bound to hotkey_loc. */
  hotkey: 'k',
  /** Event raised by system.fireEvent: name and args as the game passes them. */
  event: { name: 'e2e_event', args: ['A', 7] },
  /** The data-qa of the always-present link that runs `showacts 1`. Documents the literal in `screenplay/game/elements.ts` (ShowActionsLink); not imported there. */
  showActsLink: 'show-acts',
} as const;
