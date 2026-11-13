// The debugger fixture game (debugger/debugger.qsps, packed as ARCHIVES.debuggerZip): the location names, the
// action label, the link text and the strings each location writes. Keep this module free of test-framework
// imports: both runners load it.
import { fileURLToPath } from 'node:url';

export const DEBUGGER_GAME = {
  path: fileURLToPath(new URL('../artifacts/fixtures/debugger.zip', import.meta.url)),
  title: 'Debugger game',
  location: { start: 'start', second: 'second', vars: 'vars' },
  action: { go: 'go', vars: 'vars' },
  /** The link in `start`: it runs `gt 'second'`. */
  link: { text: 'to second', qa: 'debug-link' },
  text: { start: 'DEBUG START', second: 'DEBUG SECOND', varsEnd: 'VARS END 70' },
  /**
   * What the debugger's editor shows: the engine's own spelling of the code, which upper-cases keywords
   * (`*PL`, `GT`). `second` has two lines, so a step has a next line to move to.
   */
  code: { start: "*PL 'DEBUG START'", second: "*PL 'DEBUG SECOND'", goAction: "GT 'second'" },
  /**
   * The `vars` location (9 lines, one statement each): what the variable hover, the watch panel and break on change
   * read. `changeLine` is the line of `GOLD -= 30`; `hover` is what hovering each variable shows once the first six
   * lines ran. Hover tokens are spelled as the editor shows them (upper-cased).
   */
  vars: {
    changeLine: 7,
    token: { gold: 'GOLD', who: '$WHO', rec: '%REC', numberU: '#U' },
    hover: { gold: '100', who: "'Ann'", rec: "[NAME: 'Ann', AGE: 30]", hiddenByPrefix: "'42'" },
    watch: { before: '100', after: '70' },
    change: 'GOLD changed 100 → 70',
    changeAt: 'vars, line 7',
  },
} as const;
