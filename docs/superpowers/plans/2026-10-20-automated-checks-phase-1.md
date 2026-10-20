# Automated Checks — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A green "check frame" (format, lint, typecheck, builds, Rust) plus a core-flow end-to-end test (open from file → play → save → load → back to shelf) on web and desktop, runnable locally with one command and in CI on every PR.

**Architecture:** Typecheck targets and cleanup make the existing tooling green and runnable via `pnpm check`. A new NX project `apps/player-e2e` holds a deterministic QSP test game, one WebdriverIO scenario, and two WDIO configs (web: Chrome against `vite preview` of `player`; desktop: `tauri-driver` against a debug build of `player-desktop` launched with the game as CLI argument). A new `checks.yml` workflow runs it all; desktop E2E is non-blocking until the Tauri 2 fix lands.

**Tech Stack:** NX 23, pnpm 10.17, Vite 8, TypeScript 6, WebdriverIO 9 (mocha framework, spec reporter), tauri-driver, WebKitWebDriver, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-20-automated-checks-design.md` (Phase 1 only)

## Global Constraints

- Agents run checks locally on the maintainer's Linux machine; no container/cloud-sandbox support.
- `pnpm check:full` is what an agent must pass before declaring work done.
- A missing desktop prerequisite makes the command fail with a message naming it — never a silent skip reported as success.
- Nothing test-only in release builds.
- All checks block merging except desktop E2E, which is reported but non-blocking (job name contains `non-blocking until Tauri 2 fix`) until it passes on `main`.
- E2E assertions are about what the player sees (text, shelf entries, restored state), not internals.
- No blind retries of flaky tests (WDIO `specFileRetries: 0`, mocha `retries: 0`).
- Node 24, pnpm 10.17.0 in CI (match existing workflows).

## Review Focus

1. **Missing desktop prerequisite** (no `tauri-driver` or `WebKitWebDriver` on PATH) → `pnpm e2e:desktop` exits non-zero naming the missing tool. Pinned in Task 4.
2. **Leftover state from a previous run** (shelf already has the game, saves already exist) → each run starts empty. Pinned in Task 3/4 by asserting the shelf is empty at start and slot 1 is empty before saving.
3. **Load that doesn't actually restore** (load is a no-op, state just happens to match) → state changes between save and load so restore is observable. Pinned in the Task 3 scenario (save at counter=1, increment to 2, load → 1).
4. **Game fails to open and shows an error alert instead of the game** → test fails fast with the error text, not a 60s timeout. Pinned in Task 3 scenario helper.
5. **E2E hook leaking into a release build** → production bundle of `player-desktop` contains no `QSPIDER_E2E` string. Pinned in Task 4.

---

### Task 1: Make the frame green — format, typecheck, `pnpm check` (no E2E yet)

**Files:**
- Modify: `.prettierignore`, `nx.json` (`defaultBase`), `package.json` (scripts, lint-staged)
- Modify: `libs/desktop/tsconfig.lib.json`, `libs/game-shelf/tsconfig.lib.json`, `libs/renderer/tsconfig.lib.json`
- Modify: every `apps/*/project.json` and `libs/*/project.json` (add `typecheck` target)
- Reformat: files listed by `pnpm format:check` (currently `libs/debugger/src/lib/*`, `libs/game-shelf/src/{qsp-catalog.ts,components/qsp-catalog-game-card.tsx}`, `docs/superpowers/**`)

**Interfaces:**
- Produces: NX target `typecheck` on all 17 projects; pnpm scripts `typecheck`, `check:rust`, `check` (used by Tasks 5–6).

- [ ] **Step 1: Confirm current failures**

Run: `pnpm format:check; pnpm nx run-many -t typecheck`
Expected: format check lists ~15 files; typecheck reports no projects have the target. (Also note: NX currently diffs against `master`, which doesn't exist.)

- [ ] **Step 2: Fix base branch and ignores**

- `nx.json`: `"defaultBase": "main"`.
- `.prettierignore`: add `pnpm-lock.yaml`, `CHANGELOG.md`, `/src-tauri/gen`, `/.claude`.

- [ ] **Step 3: Reformat remaining files**

Run: `pnpm format:write` then `pnpm format:check`
Expected: format check exits 0. Review the diff: whitespace/formatting only.

- [ ] **Step 4: Add `typecheck` targets**

In each project.json add:
```json
"typecheck": {
  "executor": "nx:run-commands",
  "options": { "cwd": "{projectRoot}", "command": "tsc -p tsconfig.lib.json --noEmit" }
}
```
using `tsconfig.app.json` for apps. `libs/utils` additionally checks `tsconfig.spec.json` (`commands` with both). In `nx.json` `targetDefaults` add `"typecheck": { "cache": true, "inputs": ["default", "^default"] }`.

- [ ] **Step 5: Run typecheck to see it fail**

Run: `pnpm nx run-many -t typecheck`
Expected: FAIL in `desktop`, `game-shelf`, `renderer` with `TS2307: Cannot find module './modules/qspider.qsps?raw'`.

- [ ] **Step 6: Fix the three tsconfigs**

Add `"vite/client"` to `compilerOptions.types` in `libs/desktop`, `libs/game-shelf`, `libs/renderer` `tsconfig.lib.json` (they compile `libs/game-state` sources via path mapping, which use `?raw` imports).

Run: `pnpm nx run-many -t typecheck --skip-nx-cache`
Expected: all 17 succeed.

- [ ] **Step 7: Add scripts and lint-staged**

`package.json` scripts:
- `"typecheck": "nx run-many -t typecheck"`
- `"check:rust": "cd src-tauri && cargo fmt --check && cargo clippy --all-targets -- -D warnings && cargo test"`
- `"check": "pnpm format:check && nx run-many -t lint typecheck build && pnpm check:rust"` (Task 3 appends `&& pnpm e2e:web`)

lint-staged: `"*.{ts,tsx}": "eslint"`, `"*.{ts,tsx,js,mjs,json,md,css,yml}": "prettier --write"`.

- [ ] **Step 8: Verify**

Run: `pnpm check`
Expected: exit 0. (Rust: clippy and fmt already pass; 8 tests pass.)

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: green check frame with typecheck targets and pnpm check"
```
(Format-only changes may go in a separate preceding commit `style: apply prettier`.)

---

### Task 2: Deterministic E2E test game

**Files:**
- Create: `apps/player-e2e/fixtures/e2e-game.qsps`
- Create: `apps/player-e2e/project.json`, `apps/player-e2e/tsconfig.json`, `apps/player-e2e/eslint.config.js` (copy pattern from `libs/desktop`)

**Interfaces:**
- Produces: fixture path `apps/player-e2e/fixtures/e2e-game.qsps`; visible strings `E2E START`, `ROOM counter=<n>`; actions named `Go to room`, `Increment`, `Save`, `Load`. Shelf title of the game: `e2e-game.qsps` (web `file-importer` uses the file name; desktop to be confirmed in Task 4).

- [ ] **Step 1: Write the game**

```
# start
*pl 'E2E START'
counter = 0
act 'Go to room': gt 'room'
---

# room
*pl 'ROOM counter=<<counter>>'
act 'Increment': counter += 1 & gt 'room'
act 'Save': savegame
act 'Load': opengame
---
```
`savegame`/`opengame` without arguments open the in-app save/load slots panel (`requestedAction$` → `pause:saves`, see `libs/game-state/src/qsp-api.ts:276-300`); slots render as `[data-qsp-save-index="<n>"]` with `data-save-empty` when empty (`libs/renderer/src/theme-core/pause-screen/slots.tsx`).

- [ ] **Step 2: Verify manually once in the web player**

Run: `pnpm start`, open `e2e-game.qsps` via "Open game", click through Go to room → Increment → Save (slot 1) → Increment → Load (slot 1).
Expected: shows `ROOM counter=1` after load. If `.qsps` syntax needs adjustment, fix the fixture, not the expectations.

- [ ] **Step 3: Commit**

```bash
git add apps/player-e2e
git commit -m "test(e2e): add deterministic e2e test game and project"
```

---

### Task 3: Core-flow scenario on web (WebdriverIO)

**Files:**
- Create: `apps/player-e2e/src/core-flow.e2e.ts` (the scenario, shared by both targets)
- Create: `apps/player-e2e/src/player.ts` (page helpers)
- Create: `apps/player-e2e/src/target.ts` (per-target hooks interface)
- Create: `apps/player-e2e/wdio.web.conf.ts`
- Modify: `apps/player-e2e/project.json` (target `e2e-web`), root `package.json` (devDeps, `e2e:web` script, append to `check`)
- Possibly modify: `libs/renderer/src/theme-core/pause-screen/*.tsx` (add `data-testid` only where a control has no accessible name/text)

**Interfaces:**
- Consumes: fixture and strings from Task 2.
- Produces (`target.ts`):
  ```ts
  export interface E2ETarget {
    name: 'web' | 'desktop';
    /** Open the fixture game so it starts running. */
    openGame(fixturePath: string): Promise<void>;
  }
  export function currentTarget(): E2ETarget; // chosen by env E2E_TARGET
  ```
- Produces (`player.ts`): `clickAction(label: string): Promise<void>`, `expectMainText(text: string): Promise<void>`, `chooseSaveSlot(index: number): Promise<void>`, `expectSlotEmpty(index: number): Promise<void>`, `returnToShelf(): Promise<void>`, `shelfGameTitles(): Promise<string[]>`, `openFromShelf(title: string): Promise<void>`, `failOnErrorAlert(): Promise<void>` (throws with the alert text if the error alert from `libs/game-shelf/src/components/error-alert.tsx` is visible).

- [ ] **Step 1: Install WDIO**

Add devDeps: `@wdio/cli@^9`, `@wdio/local-runner@^9`, `@wdio/mocha-framework@^9`, `@wdio/spec-reporter@^9`, `@wdio/globals@^9`, `expect-webdriverio@^5`.

- [ ] **Step 2: Write the scenario (fails: no config/helpers yet)**

```ts
describe('core flow', () => {
  it('opens a game from file, plays, saves, loads and returns to shelf', async () => {
    expect(await shelfGameTitles()).toEqual([]);           // clean state
    await currentTarget().openGame(FIXTURE);
    await failOnErrorAlert();
    await expectMainText('E2E START');
    await clickAction('Go to room');
    await expectMainText('ROOM counter=0');
    await clickAction('Increment');
    await expectMainText('ROOM counter=1');
    await clickAction('Save');
    await expectSlotEmpty(1);                               // no leftover saves
    await chooseSaveSlot(1);
    await clickAction('Increment');
    await expectMainText('ROOM counter=2');
    await clickAction('Load');
    await chooseSaveSlot(1);
    await expectMainText('ROOM counter=1');                 // restore is observable
    await returnToShelf();
    expect(await shelfGameTitles()).toContain('e2e-game.qsps');
    await openFromShelf('e2e-game.qsps');
    await expectMainText('E2E START');
  });
});
```
`expectMainText` waits up to 15s; on timeout it calls `failOnErrorAlert()` first so an import error surfaces as the failure message.

- [ ] **Step 3: Implement `wdio.web.conf.ts` and the web target**

- `onPrepare`: build is assumed done (`nx build player` is a `dependsOn` of `e2e-web`); spawn `pnpm nx run player:preview` and wait for its port; `onComplete` kills it.
- Capabilities: `browserName: 'chrome'`, headless unless `E2E_HEADED=1`; if `CHROME_BIN` is set use it as `goog:chromeOptions.binary` (lets the maintainer use system Chromium). Fresh profile per session (WDIO default).
- `mochaOpts: { timeout: 120000, retries: 0 }`, `specFileRetries: 0`, `afterTest`: on failure save screenshot + browser logs to `apps/player-e2e/artifacts/`.
- Web `openGame`: `$('#openGame').setValue(absolutePath)` (the hidden `<input type="file">` in `apps/player/src/app/open-game-button.tsx`).
- `returnToShelf`: via the pause screen's exit control (Escape opens it, `libs/renderer/src/game-runner.tsx:45`). Locate by visible text; add `data-testid="pause-exit"` only if it has none.

- [ ] **Step 4: Run and iterate until pass**

Run: `pnpm e2e:web` (`"e2e:web": "E2E_TARGET=web wdio run apps/player-e2e/wdio.web.conf.ts"`, NX target `e2e-web` with `dependsOn: ["player:build"]`)
Expected: 1 passing. Then break it on purpose (temporarily change expected `counter=1` after load to `counter=2`) and confirm it FAILS with a readable message; revert.

- [ ] **Step 5: Wire into `pnpm check`**

Append `&& pnpm e2e:web` to `check`. Add `apps/player-e2e/artifacts/` to `.gitignore`.

- [ ] **Step 6: Commit**

```bash
git commit -am "test(e2e): core flow scenario on web player"
```

---

### Task 4: Desktop target — updater gate, prerequisites, tauri-driver

**Files:**
- Modify: `libs/desktop/src/lib/updater.ts` (gate)
- Create: `apps/player-e2e/src/desktop-prereqs.ts`, `apps/player-e2e/src/desktop-prereqs.spec.ts`
- Create: `apps/player-e2e/wdio.desktop.conf.ts`
- Modify: `apps/player-e2e/project.json` (targets `build-desktop-e2e`, `e2e-desktop`), root `package.json` (`e2e:desktop`, `check:full`)

**Interfaces:**
- Consumes: scenario + `E2ETarget` from Task 3.
- Produces: `findMissingPrereqs(platform: NodeJS.Platform, which: (cmd: string) => string | null): string[]` — returns names from `['tauri-driver', 'WebKitWebDriver']` (Linux) / `['tauri-driver', 'msedgedriver']` (win32) that `which` can't find.

- [ ] **Step 1: Failing tests for prereq check**

```ts
it('names every missing tool on linux', () => {
  expect(findMissingPrereqs('linux', () => null)).toEqual(['tauri-driver', 'WebKitWebDriver']);
});
it('returns empty when all present', () => {
  expect(findMissingPrereqs('linux', (c) => `/usr/bin/${c}`)).toEqual([]);
});
```
Run: `npx vitest run apps/player-e2e` → FAIL (not defined). (Add `apps/player-e2e/vite.config.mts` with a `test` block and list it in root `vitest.config.mjs` projects.)

- [ ] **Step 2: Implement, run → PASS**

- [ ] **Step 3: Gate the updater**

In `checkForUpdates()`: return immediately when `import.meta.env.VITE_QSPIDER_E2E === 'true'`. Vite replaces it at build time, so release builds (which never set it) keep the check and the branch is dead-code-eliminated.

Verify no leak: `pnpm build:desktop && ! grep -r "QSPIDER_E2E" dist/apps/player-desktop` → exit 0.

- [ ] **Step 4: Desktop build target**

`build-desktop-e2e`: `VITE_QSPIDER_E2E=true pnpm tauri build --debug --no-bundle`. Binary: `src-tauri/target/debug/qspider` (`.exe` on Windows; confirm name from `Cargo.toml`).

- [ ] **Step 5: `wdio.desktop.conf.ts`**

- `onPrepare`: call `findMissingPrereqs(process.platform, which)`; if non-empty, throw `Missing desktop E2E prerequisites: <names>. Install: cargo install tauri-driver --locked; Arch: webkit2gtk-4.1 provides WebKitWebDriver; Debian/Ubuntu: webkit2gtk-driver`. Create temp dirs and set `XDG_DATA_HOME`, `XDG_CONFIG_HOME`, `XDG_CACHE_HOME` to them for the spawned `tauri-driver` (isolation). Spawn `tauri-driver`; `onComplete` kills it and removes temp dirs.
- Capabilities: `'tauri:options': { application: <binary>, args: [<absolute fixture path>] }`, `hostname: '127.0.0.1'`, `port: 4444`. If tauri-driver does not pass `args` to the app, stop and raise it with the maintainer. Do not work around it with a test-only env var or a faked drag-drop event, because the spec forbids test-only hooks in the app.
- Same mocha/retry/artifact settings as web.
- Desktop `openGame`: no-op (the game was passed as CLI argument; `apps/player-desktop/src/app/init.ts` imports it and starts it). The scenario's initial "shelf empty" check therefore runs on the web target only (guard with `currentTarget().name === 'web'`); on desktop assert instead that the shelf contains exactly one entry after `returnToShelf()`.
- Confirm the desktop shelf title for the fixture; if it differs from `e2e-game.qsps`, expose it as `E2ETarget.expectedShelfTitle` rather than changing the web expectation.

- [ ] **Step 6: Scripts**

`"e2e:desktop": "nx run player-e2e:build-desktop-e2e && E2E_TARGET=desktop wdio run apps/player-e2e/wdio.desktop.conf.ts"`, `"check:full": "pnpm check && pnpm e2e:desktop"`.

- [ ] **Step 7: Run**

Run without tauri-driver installed: `pnpm e2e:desktop` → non-zero exit, message names `tauri-driver`.
Install (`cargo install tauri-driver --locked`), run again.
Expected: either PASS, or a failure that reflects real Tauri 2 breakage. Record which in the commit message / PR description. Do **not** fix migration bugs here (separate work per spec).

- [ ] **Step 8: Commit**

```bash
git commit -am "test(e2e): core flow on desktop via tauri-driver"
```

---

### Task 5: CI workflow `checks.yml` and desktop build matrix

**Files:**
- Create: `.github/workflows/checks.yml`, `.github/workflows/desktop-build.yml`

**Interfaces:**
- Consumes: scripts `format:check`, `typecheck`, `check:rust`, `e2e:web`, `e2e:desktop`, target `player-e2e:build-desktop-e2e`.

- [ ] **Step 1: `checks.yml`** — `on: pull_request` and `push: branches: [main]`; `env: HUSKY: 0`; concurrency group per ref with cancel-in-progress. Jobs (all ubuntu-latest, pnpm 10.17.0, Node 24, `pnpm install --frozen-lockfile`):
  - `frame`: `pnpm format:check`, `pnpm nx run-many -t lint typecheck build`.
  - `rust`: install the webkit2gtk apt list from `main.yml`; `mkdir -p dist/apps/player-desktop` (Tauri's build script requires `frontendDist` to exist); `pnpm check:rust`; cache `src-tauri/target` (`Swatinem/rust-cache@v2`, `workspaces: src-tauri`).
  - `e2e-web`: `pnpm nx build player && pnpm e2e:web`; upload `apps/player-e2e/artifacts` on failure.
  - `e2e-desktop (non-blocking until Tauri 2 fix)`: `continue-on-error: true`; apt list + `webkit2gtk-driver xvfb`; `cargo install tauri-driver --locked`; `xvfb-run -a pnpm e2e:desktop`; upload artifacts on failure.
- [ ] **Step 2: `desktop-build.yml`** — `on: pull_request` with `paths: [src-tauri/**, apps/player-desktop/**, libs/desktop/**, libs/tauri-storage/**, pnpm-lock.yaml, .github/workflows/**]`; matrix `windows-latest`, `macos-latest` (`--target universal-apple-darwin` as in `main.yml`); `pnpm tauri build --no-bundle` (no signing secrets).
- [ ] **Step 3: Validate** — `npx --yes action-validator .github/workflows/checks.yml .github/workflows/desktop-build.yml` (or `actionlint` if installed). Expected: no errors. Then push the branch and open a draft PR; expected: `frame`, `rust`, `e2e-web` green; `e2e-desktop` reports its real result without failing the PR.
- [ ] **Step 4: Commit**

```bash
git commit -m "ci: run checks and e2e on pull requests"
```

---

### Task 6: Document for agents and the maintainer

**Files:**
- Modify: `CLAUDE.md` (Testing and Quality section)
- Create: `apps/player-e2e/README.md`

- [ ] **Step 1: CLAUDE.md** — add: "Before declaring work done, run `pnpm check:full` and make it pass. `pnpm check` is the fast subset (no desktop E2E). Desktop E2E currently may fail due to the untested Tauri 2 migration — report its result, don't hide it." List `pnpm typecheck`, `pnpm check:rust`, `pnpm e2e:web`, `pnpm e2e:desktop`. Remove the stale `pnpm test` line or mark it as phase 4.
- [ ] **Step 2: README** — prerequisites (Rust, webkit2gtk-4.1, WebKitWebDriver, `cargo install tauri-driver --locked`, Chrome or `CHROME_BIN`), how to run headed (`E2E_HEADED=1`), where failure artifacts go, how the fixture works.
- [ ] **Step 3: Maintainer action (not automatable here)** — note in PR description: after merge, mark `frame`, `rust`, `e2e-web` as required status checks in branch protection for `main`; make `e2e-desktop` required (and drop `continue-on-error`) once the Tauri 2 fix makes it pass.
- [ ] **Step 4: Verify** — `pnpm check:full` from a clean checkout of the branch; record result.
- [ ] **Step 5: Commit**

```bash
git commit -am "docs: document check commands and e2e setup"
```
