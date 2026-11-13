// The debugger fixture game (debugger/debugger.qsps, packed as ARCHIVES.debuggerZip): the location names, the
// action label, the link text and the strings each location writes. Keep this module free of test-framework
// imports: both runners load it.
import { fileURLToPath } from 'node:url';

export const DEBUGGER_GAME = {
  path: fileURLToPath(new URL('../artifacts/fixtures/debugger.zip', import.meta.url)),
  title: 'Debugger game',
  location: { start: 'start', second: 'second' },
  action: { go: 'go' },
  /** The link in `start`: it runs `gt 'second'`. */
  link: { text: 'to second', qa: 'debug-link' },
  text: { start: 'DEBUG START', second: 'DEBUG SECOND' },
  /**
   * What the debugger's editor shows: the engine's own spelling of the code, which upper-cases keywords
   * (`*PL`, `GT`). `second` has two lines, so a step has a next line to move to.
   */
  code: { start: "*PL 'DEBUG START'", second: "*PL 'DEBUG SECOND'", goAction: "GT 'second'" },
} as const;
