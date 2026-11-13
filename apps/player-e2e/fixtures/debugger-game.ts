// The debugger fixture game (debugger/debugger.qsps, packed as ARCHIVES.debuggerZip): the location names, the
// action label, the link text and the strings each location writes. Keep this module free of test-framework
// imports: both runners load it.
import { fileURLToPath } from 'node:url';

export const DEBUGGER_GAME = {
  path: fileURLToPath(new URL('../artifacts/fixtures/debugger.zip', import.meta.url)),
  title: 'Debugger game',
  location: { start: 'start', second: 'second', vars: 'vars' },
  action: { go: 'go', vars: 'vars', bump: 'bump', hold: 'hold' },
  /** The link in `start`: it runs `gt 'second'`. */
  link: { text: 'to second', qa: 'debug-link' },
  text: { start: 'DEBUG START', second: 'DEBUG SECOND', varsEnd: 'VARS END 70' },
  /**
   * The `hits` variable (set to 5 by `start`) and the actions that change it without leaving `start`: `bump` changes it
   * on its only line, `hold` on its first line, which then shows a msg, and writes `after` on its second line.
   */
  hits: { token: 'HITS', afterBump: '6', changeBump: 'HITS changed 5 → 6', at: 'start, line 1' },
  hold: { msg: 'HOLD', after: 'HELD DONE' },
  /**
   * What the debugger's editor shows: the engine's own spelling of the code, which upper-cases keywords
   * (`*PL`, `GT`). `second` has two lines, so a step has a next line to move to.
   */
  code: { start: "*PL 'DEBUG START'", second: "*PL 'DEBUG SECOND'", goAction: "GT 'second'" },
  /**
   * The `vars` location (11 lines, one statement each; the last two read `$nothing`, a name nothing sets, and `$inv` whole): what the variable hover, the watch panel and break on change
   * read. `changeLine` is the line of `GOLD -= 30`; `hover` is what hovering each variable shows once the first six
   * lines ran. Hover tokens are spelled as the editor shows them (upper-cased).
   */
  vars: {
    changeLine: 7,
    /** The last line of `vars`, as the editor shows it: the one that reads `$inv` whole. */
    lastLine: 'BAG = $INV',
    token: { gold: 'GOLD', who: '$WHO', rec: '%REC', numberU: '#U', unset: '$NOTHING', inv: '$INV' },
    hover: {
      gold: '100',
      who: "'Ann'",
      rec: "[NAME: 'Ann', AGE: 30]",
      hiddenByPrefix: "'42'",
      unset: '$NOTHING — not set',
      /** `$inv` hovered with no brackets: its item count, then its items (`'sword'`, and `'key'` → `'brass'`). */
      invCount: '$INV — 2 items',
      invItems: ['sword', 'brass'],
    },
    rows: { name: 'NAME', nameValue: "'Ann'", age: 'AGE', ageValue: '30' },
    watch: { before: '100', after: '70' },
    change: 'GOLD changed 100 → 70',
    changeAt: 'vars, line 7',
  },
} as const;
