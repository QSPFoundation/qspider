# Desktop Debugger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The F12 debugger runs in the desktop player, its editor is bundled into the app and loaded on first
use (offline-capable everywhere), and the debugger has E2E coverage.

**Architecture:**

- E2E comes first: a new `debugger` fixture game and a `debugger` screenplay area, with seven scenarios.
- The desktop app root gets wrapped in `<Debugger>`.
- `libs/debugger` imports `monaco-editor` itself and configures `@monaco-editor/react`'s loader with it. The
  import sits inside the panel's existing lazy chunk.

**Tech Stack:** React 19, Vite, `@monaco-editor/react` 4.7, `monaco-editor` 0.55, Tauri 2, Serenity/JS (Playwright
web, WebdriverIO desktop).

**Spec:** `docs/superpowers/specs/2026-11-13-desktop-debugger-design.md`

## Global Constraints

- Every player that has the debugger bundles the editor and loads it on first use. Nothing comes from a CDN.
  The standalone players (`apps/player-standalone`, web and desktop) do **not** get the debugger.
- Chunk sizes: a one-time manual check of the build output, with the entry chunk sizes before and after recorded
  in the PR. **No automated test or CI check for sizes.**
- Only the base editor worker is bundled. No TS/JSON/CSS/HTML workers.
- E2E follows the Rules in `apps/player-e2e/README.md`:
  - area `debugger` → `screenplay/debugger/{elements,tasks,checks}.ts`
  - scenarios in `scenarios/debugger.scenario.ts`
  - locate by role, `data-qsp` or `data-qa`; use `seeEventually`
  - target differences go through `OperatePlayer`; page probes only in `screenplay/support/`
- Engine behaviour is proved by E2E. Unit tests are for pure functions only, with no mocks.
- No local desktop E2E (house rule). Desktop scenarios are proved on CI, including the Windows desktop job.
- Use nx for tasks.
- Web single spec: `pnpm nx build player`, then
  `CHROME_BIN=/usr/bin/chromium pnpm exec playwright test -c apps/player-e2e/targets/web/playwright.config.ts debugger.scenario`,
  then `fuser -k 4300/tcp`. Delete `apps/player-e2e/artifacts/web-report` after a failed run.
- F12 must open the debugger panel on every desktop CI platform. A conflict with WebView devtools gets root-caused.
  Switching to another key needs the maintainer's agreement.
- Commit messages follow conventional commits.

## Review Focus

1. **The first F12 offline (web).** The lazy chunk must come from the player's own origin, with no CDN loader
   script. Pinned by scenario 7 in Task 1 (web blocks `cdn.jsdelivr.net`).
2. **F12 while a game dialog or the pause screen is open.** It must not break the game. Not in the agreed scope.
   The reviewer checks that F12 handling isn't changed beyond wiring.
3. **The debugger after a game stops and a new one starts.** `Debugger` closes the panel when there is no current
   game (existing code). Wiring must keep that behaviour on desktop. The reviewer checks Task 2.
4. **Editor workers in a Tauri webview.** A worker loaded from the app's custom protocol must start, otherwise the
   editor falls back to the main thread or breaks. Pinned on CI by scenario 2 on desktop.
5. **Dock position persistence across a restart on desktop.** localStorage in Tauri. Pinned by scenario 6.

---

### Task 1: Debugger E2E (fixture, area, scenarios)

**Files:**

- Create: `apps/player-e2e/fixtures/debugger/debugger.qsps`, `apps/player-e2e/fixtures/debugger-game.ts`
- Modify: `apps/player-e2e/fixtures/archives.ts` (and `build-fixtures.ts` if packing needs it), following how
  `game-html` / `openqst` are packed.
- Create: `apps/player-e2e/screenplay/debugger/elements.ts`, `tasks.ts`, `checks.ts`
- Create: `apps/player-e2e/scenarios/debugger.scenario.ts`
- Modify: `libs/debugger/src/lib/*.tsx`, adding `data-qa` marks only where no role or accessible name fits. No
  behaviour change.
- Modify: `apps/player-e2e/README.md`, with a fixture inventory line for `debugger/`.
- Possibly: a new `OperatePlayer` method `blockOrigin(actor, origin)` (web: context route abort; desktop: not
  needed, since scenario 7's blocking half is `webOnly`). Also possibly a probe file
  `screenplay/support/script-sources.ts` returning the `src` of every `<script>` in the page.

**Interfaces:**

- Produces `DEBUGGER_GAME` with `path`, `title`, the location names, action labels, link text, and the strings
  each location writes.
- The fixture has:
  - location `start`: writes `DEBUG START`, has action `go` → `gt 'second'`, and a link
    `<a href="exec:gt 'second'">to second</a>`
  - location `second`: writes `DEBUG SECOND`

- [ ] **Step 1: Fixture.** Write the fixture and its constants, and pack it like the other archives.
- [ ] **Step 2: Area.** Add elements for:
  - the panel, its close button and the dock buttons
  - a location list item by name, and a location's breakpoint button
  - the editor's text (read the Monaco view lines' text)
  - the code-type tabs
  - the debug enable toggle, the status (Paused/Running), and the Resume and Step buttons
  - the pause-on-links toggle
  - the events count and its clear button

  Add tasks `OpenDebugger()` (PressKey F12, then wait until the panel is present) and `CloseDebugger()`, plus checks.

- [ ] **Step 3: Scenarios** (titles verbatim) in `debugger.scenario.ts`:
  1. `'F12 opens the debugger and the close button and F12 close it'`
  2. `'selecting a location shows its code and its action code'`: the editor shows `*pl 'DEBUG SECOND'` for
     `second`, and the action tab for `start` shows `gt 'second'`.
  3. `'a location breakpoint pauses the game and resume continues it'`:
     - enable debug, set a breakpoint on `second`, click `go`
     - see the status Paused, then step and see the step advance (the status stays Paused, or the current line
       changes)
     - resume, then see `DEBUG SECOND` in the main text
  4. `'an action shows up in the event log and clear empties it'`: the count is above 0 after `go`, and is 0 after
     clear.
  5. `'with pause on links on, a link pauses before its code runs'`: the main text still shows `DEBUG START` while
     Paused, and shows `DEBUG SECOND` after resume.
  6. `'the dock position survives a player restart'`: dock left → `RestartPlayer()` → reopen the game → F12 → the
     panel is docked left (`debugger-left` class on the layout or an equivalent `data-qa` state).
  7. `'the editor loads from the player itself'`: open the debugger and select `start`. The code shows, and no
     `<script>` `src` contains `cdn.jsdelivr.net`. Also add a `webOnly` variant `'with the CDN unreachable the
editor still shows code'`, which blocks `https://cdn.jsdelivr.net` before starting the player.
- [ ] **Step 4: Run on web against the unchanged product code.** Expected: 1–6 PASS, and 7 and its web variant
      FAIL (the editor comes from the CDN). Record the failure messages in the report. If any of 1–6 fails, find out
      whether it's a product bug: report it and don't weaken the scenario.
- [ ] **Step 5: Lint and typecheck player-e2e**, then commit `test(player-e2e): debugger scenarios`.

### Task 2: The desktop player gets the debugger

**Files:**

- Modify: `apps/player-desktop/src/app/app.tsx`. Wrap the existing root content in `<Debugger>` exactly as
  `apps/player/src/app/app.tsx` does.
- Modify: `apps/player-desktop` package or tsconfig deps if the `@qspider/debugger` path needs adding.

- [ ] **Step 1: Wire it.** Then run `pnpm nx typecheck player-desktop` (PASS), `pnpm nx lint player-desktop`
      (PASS) and `pnpm nx build player-desktop` (PASS).
- [ ] **Step 2: Check the F12 handling.** Read `src-tauri` (features, window config) and record in the report
      whether anything on Linux or Windows maps F12 to the webview devtools in release builds. Don't change it in
      this task unless you find a concrete conflict. If you find one, report DONE_WITH_CONCERNS with the evidence.
- [ ] **Step 3: Commit** `feat(desktop): F12 debugger in the desktop player`.

### Task 3: Bundle the editor into the debugger's lazy chunk

**Files:**

- Create: `libs/debugger/src/lib/monaco-setup.ts`. It imports `* as monaco from 'monaco-editor'` and
  `EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'`, sets
  `self.MonacoEnvironment = { getWorker: () => new EditorWorker() }`, and calls `loader.config({ monaco })` (from
  `@monaco-editor/react`).
- Modify: `libs/debugger/src/lib/monaco-code-viewer.tsx`. Import `./monaco-setup` for its side effect. Keep
  `registerQspLanguage` working; `window.monaco` may no longer be set, so use the bundled `monaco` instance or the
  `onMount`/`beforeMount` monaco argument.
- Modify: `apps/player/vite.config.mts` and `apps/player-desktop/vite.config.mts` only if worker or ESM handling
  needs it.

- [ ] **Step 1: Implement.** Check that nothing outside the lazy `debug-panel` import graph imports
      `monaco-setup` or `monaco-editor`.
- [ ] **Step 2: Unit and static checks.** Run `pnpm nx test debugger` (if the target exists), then
      `pnpm nx run-many -t typecheck lint -p debugger player player-desktop`. All PASS.
- [ ] **Step 3: One-time size check by hand.** Build `player` and `player-desktop` on the Task 2 commit and on
      this one. In the report, record the entry chunk (`index-*.js`) sizes before and after, and the names and
      sizes of the new lazy chunks and worker. The entry chunk must not grow by more than a few KB. Don't add a
      script or test for this.
- [ ] **Step 4: Web E2E.** Run `pnpm nx build player`, then `debugger.scenario`. All PASS, including 7 and its web
      variant. Also run `core-flow` and `look-vars` as a startup check. PASS.
- [ ] **Step 5: Commit** `feat(debugger): bundle the code editor, loaded with the panel`.
