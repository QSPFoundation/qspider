// The debugger fixture game (debugger/debugger.qsps, packed as ARCHIVES.debuggerZip): the location names, the
// action label, the link text and the strings each location writes. Keep this module free of test-framework
// imports: both runners load it.
import { fileURLToPath } from 'node:url';

export const DEBUGGER_GAME = {
  path: fileURLToPath(new URL('../artifacts/fixtures/debugger.zip', import.meta.url)),
  title: 'Debugger game',
  location: { start: 'start', second: 'second', vars: 'vars', syntax: 'syntax', acts: 'acts' },
  action: { go: 'go', vars: 'vars', bump: 'bump', hold: 'hold', syntax: 'syntax', acts: 'acts' },
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
  /**
   * The `syntax` location: one statement of each kind the engine reads (a Cyrillic name, fields `A.B.C`, a keyed
   * item, a record, `$MID`, two-word statements, `!` as an operator and as a mid-line comment, a `{…}` block with
   * `<<…>>` in a string, a ` _` continuation, a multi-line string and a multi-line comment), then field paths (lines
   * 25–28: a field of a keyed item of a prefixed base, a quoted field read, a field set and read through a prefixed
   * base), then `*pl` of `end`. Its description is `description`. The editor shows the engine's spelling
   * (upper-cased outside strings and blocks), at the engine's line numbers: the joined continuation leaves line 16
   * blank, the string ends on 19, the comment on 23. Hover lines read `label = value`.
   */
  syntax: {
    end: 'SYNTAX END 5',
    /** The first line, as the editor shows it. */
    firstLine: 'ПЕРЕМЕННАЯ = 5',
    /** The line of `CODE = { $T = 'in <<A.B.C>>' }`. */
    blockLine: 14,
    description: '<b>Gold: <<A.B.C>></b>',
    /** `leaf` is first `C` of `A.B.C = 42` on line 2, and last the one in `'in <<A.B.C>>'` in the block on `blockLine`. */
    token: { cyrillic: 'ПЕРЕМЕННАЯ', base: 'A', field: 'B', leaf: 'C', s: '$S', mid: '$MID', item: '$INV2' },
    hover: {
      cyrillic: 'ПЕРЕМЕННАЯ = 5',
      base: 'A = [B: [C: 42]]',
      field: 'A.B = [C: 42]',
      leaf: 'A.B.C = 42',
      item: "$INV2['K'] = 'brass'",
      s: "$S = 'ello'",
    },
    /** Watch entries by their canonical text (as a pin adds them), their values, and an entry the watch rejects. */
    watch: { leaf: 'A.B.C', leafValue: '42', item: "$INV2['K']", itemValue: "'brass'", invalid: 'a[i]' },
    /**
     * The field paths: `$REC['k'].TITLE = 'Sir'` (line 25, `itemField`), `$FULL = R.'full name'` (26, `quoted`; the
     * record `R` holds `'full name'` too, on line 4, so the hover takes the last one in view) and
     * `$JOB = $P.ROLE` (28, `prefixed`, the last `ROLE`: line 27 sets `P.ROLE`). `line` is brought into view first.
     */
    paths: {
      line: 26,
      token: { itemField: 'TITLE', quoted: "'full name'", prefixed: 'ROLE' },
      hover: { itemField: "$REC['K'].TITLE = 'Sir'", quoted: "R.'FULL NAME' = 'B B'", prefixed: "$P.ROLE = 'cook'" },
      watch: { itemField: "$REC['K'].TITLE", itemFieldValue: "'Sir'" },
    },
    change: 'A.B.C changed',
    changeAt: 'syntax, line 2',
    /** The first line after each multi-line construct: its engine line number and its code as the editor shows it. */
    after: {
      continuation: { line: 17, code: 'AFTER_JOIN = 1' },
      string: { line: 20, code: 'AFTER_STRING = 1' },
      comment: { line: 24, code: 'AFTER_COMMENT = 1' },
    },
  },
  /**
   * The `acts` location: `placed` is written with `act`; `detached` and `back` are made by a `dynamic` block (so their
   * lines are numbered from the block's opening line; `detached` has a `cla` and a multi-line string), and `back` jumps
   * to `acts` again. `placed`'s line 3 and `detached`'s first line share a number: a line breakpoint there is the
   * false-hit case. `startLine` is line 1 of `acts`, as the editor shows it.
   */
  acts: {
    start: 'ACTS START',
    startLine: { line: 1, code: "*PL 'ACTS START'" },
    placed: { name: 'placed', line: 3, code: 'PLACED = 1', done: 'PLACED DONE' },
    detached: {
      name: 'detached',
      /** Engine lines inside the dynamic block: first line, the `cla` line, the multi-line string's first line, the last. */
      first: { line: 3, code: 'DETACHED = 1' },
      cla: { line: 4, code: 'CLA' },
      note: { line: 5, code: "$NOTE = 'two" },
      last: { line: 7, code: "*PL 'DETACHED DONE'" },
      done: 'DETACHED DONE',
    },
    back: { name: 'back' },
  },
} as const;
