# E2E 3b — macOS launch smoke Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On `macos-latest`, build the main desktop player and the desktop-standalone app (E2E builds), launch each with a real game, and pass only when the app reports in order **startup finished → game running → first location text** within N seconds and is still alive afterwards. No WebDriver.

**Architecture:**

- **Reporting channel (E2E builds only).**
  - **Rust:** a command `e2e_mark(marker: String, detail: String)` that prints one line to stdout, `QSPIDER_E2E_MARK <marker> <detail>`. It is compiled and registered only under `#[cfg(debug_assertions)]`. The E2E builds are `tauri build --debug`; release builds have no such command.
  - **Frontend:** `startE2eMarks()` in `libs/desktop`. `setupEnv()` calls it only when `import.meta.env.VITE_QSPIDER_E2E === 'true'`. It subscribes to the game state and invokes `e2e_mark` once per marker, in order:
    1. `startup-finished` when `startupFinished$` is true;
    2. `game-running <game id>` when `currentGameEntry$` is set;
    3. `main-text <text>` when `mainContent$`, as plain text, is non-empty.
  - Both desktop apps call `setupEnv` from `@qspider/env` → `libs/desktop`, so both report.
- **Smoke runner** `apps/player-e2e/targets/smoke/run-smoke.mjs`:
  1. Spawns the app binary directly, with stdout and stderr piped.
  2. Waits for the three markers in order, each with an exact expected value.
  3. Then watches a fixed liveness window and requires the process to still be alive.
  4. Ends the process it spawned, by PID (never by name).
  - It prints the markers received and the app's output tail on failure.
  - On Linux it runs the app inside the same private session as the desktop E2E (Xvfb, its own D-Bus, stripped env, private `XDG_*` dirs), so it can be developed locally. It never runs in the real session.
- **Inputs:**
  - main player: `src-tauri/target/debug/qspider`, launched with `E2E_GAME.path` as its first positional argument, the same way `tauri-driver` passes the test pack (the `filePath` arg of the Tauri CLI plugin, read by `getLaunchFilePath`). A single `.qsps` file starts the game (core-flow "opening a game file"). Expected main text: `E2E_GAME.text.start`.
  - standalone: `src-tauri/target/e2e-standalone/debug/qspider`, no arguments. Expected main text: `STANDALONE_GAME.text.start`.
- **CI:**
  - A reusable workflow `.github/workflows/smoke-macos.yml` (`on: workflow_call`, plus `workflow_dispatch`).
  - Called from `checks.yml` as job `smoke-macos`. On PRs it is gated by the `changes` job's new `desktop` output; it always runs on `main`.
  - Called from `scheduled-desktop-build.yml` weekly.

**Tech Stack:** Tauri 2 (Rust command, `#[cfg(debug_assertions)]`), TypeScript (xoid atoms, `@tauri-apps/api` invoke), Node script runner, NX `nx:run-commands`, GitHub Actions reusable workflows.

**Spec:** `docs/superpowers/specs/2026-10-24-e2e-phase3-design.md`, section "PR 2: macOS launch smoke".

## Global Constraints

- Branch `feat/e2e-3b-macos-smoke` in the main checkout, no worktree. NX/pnpm for task runs.
- Nothing test-only in release builds:
  - the Rust command exists only under `debug_assertions`;
  - the frontend reporter runs only when `VITE_QSPIDER_E2E === 'true'`.
- No new production dependency.
- Linux local runs only in the private session; never touch the real session; never kill processes by name. Stopping our own spawned child by PID is fine. Desktop app runs one at a time.
- Local checks per CLAUDE.md:
  - format, lint and typecheck;
  - the touched unit tests;
  - the smoke on Linux;
  - the existing desktop specs that the `setupEnv` change could affect: `core-flow`, plus one standalone desktop run.
- **No `check:full`.** CI on the PR is the gate. macOS can only be exercised in CI.
- Trigger: on PRs only when desktop-relevant paths change:
  - `src-tauri/**`, `libs/desktop/**`, `libs/tauri-storage/**`, `apps/player-desktop/**`, `apps/player-standalone/**`;
  - `package.json`, `pnpm-lock.yaml`;
  - `.github/workflows/smoke-macos.yml`, `.github/workflows/checks.yml`.
- On PRs whose paths don't match, the job is skipped, and a skip counts as passing. It always runs on `main` and weekly.
- Defects follow the usual rule: a red test first, then a `fix(...)` commit. Ask the maintainer first if the fix is player-visible.
- SDD ledger: `.superpowers/sdd/2026-10-24-e2e-3b-macos-smoke/`.

## Review Focus

1. **A marker that fires too early.** `main-text` must carry the real start text, compared exactly after trimming, not "any non-empty". The classic theme's empty or loading content must not count. (Task 1 unit test; Task 2 checks the exact value.)
2. **Out-of-order or duplicate markers.** The runner requires the order `startup-finished`, `game-running`, `main-text` and ignores repeats. If `startup-finished` arrives after `main-text`, the run fails. (Task 1, Task 2)
3. **A crash right after the first screen.** The liveness window after the last marker must detect an app that exits. Discriminate by having the app exit right after the markers. (Task 2)
4. **A release build carrying the channel.** `cargo build --release` (or clippy in release) must have no `e2e_mark` symbol or registration. Check with `pnpm check:rust` plus a release `cargo check`, and grep the handler list under `cfg`. (Task 1)
5. **A path filter that misses relevant changes.** The `changes` job's `desktop` output must be true for each listed path and false for a docs-only change. Check the regex against sample path lists in the job's shell, run locally with bash. (Task 3)

---

### Task 1: E2E marker channel (Rust command + frontend reporter)

**Files:**

- Modify: `src-tauri/src/main.rs` (add the `e2e_mark` command, registered only under `#[cfg(debug_assertions)]`)
- Create: `libs/desktop/src/lib/e2e-marks.ts`, `libs/desktop/src/lib/e2e-marks.spec.ts`
- Modify: `libs/desktop/src/lib/setup.ts` (call `startE2eMarks()` when `VITE_QSPIDER_E2E === 'true'`)

**Interfaces:**

- Produces:
  - stdout lines `QSPIDER_E2E_MARK startup-finished`, `QSPIDER_E2E_MARK game-running <id>`, `QSPIDER_E2E_MARK main-text <single-line text>`. The text has newlines collapsed to spaces and is trimmed.
  - `startE2eMarks(mark?: (marker: string, detail: string) => Promise<void>): () => void` returns an unsubscribe function. `mark` defaults to `invoke('e2e_mark', { marker, detail })`. The parameter exists so the spec can pass a recorder.
  - The plain text of `mainContent$` comes from parsing its HTML with `DOMParser` and reading `textContent`.

- [ ] **Step 1: Write the failing spec `e2e-marks.spec.ts`.** Use the existing desktop lib test setup. Tests:
  - `emits startup-finished, game-running and main-text once each, in order`: set `startupFinished$`, `currentGameEntry$` (id `g1`) and `mainContent$` (`'<p>E2E START</p>'`), in a different order and repeatedly. Expect the recorder calls to be exactly `[['startup-finished',''],['game-running','g1'],['main-text','E2E START']]`.
  - `does not emit main-text for empty or whitespace-only content`.
  - `does not emit game-running before startup-finished`: game state set first, startup later. Expect the order still holds.
- [ ] **Step 2:** Run `pnpm nx test desktop`. Expected: FAIL (module missing).
- [ ] **Step 3:** Implement `startE2eMarks` and the `setupEnv` call, then the Rust command. In `main.rs`, build `invoke_handler` from a list that includes `e2e_mark` only under `#[cfg(debug_assertions)]`. `println!` plus a stdout flush.
- [ ] **Step 4:** Run `pnpm nx test desktop` and `pnpm check:rust`, then `cargo check --release` in `src-tauri` (needs `dist/apps/player-desktop` to exist, like the CI `rust` job). Expected: all PASS. The release check compiles without `e2e_mark`.
- [ ] **Step 5: Commit** `test(desktop): E2E-build marker channel (startup, game running, main text)`.

### Task 2: Smoke runner + NX targets, proven on Linux

**Files:**

- Create: `apps/player-e2e/targets/smoke/run-smoke.mjs`
- Create, only if sharing is cleaner: `apps/player-e2e/targets/desktop/private-env.mjs`. Extract the env stripping and Xvfb/D-Bus wrapping from `run-desktop-e2e.mjs` so both runners use one list. `run-desktop-e2e.mjs` must behave exactly as before.
- Modify: `apps/player-e2e/project.json` (targets `smoke-desktop`, which depends on `build-desktop-e2e`, and `smoke-desktop-standalone`, which depends on `build-desktop-standalone-e2e`)
- Modify: `package.json` (`smoke:desktop`, which runs both targets)

**Interfaces:**

- Consumes: the markers from Task 1, `E2E_GAME` (`fixtures/e2e-game.ts`) and `STANDALONE_GAME` (`fixtures/standalone-game.ts`).
- Produces: `node apps/player-e2e/targets/smoke/run-smoke.mjs --app <binary> [--file <game>] --expect-text <text> [--timeout-ms N] [--alive-ms M]`.
  - Exit 0 on pass.
  - Exit 1 with the reason (`timeout waiting for <marker>`, `markers out of order: …`, `app exited (code …) during the liveness window`, `main-text was "<got>", expected "<want>"`), the markers received, and the last 50 output lines.
  - Defaults: `--timeout-ms 60000`, `--alive-ms 5000`. The builder may raise the timeout once CI times are known; record the value used.
  - The liveness window is an observation period after the last marker, not a synchronisation sleep. Say so in a comment.

- [ ] **Step 1:** Implement the runner and the targets. On Linux the runner refuses to start unless it is inside its own private session: it re-executes itself under the wrapper, using the same sentinel approach as `run-desktop-e2e.mjs`. It also gives the app private `XDG_*` dirs in a temp dir, removed afterwards.
- [ ] **Step 2: Run both smokes on Linux.**
      Run: `PATH="$HOME/.cargo/bin:$PATH" pnpm smoke:desktop`
      Expected: both PASS, with the three markers printed and the expected texts `E2E START` and `STANDALONE START`.
- [ ] **Step 3: Discriminate (Review Focus 1–3).** Make three temporary changes, reverting and rebuilding after each, and watch each FAIL with its specific reason:
  1. a wrong `--expect-text`;
  2. the frontend reporter emitting `main-text` before `startup-finished`;
  3. the app exiting 1s after `main-text`.
- [ ] **Step 4:** Run `PATH="$HOME/.cargo/bin:$PATH" node apps/player-e2e/targets/desktop/run-desktop-e2e.mjs --spec apps/player-e2e/scenarios/core-flow.scenario.ts` and the standalone desktop suite. Expected: PASS, so the `setupEnv` change and any refactor of `run-desktop-e2e.mjs` broke nothing.
- [ ] **Step 5: Commit** `test(e2e): desktop launch smoke runner (main player and standalone)`.

### Task 3: CI — reusable macOS smoke workflow, triggers, docs

**Files:**

- Create: `.github/workflows/smoke-macos.yml`
  - `on: workflow_call` + `workflow_dispatch`;
  - one job `smoke` on `macos-latest`, `timeout-minutes: 45`;
  - setup: checkout, pnpm 10.17.0, Node 24, `pnpm install --frozen-lockfile`, rust stable, rust-cache (`src-tauri`);
  - runs `pnpm smoke:desktop`;
  - uploads the runner logs on failure.
- Modify: `.github/workflows/checks.yml`:
  - the `changes` job gains a `desktop` output, computed from the path list in Global Constraints; on non-PR events it is always true;
  - a new job `smoke-macos` with `needs: changes`, `if: needs.changes.outputs.desktop == 'true'` and `uses: ./.github/workflows/smoke-macos.yml`.
- Modify: `.github/workflows/scheduled-desktop-build.yml` (add a job that calls `smoke-macos.yml`)
- Modify: `apps/player-e2e/README.md`:
  - a "Launch smoke" section: the channel, the runner, flags, Linux private session, discrimination notes;
  - the CI list: `smoke-macos` runs on desktop-relevant PRs, on `main` and weekly; it is not yet required; ask the maintainer.
- Modify: `CLAUDE.md` (`pnpm smoke:desktop` under "Testing and Quality")
- Modify: `docs/superpowers/specs/2026-10-21-e2e-engine-inventory.md` (any defects found)

- [ ] **Step 1:** Implement the workflow and triggers.
- [ ] **Step 2: Review Focus 5.** Run the `changes` regex locally in bash against sample path lists:
  - `src-tauri/src/main.rs` → true;
  - `libs/desktop/x.ts` → true;
  - `apps/player-standalone/src/app/init.ts` → true;
  - `pnpm-lock.yaml` → true;
  - `docs/x.md` → false;
  - `apps/player/src/x.tsx` → false.
    Record the output.
- [ ] **Step 3:** Run `pnpm nx format:check --all` and lint, and parse each workflow YAML with node.
- [ ] **Step 4: Commit** `ci(e2e): macOS launch smoke on desktop-relevant PRs, main and weekly`.

### Task 4: PR and CI rounds

- [ ] **Step 1:** Run the whole-branch review (most capable model) and apply its fixes.
- [ ] **Step 2:** Push and open the PR. This PR changes `src-tauri/**` and the workflows, so `smoke-macos` runs on it. Watch CI.
- [ ] **Step 3:** If `smoke-macos` fails, read the job log and root-cause it. A macOS-specific defect follows the defects rule. Fix it, push, wait for green. Post a one-line status per CI round.
- [ ] **Step 4:** Report the real per-job results. Ask the maintainer before adding `smoke-macos` to the ruleset. Delete the ledger after copying its rulings into the summary.
