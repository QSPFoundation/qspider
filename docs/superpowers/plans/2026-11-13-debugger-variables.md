# Debugger Variables Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The F12 debugger shows variable values on hover, keeps a per-game watch list, can pause when a watched
variable changes, and stops all pausing while its panel is closed. `<qsp-variable>` prints records the QSP way.

**Architecture:**

- Pure logic lives in `libs/game-state/src/debug-watch-logic.ts` and is unit-tested.
- Engine reads and state live in `libs/game-state/src/debug-watch.ts`. Snapshots are taken at debug stops and
  after engine runs, and only while the panel is open.
- `libs/debugger` renders a Monaco hover provider and a watch panel inside the lazy debug-panel chunk.
- E2E comes first and is red on main.

**Tech Stack:** TypeScript, React 19, xoid, Monaco (bundled, `edcore.main`), @qsp/wasm-engine 2.0.0,
Serenity/JS E2E.

**Spec:** `docs/superpowers/specs/2026-11-13-debugger-variables-design.md`

## Global Constraints

- Maintainer decisions 1–9 and the "Builder-check calls" in the spec are binding. In particular:
  - Watching is active only while the panel is open: no reads at all while it is closed.
  - Closing the panel releases a pause. A held link execution runs.
  - Closing the panel turns engine debug mode off. Reopening turns it back on if it was on.
  - The watch list is keyed by the shelf entry id, and only names are stored.
  - Entries are case-insensitive, but the prefix counts.
  - Only the debug stop that follows a change is attributed to the line before it. First-stop changes are
    labelled "between runs". A change made by a run's last line is reported without a pause.
- No variable browser, no expression evaluation, no hover in `<<...>>`, no save inspection, and no writes to
  variables.
- Hover never runs engine code. It only uses `readVariable*`. Index expressions other than a literal or a single
  plain variable show the array summary.
- Unit tests cover pure functions only, with no mocks. Engine behaviour is proved by E2E.
- E2E follows the Rules in `apps/player-e2e/README.md`. Monaco's own DOM may be located by its CSS classes in
  `elements.ts`, as `.view-lines` already is.
- Use nx for tasks. Web single spec: `pnpm nx build player`, then
  `CHROME_BIN=/usr/bin/chromium pnpm exec playwright test -c apps/player-e2e/targets/web/playwright.config.ts <name>.scenario`,
  then `fuser -k 4300/tcp`. Delete `apps/player-e2e/artifacts/web-report` after a failed run.
- No local desktop E2E. CI proves Linux and Windows.
- New UI code stays in the lazy debug-panel graph (#212). Game-state never imports Monaco.
- Conventional commits.

## Review Focus

1. **A game paused at a breakpoint when the panel closes.** It must continue, and leave no stale `resume` that
   could fire later. Pinned by Task 1, scenario 4.
2. **A watched array with thousands of items.** The snapshot must cap item reads, so a stop doesn't stall.
   Task 3 adds a unit test of the cap in the pure item-window function, and the reviewer checks the cap is
   applied in the engine reads.
3. **OPENQST or loading a save while the panel is open.** The baseline resets, with no spurious "changed"
   marks or pause. Task 3 unit-tests the reset in the snapshot state reducer, and the reviewer checks it is wired
   to `gameOpenEpoch$` and to save loads.
4. **Hover on a keyword-like identifier or an unset name.** It shows "not set", or nothing for keywords, never a
   fake `0`. Pinned in the Task 4 unit tests of `hoverReadPlan` and `describeHover`.
5. **Watch storage for a game opened from a file vs. from the shelf.** It uses the same id. Pinned by Task 1,
   scenario 5 (restart and reopen from the shelf).

---

### Task 1: E2E scenarios (red on main), including the record fix scenario

**Files:**

- Modify `apps/player-e2e/fixtures/debugger/debugger.qsps` and `fixtures/debugger-game.ts`. Add a location `vars`
  and a `start` action `vars` → `gt 'vars'`. The `vars` location, one statement per line:
  `gold = 100`, `$who = 'Ann'`, `$inv[] = 'sword'`, `$inv['key'] = 'brass'`, `%rec = [name: 'Ann', age: 30]`,
  `u = '42'`, `gold -= 30`, `*pl 'VARS END <<gold>>'`. No apostrophes in `!` comments. Keep the `vars` action as a
  base action, the way `go` is.
- Modify `apps/player-e2e/fixtures/game-html/game-html.qsps` (`watchers` location) and `fixtures/game-html-game.ts`.
  Add `%wrec = [name: 'Ann', age: 30]` and `<qsp-variable name="%wrec">` in a span with `data-qa="wrec"`.
- Modify `apps/player-e2e/screenplay/debugger/{elements,tasks,checks}.ts` and `screenplay/support/` if a probe is
  needed.
- Modify `apps/player-e2e/scenarios/debugger.scenario.ts` and `scenarios/variables.scenario.ts`.

**Interfaces (Produces): the `data-qa` contract later tasks must render.**

- `debug-watch-panel`: the watch panel.
- `debug-watch-input` and `debug-watch-add`: type a name, then add it.
- `debug-watch-entry` with `data-name="<NAME as entered, upper-cased>"` and `data-changed="true|false"`. Inside it:
  `debug-watch-value` (its text is the formatted value) and `debug-watch-pause-toggle` (`data-state="on|off"`).
- `debug-change-notice`: its text contains `<NAME> changed <old> → <new>` and `<location>, line <n>`, or
  `between runs`.
- Hover: Monaco's `.monaco-hover-content`. Its pin is a link with text `Pin`.
- Opening a hover portably: the task `HoverToken(text)` clicks the token in `.view-lines` (a span whose text is the
  token) and then presses `Ctrl+K`, `Ctrl+I` (Monaco "Show Hover"). It must not use mouse-move.

- [ ] **Step 1: Fixture changes.** Make them, plus the constants. Record values as the editor shows them
      (upper-cased code).
- [ ] **Step 2: Elements, tasks and checks.** Add them for the contract above. Tasks: `AddWatch(name)`,
      `ToggleWatchPause(name)`, `HoverToken(text)`, `PinFromHover()`. Checks: `SeeHoverText(contains)`,
      `SeeWatchValue(name, text)`, `SeeWatchChanged(name, bool)`, `SeeChangeNotice(contains)`.
- [ ] **Step 3: Scenarios.** Titles are verbatim. Each one uses the fixture's `vars` location with a breakpoint on
      `vars`, unless stated otherwise.
  1. `'hovering a variable while paused shows its value'`: step past the assignments. Hover `GOLD` shows `100`,
     `$WHO` shows `'Ann'`, and `%REC` shows `[NAME: 'Ann', AGE: 30]`.
  2. `'a pinned variable updates on step and is marked changed'`: `PinFromHover` on `GOLD`, step over `GOLD -= 30`,
     then the watch value is `70` and changed is true.
  3. `'break on change pauses after the changing line and names it'`: add `GOLD`, toggle pause, remove the
     breakpoint, and resume from the first stop. The status is paused, and the notice contains
     `GOLD changed 100 → 70` and `vars, line 7`.
  4. `'closing the panel releases a pause and stops pausing'`:
     - Paused at the `vars` breakpoint, close the panel. Main text shows `VARS END 70`.
     - Go back to start (restart via the pause screen is acceptable) with the panel closed and click `vars`
       again: no pause, the text appears.
     - Reopen and click `vars` again: paused.
  5. `'the watch list survives a player restart'`: add `GOLD`, then `ReturnToShelf`, `SeeShelfIncludes`,
     `SeeShelfWritesSettled`, `RestartPlayer`, open from the shelf, and open the debugger. The entry `GOLD` is
     there.
  6. `'a prefix that hides the stored value says so'`: hover `#U` after `u = '42'` ran. The text contains `0` and
     `'42'`. The `#u` must be a code token, not inside a `<<...>>` string (hover there is deferred): add
     `uval = #u` as line 9, the last line of `vars`. Keep `GOLD -= 30` as line 7, so scenario 3's line stays 7.
  7. In `variables.scenario.ts`: `'qsp-variable prints a record the QSP way'`. The `wrec` span reads
     `[NAME: 'Ann', AGE: 30]`.
- [ ] **Step 4: Run on web.** Expected: all 7 new scenarios FAIL, with each failure message recorded in the report.
      All existing debugger and variables scenarios still PASS. If a new scenario passes on main, report it and
      don't weaken it.
- [ ] **Step 5: Lint, typecheck, commit.** Lint and typecheck `player-e2e`, then commit
      `test(player-e2e): debugger variables scenarios`.

### Task 2: Records print the QSP way

**Files:** modify `libs/game-state/src/variable-logic.ts` and `variable-logic.spec.ts`.

**Interfaces:**

- `formatQspValue(v)` keeps its signature. Named items print as `NAME: <item>`. Unnamed items in the same tuple
  print as today. Nested records recurse.
- Produces `formatQspValueTruncated(v: QspVariableValue, maxItems: number): string`. A tuple with more than
  `maxItems` items prints the first `maxItems`, then `, …] (<n> items)`. Nested tuples are truncated with the same
  limit.

- [ ] **Step 1: Failing unit tests.**
  - A record built as `Object.assign(['Ann', 30], { names: ['NAME', 'AGE'] })` formats as
    `[NAME: 'Ann', AGE: 30]`.
  - A mixed `names: ['A', undefined]` formats as `[A: 1, 2]`.
  - A nested record inside a tuple keeps its names.
  - A truncated 12-item tuple with `maxItems` 3 formats as `[1, 2, 3, …] (12 items)`.

  Run `pnpm nx test game-state` and expect FAIL.

- [ ] **Step 2: Implement.** Run `pnpm nx test game-state` and expect PASS. Then build `player` and run
      `variables.scenario`: scenario 7 from Task 1 PASSES.
- [ ] **Step 3: Commit** `fix(game-state): records print with their field names`.

### Task 3: Watch list, snapshots, break on change, panel-closed gating (game-state)

**Files:**

- Create `libs/game-state/src/debug-watch-logic.ts` and `debug-watch-logic.spec.ts` (pure).
- Create `libs/game-state/src/debug-watch.ts` (engine and state).
- Modify `libs/game-state/src/debug.ts`: `setCurrentRecord`, `setLinkExecution`, `closeDebugPanel`,
  `openDebugPanel`, `toggleDebugPanel`.
- Modify `libs/game-state/src/qsp-api.ts` (`enableDebugMode`/`disableDebugMode` wiring) and `index.ts` (exports).

**Interfaces (Produces):**

- **Pure:**
  - `watchKey(name: string): string`. Upper-cased, prefix kept.
  - `addWatch(list: string[], name: string): string[]`. Deduplicates by `watchKey` and keeps the name as entered,
    upper-cased.
  - `removeWatch(list: string[], name: string): string[]`.
  - `parseWatchList(text: string | null): string[]` and `serializeWatchList(list: string[]): string`.
    Invalid input gives `[]`.
  - `interface WatchValue { value: QspVariableValue; size: number; items: Array<{ key: string | QspTuple | undefined; value: QspVariableValue }> }`
  - `itemWindow(size: number, max: number): number`. Returns the count to read, capped. The cap is
    `WATCH_ITEM_CAP = 100`.
  - `changedNames(prev: Record<string, WatchValue> | null, next: Record<string, WatchValue>): string[]`. `null`
    means a baseline, which gives `[]`. Comparison uses `sameValue` from `variable-logic.ts` on values and items.
  - `describeChange(name, prev: WatchValue, next: WatchValue): { name: string; from: string; to: string }`, using
    `formatQspValueTruncated`.
- **State and engine (`debug-watch.ts`):**
  - `watchList$: Atom<string[]>`, persisted per game under `qsp-debugger-watch:<gameId>`. It is loaded when
    `currentGameEntry$` changes.
  - `watchPause$: Atom<Record<string, boolean>>`, not persisted.
  - `watchValues$: Atom<Record<string, WatchValue>>` and `watchChanged$: Atom<string[]>`.
  - `changeNotice$: Atom<{ name: string; from: string; to: string; loc?: string; line?: number; betweenRuns?: boolean } | null>`
  - `watchActions`: `add(name)`, `remove(name)`, `togglePause(name)`.
  - `snapshotAtStop(record): boolean`. Returns whether to pause. `snapshotAfterRun(): void`.
    `resetWatchBaseline(): void`.
- **Gating (`debug.ts`):**
  - `setCurrentRecord` calls `snapshotAtStop` only while the panel is open, and pauses only while the panel is
    open.
  - `setLinkExecution` (and `shouldPauseOnLink`) pause only while the panel is open.
  - `closeDebugPanel`:
    - if paused, resumes (clears `isPaused`, calls the held resume once);
    - remembers whether debug mode was on;
    - calls `disableDebugMode()`.
  - `openDebugPanel` and `toggleDebugPanel`-open re-enable debug mode if it was on, then call `resetWatchBaseline()`
    and `snapshotAfterRun()`.
- **Baseline resets:** on `gameOpenEpoch$` changes, on save loads (where `onRestore` used to be called, i.e. the
  load paths in `save.ts` and `current-game.ts` restart), and when the panel opens.
- **After-run snapshot:** the builder picks the hook (spec, "Left to the builder"). It must run after every engine
  run while the panel is open, and never while it is closed.

- [ ] **Step 1: Failing unit tests for the pure functions.**
  - Dedupe: `$a` and `a` are separate, `A` and `a` are one.
  - Parse and serialize round-trip; garbage input gives `[]`.
  - `itemWindow(5000, 100)` returns `100`.
  - `changedNames(null, x)` returns `[]`.
  - Changed scalar, changed item and unchanged tuple, the last via `sameValue`.
  - `describeChange` formats a record.

  Run `pnpm nx test game-state` and expect FAIL.

- [ ] **Step 2: Implement the pure functions.** Expect PASS.
- [ ] **Step 3: Implement `debug-watch.ts` and the `debug.ts` gating.** Attribution rules:
  - At a stop, changes seen since the previous stop **in the same run** are attributed to the previous record's
    `loc` and `line`.
  - The first stop after `snapshotAfterRun` gives `betweenRuns: true`.
  - `snapshotAfterRun` changes are attributed to the last record of the run and never pause.
  - Pause only if a changed name has its pause toggle on.
- [ ] **Step 4: Static checks.** Run `pnpm nx run-many -t test typecheck lint -p game-state debugger` and expect
      PASS.
- [ ] **Step 5: Web E2E.** Build `player`, then run `debugger.scenario`. Scenario 4 now PASSES (gating). Scenarios
      1–3, 5 and 6 still FAIL because the UI is missing. All earlier debugger scenarios PASS.
- [ ] **Step 6: Commit** `feat(game-state): debugger watch list, snapshots and break on change`.

### Task 4: Hover values (debugger, Monaco)

**Files:**

- Create `libs/game-state/src/debug-hover-logic.ts` and its spec (pure).
- Create `libs/game-state/src/debug-hover.ts` (engine reads).
- Create `libs/debugger/src/lib/qsp-hover.ts`, registered once from `monaco-setup.ts`.

**Interfaces:**

- **Pure:**
  - `type HoverPlan = { kind: 'value'; name: string } | { kind: 'item'; name: string; key: QspVariableKey } | { kind: 'itemByVar'; name: string; indexName: string } | { kind: 'summary'; name: string } | { kind: 'none' }`
  - `hoverReadPlan(token: string, indexText: string | undefined, isKeyword: (w: string) => boolean): HoverPlan`.
    `indexText` is the raw text between the brackets after the token, if any. The plan is:
    - a number literal gives a numeric `item`
    - a quoted string, using QSP `''` escaping, gives a string `item`
    - comma-separated literals give a tuple key
    - a single plain name gives `itemByVar`
    - anything else gives `summary`
    - keywords give `none`
  - `describeHover(name: string, typed: QspVariableValue, raw: QspVariableValue, size: number): string[]`. These
    are the markdown lines:
    - unset (raw undefined and size 0) gives `NAME — not set`
    - otherwise `NAME = <formatQspValueTruncated(typed, 10)>`
    - plus `stored value is a <string|number|tuple>: <raw>` when the prefix hides it
- **Engine:** `readHover(plan: HoverPlan): { lines: string[]; pinName?: string }`. It uses only `readVariable*`.
- **Monaco:**
  - A hover provider for language `qsp`. It takes the token under the cursor via the model's tokenization
    (`variable` or non-keyword `identifier`) and the bracket text after it.
  - It returns markdown with a trusted `command:` link `Pin` that calls `watchActions.add(pinName)`.
  - It registers once: setup is module-level, as `registerQspLanguage` is.

- [ ] **Step 1: Failing unit tests** for `hoverReadPlan` and `describeHover`, covering every row of the spec's
      hover table, the keyword case, unset, the prefix mismatch case (`#U`, typed 0, raw `'42'`) and a record.
      Run `pnpm nx test game-state` and expect FAIL.
- [ ] **Step 2: Implement.** Expect PASS.
- [ ] **Step 3: Web E2E.** Build `player`, then run `debugger.scenario`. Scenarios 1 and 6 now PASS. 2 PASSES if
      the pin plus watch rendering exists, otherwise after Task 5.
- [ ] **Step 4: Static checks, then commit.** Run `pnpm nx run-many -t test typecheck lint -p game-state debugger`,
      then commit `feat(debugger): variable values on hover`.

### Task 5: Watch panel UI

**Files:**

- Create `libs/debugger/src/lib/watch-panel.tsx`.
- Modify `libs/debugger/src/lib/location-right-panel.tsx`, or `debug-panel.tsx`, to place it as a tab or section
  next to Events, following the existing style. Modify `debugger.css`.

**Interfaces:** consumes `watchList$`, `watchValues$`, `watchChanged$`, `watchPause$`, `changeNotice$` and
`watchActions` from Task 3, and renders the Task 1 `data-qa` contract:

- Each entry shows its name and its value via `formatQspValueTruncated(value, 10)`.
- Arrays (`size > 1` or keyed items) and tuples expand. Item rows show `key → value`. Record rows show
  `NAME  value`.
- There is a remove button.
- The pause toggle is disabled, with a hint, when debug mode is off.
- `changeNotice$` is shown at the top of the panel while it is set.

- [ ] **Step 1: Implement.**
- [ ] **Step 2: Web E2E.** Build `player`, then run `debugger.scenario` and `variables.scenario`. All PASS,
      including scenarios 1–7.
- [ ] **Step 3: Static checks.** Run `pnpm nx run-many -t test typecheck lint -p game-state debugger player-e2e`,
      then commit `feat(debugger): watch panel with change marks and pause on change`.
