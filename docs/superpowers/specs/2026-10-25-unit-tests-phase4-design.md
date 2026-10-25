# Phase 4: unit tests for every pure function

Phase 4 of `2026-10-20-automated-checks-design.md`, rescoped by the maintainer on 2026-10-25.

## Intent

The goal of all test work is to change code without fear. Phases 1–3 cover integration end to end: the engine, storage, the file system, Tauri, translations and the platforms. Phase 4 covers the remaining layer, the pure logic. When a parser, converter or helper changes, a fast unit test should say what broke, without a 10-minute E2E run and without having to guess which scenario exercises it.

## Decided by the maintainer

- **Broad, not focused.** Cover the codebase as a whole. Don't concentrate on one area.
- **Stopping rule:** every pure function has a unit test. Data tables are skipped.
- **Refactor to reach pure functions.** When a pure function can't be reached from a test (private, inside a module with side effects at load time, inside a React hook, mixed with I/O), refactor the product code so it can be: export it, move it into its own file, or lift it out of the hook or the I/O. Player-visible behaviour must not change.
- **No `vi.mock` in unit tests, at all.** Not even to cut a heavy import that the function under test never calls. A pure function that lives in a file with heavy imports (`game-state`, `env`, `qsp-api`, `history`, Tauri) is moved into its own file first. Fake timers (`vi.useFakeTimers`) are the only test double allowed.
- **Existing mock-based specs get rewritten.** That covers `game-shelf`'s `pending-writes` and `add-imported` and the `desktop` specs `data-fetcher`, `setup`, `game-url`, `e2e-marks` and `storage-migration`. Extract their pure part and test it without mocks. Delete a mock-based assertion only after confirming an E2E scenario covers that behaviour. If none does, flag the gap to the maintainer instead of dropping the test.
- **DOM-dependent pure code runs in Vitest browser mode in a real browser** (Playwright provider), not in jsdom or happy-dom.
- **Unchanged rule from earlier phases:** integration stays E2E only. Unit tests cover pure logic only and never mock the engine, storage, Tauri, the file system or the network to test integration code (memory `engine-integration-real-e2e`). This replaces the stale Phase 4 list in the 2026-10-20 spec (`game-state` save/load, `game-shelf`, `tauri-storage`).

## Definitions

**Pure function:** a function, or a method of a class or state atom, whose result depends only on its inputs (and on in-memory state it owns) and which needs none of the following to run: the QSP wasm engine, IndexedDB/Dexie, Tauri APIs, the file system, the network, audio, or a rendered React tree. Real DOM APIs such as `DOMParser`, `HTMLElement` and `CSSStyleDeclaration` are allowed, and those tests run in browser mode. Timers are allowed with fake timers.

Included: parsers, converters, string/path/colour helpers, condition checks, format detection, sort/filter logic, and reducers or derived values of xoid atoms over plain data.

**Data table:** a constant that is only data, with no logic (tag lists, attribute maps, MIME maps, the Monaco language definition, `contracts` types and constants). These are skipped. A function that reads a table is not a table and gets tested, through its behaviour.

## Scope

Projects: every `libs/*` project and `apps/player`, `apps/player-standalone`, `apps/player-desktop`. Excluded: `apps/player-e2e` (it has its own harness tests), `apps/docs`, `libs/docusaurus`, and the Rust in `src-tauri` (`pnpm check:rust` covers that).

Starting inventory, from a read-only sweep on 2026-10-25. This list is not authoritative: the builder re-sweeps, and the final review checks completeness against the code.

- `libs/utils`: colours, `common` (`resolvePath`, `prepareBaseUrl`, `hashString`, `defer`), `cyrb53`, `throttle`, `parseToml` (`cleanPath` is already tested).
- `libs/game-state`:
  - `qsp-gui-cfg` (the cfg parser, layout tree and HTML template, the largest unit);
  - `conditions`, `utils` (`prepareContent`/list helpers, `clamp`, `isHashPath`);
  - `prettifyHotkeys`;
  - `extractAttributes` (DOM);
  - the counter pause state, and the debugger state reducers in `debug`;
  - the pure parts of `panels`, `themes`, `input`/`msg`/`menu` and `qspider-commands`.
- `libs/html-renderer`: `HtmlParser` (DOM: sanitising, tag allow/ban, attribute filtering, line breaks) and its utils.
- `libs/renderer`: the attribute and style conversion inside `useAttributes` (lift it out), plus any other pure helpers found.
- `libs/debugger`: `debug-utils` (`decodePanelBitmask`, `formatListItems`, `formatEventArgs`).
- `libs/importers`: the archive root-folder search (`findRootDescriptorFolder`, `findRootGameFileFolder`, `getGameFolder`; private today).
- `libs/game-shelf`: `formatBytes`, shelf sorting and the derived maps in `game-shelf.ts`, and the `qsp-catalog` sort/filter state.
- `libs/i18n`: `formatDate`, if it is pure given an i18next instance.
- `libs/desktop`: the pure parts of the five mock-based specs' modules (see the rewrite decision), plus anything else pure.
- `apps/player`: `contentTypeOf` in the service worker (move it out of `service-worker.ts`).
- `apps/player-standalone`: the URL cleaning, base-URL derivation and config-to-shelf-entry mapping in `config-runner.ts` (lift them out of the fetch).
- Nothing expected in `libs/contracts`, `libs/browser`, `libs/tauri-storage`.

## Constraints

- **Wiring through NX:** each project that gains tests gets a vite/vitest config with a `test` block, so the `@nx/vitest` plugin infers its `test` target. `pnpm test`, `pnpm check` and the CI step `nx run-many -t lint typecheck test build` then pick it up. The only workflow change is a Chromium install step in the `checks` job, added in the PR that brings in browser mode. No new job and no change to required checks. Never call vitest directly in scripts or CI.
- **Environments:** `node` by default. Browser mode only in projects that have DOM-dependent pure code, using Chromium through the Playwright provider. CI's `checks` job must have Chromium available for it.
- **Tests describe behaviour** at the function's interface, not its internals. Use real inputs, such as a real `qspgui.cfg` snippet or real QSP HTML, with exact expected outputs. No snapshot tests of large outputs.
- **Defects found by a test** are fixed in the same PR: a red `test(...)` commit first, then the `fix(...)`. Ask the maintainer first if the fix is player-visible. Never write a test that pins a bug as expected behaviour.
- **Refactors** are pure moves or extractions, in their own `refactor(...)` commit, before the tests that need them. The E2E suites stay green.
- **PRs:** one per library group, each green on its own. Local checks are format check, lint, typecheck and the touched projects' tests. CI is the gate. Run no local `check:full`.
- **Process rules from earlier phases apply:** plain branch in the main checkout (no worktree), push and open a PR when done, merge only when the maintainer says so.

## Non-goals and anti-goals

- **No line- or branch-coverage threshold.** The rule is per function, not a percentage.
- **No unit tests of integration code with mocks.** This includes no mocked `qspApi`, Dexie or Tauri, and no `vi.mock` of any kind.
- **No tests that restate a data table** or assert implementation details (private call order, internal atom shape).
- **No new test hooks in release builds.**
- **No cross-engine browser matrix.** Unit tests run in Chromium only. Engine differences (WebKitGTK, WebView2) remain the desktop E2E suite's job.

## Claude's calls (check these)

- **Browser mode is per project.** Only `html-renderer` and `game-state` are expected to need it (`HtmlParser`, `extractAttributes`). The rest stays `node`, for speed.
- **PR split:**
  1. `utils`, `importers`, `game-shelf`, `debugger`, the apps and `i18n`, where the setup already exists or the work is small;
  2. `html-renderer` and `renderer`, which bring in browser mode and the CI Chromium step;
  3. `game-state`, which reuses browser mode for `extractAttributes`.
- **Mixed atom actions** (a state change welded to a storage or `qspApi` call): split the pure state transition into its own function, test it, and leave the I/O call to E2E. This follows from the refactor decision.
- **What counts as player-visible for the defect rule:** any fix that changes rendered output, parsed layout, or what a game does, for input a real game could produce, means asking first. Crashes on impossible input, dead code and internal-only fixes go ahead without asking. While waiting for an answer, the other tasks continue. The open defect's red test stays on the branch, and the PR isn't opened until it's settled.
- **Completeness check:** the final review of each PR lists the exported and internal functions of the touched projects and confirms each pure one has a test. There is no tool for this.
- **Fake timers** for `throttle` and the counter. No real waits.

## Left to the builder

- The exact Vitest browser-mode configuration and package versions (they must match `vitest` 5.0.5).
- How to name and place extracted files and test files (follow the existing `*.spec.ts` next to the source).
- Which xoid atom logic counts as pure after reading it, within the definition above.
- Task granularity within each PR.
