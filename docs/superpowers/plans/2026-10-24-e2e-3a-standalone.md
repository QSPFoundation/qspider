# E2E 3a — Standalone builds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** E2E coverage of the standalone player on web and on desktop-standalone built through the real author pipeline: the bundled game starts by itself, plays, saves/loads (also across a restart), applies its `game.cfg` resources and theme, and on desktop an engine quit closes the window.

**Architecture:**

- **Scenarios** live in `apps/player-e2e/scenarios/standalone/*.scenario.ts`. The main web/desktop configs ignore that folder; two new configs run only it. They reuse the existing `web` / `desktop` scenario shims, casts and abilities (`QSPIDER_E2E_TARGET` stays `web` / `desktop`).
- **The fixture game is staged, never written into `public/game/`.**
  1. A staging script copies the repo's `public/` (without `public/game/`) to `dist/e2e/standalone-public/`.
  2. It puts the fixture game in that copy's `game/` folder.
  3. `apps/player-standalone/vite.config.mts` uses `process.env.QSPIDER_E2E_STANDALONE_PUBLIC_DIR` as `publicDir` when it is set. Unset, the build behaves exactly as today.
- **Desktop-standalone is built the author's way:**
  1. `node tools/standalone-config/cli.mjs <fixture qspider.desktop.json> --out dist/e2e/tauri.standalone-e2e.json`;
  2. `pnpm tauri build --debug --no-bundle -c dist/e2e/tauri.standalone-e2e.json`, with `VITE_QSPIDER_E2E=true`, the staged public dir, and its own `CARGO_TARGET_DIR=src-tauri/target/e2e-standalone`, so it never overwrites the main E2E binary in `src-tauri/target/debug/`.
- **Startup marker:**
  - `StartupMarker` moves from `@qspider/game-shelf` to `@qspider/renderer`, and both existing apps update their import.
  - The standalone `init()` sets `startupFinished$` after `runGame`, and the standalone `App` renders `<StartupMarker />`.
  - It's a hidden `data-qa` attribute, so it isn't player-visible.
- **Quit (desktop only):** a new ability method `OperatePlayer.appRunning(actor)` (desktop: any app process under the run's tauri-driver; web throws) and a check `SeeAppClosed()`. `fresh-app.ts` must tolerate an app that already exited when the next scenario starts.

**Tech Stack:** Serenity/JS screenplay; Playwright (web); WebdriverIO + tauri-driver (desktop); `.qsps` + TOML `game.cfg` fixtures; NX `nx:run-commands` targets; Tauri 2 config overlay from `tools/standalone-config`.

**Spec:** `docs/superpowers/specs/2026-10-24-e2e-phase3-design.md` ("PR 1: Standalone"). Conventions: `apps/player-e2e/README.md` (Rules) and `docs/superpowers/specs/2026-10-21-e2e-phase2-design.md` (maintainer decisions).

## Global Constraints

- Branch `feat/e2e-3a-standalone` in the main checkout, no worktree. NX/pnpm for every task run; never call vitest/playwright/wdio directly in scripts or CI.
- Desktop runs only through `run-desktop-e2e.mjs` (private session): one run at a time, wait for it, and rebuild after any change outside `apps/player-e2e`. `PATH="$HOME/.cargo/bin:$PATH"`. Never touch the real session; never kill processes by name.
- **Never read or write the repo's `public/game/`** (the maintainer keeps a local test game there).
- Nothing test-only in release builds: the startup marker is a hidden attribute present in all builds (like the main player's); the publicDir override only applies when the env var is set at build time.
- README Rules:
  - locate by `data-qsp` / `data-qa` / role only;
  - `seeEventually` for checks;
  - no sleeps;
  - every absence check needs a settled anchor;
  - ≤ 150 lines per screenplay/support file;
  - ≤ 8 actions per fixture location;
  - environment-independent;
  - markers are ALL-CAPS constants in a fixture module free of test-framework imports.
- Defects: fix in this PR. The test goes first as a red `test(e2e)` commit, then the fix in its own `fix(...)` commit. **Ask the maintainer first if a fix is player-visible.** Never route a scenario around a bug (no splitting fixtures, no `desktopOnly`/`webOnly` to dodge a defect). Record each one in the inventory's "Suspected defects" list (next number after 54).
- Key checks must discriminate: run each new key check once with its mechanism disabled and watch it fail (record it in the ledger).
- SDD ledger: `.superpowers/sdd/e2e-3a-standalone/`.

## Review Focus

1. **Stale standalone build.** NX caches `player-standalone:build` by its inputs. Neither a changed fixture nor the staged dir's contents are among them, so a test could run against an old bundle. Every E2E standalone build runs with `--skip-nx-cache` (or `NX_SKIP_NX_CACHE=true` for the Tauri `beforeBuildCommand`). After building, the build target fails unless `dist/apps/player-standalone/game/game.cfg` is byte-identical to the fixture's. (Task 1, Task 4)
2. **The real `public/game/` is untouched and never bundled.** With a sentinel file in `public/game/`, a staged build doesn't contain it, and the sentinel is unchanged afterwards. (Task 1, verification step)
3. **A normal build is unchanged.** `pnpm nx build player-standalone --skip-nx-cache` with the env var unset has no fixture files in `dist/apps/player-standalone/game/`. (Task 1, verification step)
4. **The first `[[game]]` is the one that starts.** The fixture lists two games. Scenario 1 checks the first game's exact start text, which fails if the second one starts. (Task 1)
5. **Wrong binary.** A desktop-standalone run that launched the main player would show the shelf. Scenario 1's `SeeGameStarted` catches that, and the main `e2e:desktop` still uses `src-tauri/target/debug/qspider`. Run `pnpm e2e:desktop --spec apps/player-e2e/scenarios/core-flow.scenario.ts` after a standalone desktop build to confirm. (Task 4)

---

### Task 1: Fixture game, staging, web-standalone target, first scenario (red)

**Files:**

- Create: `apps/player-e2e/fixtures/standalone/game.cfg`, `standalone.qsps`, `other.qsps`, `css/standalone.css`, `js/standalone.js`, `qspider.desktop.json` (the last one is used in Task 4)
- Create: `apps/player-e2e/fixtures/standalone-game.ts`
- Create: `apps/player-e2e/targets/standalone/stage-public.ts`
- Create: `apps/player-e2e/targets/web/playwright.standalone.config.ts`
- Create: `apps/player-e2e/scenarios/standalone/standalone.scenario.ts`
- Modify: `apps/player-standalone/vite.config.mts` (`publicDir`), `apps/player-standalone/project.json` (build `inputs` gets `{ "env": "QSPIDER_E2E_STANDALONE_PUBLIC_DIR" }`)
- Modify: `apps/player-e2e/targets/web/playwright.config.ts` (`testIgnore: 'standalone/**'`), `apps/player-e2e/targets/desktop/wdio.conf.ts` (`exclude` the standalone folder)
- Modify: `apps/player-e2e/project.json` (targets `stage-standalone`, `build-standalone-web-e2e`, `e2e-standalone-web`), `apps/player-e2e/tsconfig.lib.json` (include `targets/standalone/**/*.ts`)

**Interfaces:**

- Produces:
  - `STANDALONE_GAME` in `fixtures/standalone-game.ts`:
    - `dir` (absolute path of `fixtures/standalone/`);
    - `files: string[]` (paths relative to `dir` that are staged, including the theme files copied from `fixtures/themed-game/`: `e2e-theme.html`, `e2e-theme.css`, `e2e-theme.js`);
    - `text: { start: 'STANDALONE START', other: 'OTHER START', room: (n: number) => \`ROOM counter=${n}\` }`;
    - `action: { goToRoom: 'Go to room', increment: 'Increment', save: 'Save', load: 'Load', quit: 'Quit' }`;
    - `theme: 'e2e-custom'`;
    - `css: { property: '--e2e-standalone', value: 'STANDALONE' }`;
    - `mark: { qa: 'standalone-script', text: 'STANDALONE SCRIPT' }`;
    - `desktopConfig` (absolute path of `qspider.desktop.json`).
  - `STANDALONE_STAGE` (exported from `targets/standalone/stage-public.ts`) = absolute `dist/e2e/standalone-public`; `stageStandalonePublic(): void` copies `public/` except `game/`, then the fixture game into `game/`.
  - NX targets in `player-e2e`:
    - `stage-standalone`: `node apps/player-e2e/targets/standalone/stage-public.ts`;
    - `build-standalone-web-e2e`: depends on stage; `QSPIDER_E2E_STANDALONE_PUBLIC_DIR` set; runs `nx run player-standalone:build:production --skip-nx-cache`, then the byte-identical `game.cfg` assertion (Review Focus 1);
    - `e2e-standalone-web`: depends on `build-standalone-web-e2e`; runs `playwright test -c apps/player-e2e/targets/web/playwright.standalone.config.ts`.

- [ ] **Step 1: Write the fixture.**
  - `game.cfg` has two `[[game]]` entries:
    1. `standalone-game`, file `standalone.qsps`, `themes = ["e2e-theme.html"]`, `defaultTheme = "e2e-custom"`, `[game.resources] styles = ["css/standalone.css"]`, `scripts = ["js/standalone.js"]`;
    2. `standalone-other`, file `other.qsps`.
  - `standalone.qsps`:
    - `start`: `inclib 'qspider'`, `*pl 'STANDALONE START'`, `counter = 0`, act `Go to room`;
    - `room`: `*pl 'ROOM counter=<<counter>>'`, acts `Increment`, `Save` (`savegame`), `Load` (`opengame`), `Quit` (`gs 'qspider_quit'`).
  - `other.qsps` prints `OTHER START`.
  - The CSS sets `:root { --e2e-standalone: STANDALONE; }`. The script writes an element `data-qa="standalone-script"` with text `STANDALONE SCRIPT` (same pattern as `fixtures/resources-game/js/one.js`).
  - `qspider.desktop.json` passes `validate()`: `productName "qSpider E2E Standalone"`, `version "0.0.1"`, `identifier "org.qsp.e2e.standalone"`, `publisher "QSPFoundation"`, `window.title "E2E Standalone"`, updater disabled.

- [ ] **Step 2: Write scenario 1 in `scenarios/standalone/standalone.scenario.ts`.**

```ts
scenario('the bundled game starts by itself', async (player) => {
  await player.attemptsTo(StartPlayer(), SeeStartupFinished(), SeeGameStarted(TEXT.start));
});
```

- [ ] **Step 3: Implement staging, the `publicDir` override, the three NX targets and `playwright.standalone.config.ts`.** The standalone config spreads the main config and overrides:
  - `testDir: '../../scenarios/standalone'`, with no `testIgnore`;
  - no `globalSetup`;
  - `webServer`: a preview of `dist/apps/player-standalone` on its own port, `4310` (`vite preview -c apps/player-standalone/vite.config.mts --port 4310 --strictPort`, run through `pnpm exec`), `reuseExistingServer: false`. This deliberately doesn't use `nx run player-standalone:preview`: its `dependsOn: build` would rebuild without the staged dir and overwrite the E2E bundle. Say so in a comment;
  - `outputDir` / report folders under `artifacts/standalone-web*`.

- [ ] **Step 4: Run it and watch it fail for the right reason.**
      Run: `CHROME_BIN=/usr/bin/chromium pnpm nx run player-e2e:e2e-standalone-web --output-style=static`
      Expected: FAIL at "sees the player finish starting up" (no marker). If it fails earlier (the game doesn't start, or a build error), stop and root-cause.

- [ ] **Step 5: Verify Review Focus 2 and 3.**
  1. `touch public/game/SENTINEL`.
  2. Run `build-standalone-web-e2e`. Expected: no `SENTINEL` in `dist/apps/player-standalone/game/`, and `public/game/SENTINEL` still present.
  3. Run `pnpm nx build player-standalone --skip-nx-cache` with the env var unset. Expected: `dist/apps/player-standalone/game/` holds only what `public/game/` holds.
  4. `rm public/game/SENTINEL`.
     Record the results in the ledger.

- [ ] **Step 6: Commit** (red): `test(e2e): standalone fixture, staged build and web target; bundled game starts (red)`.

### Task 2: Standalone startup marker (green)

**Files:**

- Move: `libs/game-shelf/src/components/startup-marker.tsx` → `libs/renderer/src/…` (export it from `libs/renderer/src/index.ts`; remove the `game-shelf` export)
- Modify: `apps/player/src/app/app.tsx`, `apps/player-desktop/src/app/app.tsx` (import from `@qspider/renderer`)
- Modify: `apps/player-standalone/src/app/init.ts` (`startupFinished$.set(true)` after `runGame` and `baseInit$`), `apps/player-standalone/src/app/app.tsx` (render `<StartupMarker />` next to `<GameRunner />`)

**Interfaces:**

- Produces: `StartupMarker` from `@qspider/renderer`, with the same behaviour as before.

- [ ] **Step 1:** Implement the move and the standalone wiring.
- [ ] **Step 2:** Run `pnpm nx run-many -t lint typecheck -p renderer game-shelf player player-desktop player-standalone`. Expected: PASS.
- [ ] **Step 3:** Run `e2e-standalone-web`. Expected: scenario 1 PASS. Then run the main suites' marker users: `CHROME_BIN=/usr/bin/chromium pnpm nx run player-e2e:e2e-web --output-style=static -- scenarios/core-flow.scenario.ts`. Expected: PASS.
- [ ] **Step 4: Discriminate.** Temporarily make the standalone `App` not render the marker, run scenario 1, and watch it FAIL. Revert.
- [ ] **Step 5: Commit:** `feat(standalone): startup-finished marker for automation`.

### Task 3: Standalone web scenarios: play, saves, restart, theme and resources

**Files:**

- Modify: `apps/player-e2e/scenarios/standalone/standalone.scenario.ts`
- Create (only if an existing area lacks the check): `apps/player-e2e/screenplay/standalone/{checks,elements}.ts`

**Interfaces:**

- Consumes:
  - `STANDALONE_GAME`;
  - existing tasks: `ClickAction`, `ChooseSaveSlot` (`screenplay/game`, `screenplay/saves`), `RestartPlayer`;
  - existing checks: `SeeMainText`, `SeeSlotEmpty`, `SeeSlotFilled`, `SeeActiveTheme`, `SeeThemeChrome`, `SeeThemeScriptRan`, `SeeThemeCssApplied` (`screenplay/themes/e2e-custom`), `SeeCssValue({ root: true }, …)`, `SeeResourceMark`.

- [ ] **Step 1: Write the scenarios.** All run on both targets.
  1. **`actions update the game text`:** Go to room → `ROOM counter=0`; Increment → `ROOM counter=1`.
  2. **`loading a save restores the saved state`:** same steps as `core-flow`'s scenario of that name.
  3. **`a save survives a restart`:**
     - save at counter 1 into slot 1;
     - the settled anchor before the restart is the reopened Save dialog showing slot 1 filled, then close it;
     - `RestartPlayer()`, `SeeStartupFinished()`, `SeeGameStarted(TEXT.start)`, Go to room, Load, slot 1 → `ROOM counter=1`.
  4. **`the game's theme and resources apply`:**
     - `SeeActiveTheme('e2e-custom')`, `SeeThemeChrome()`, `SeeThemeScriptRan()`, `SeeThemeCssApplied()`;
     - root `--e2e-standalone` equals `STANDALONE`;
     - `SeeResourceMark('standalone-script', 'STANDALONE SCRIPT')`.
  - If a theme check reads `THEMED_GAME` constants that don't match the copied theme files, export the shared theme constants from `fixtures/themes-game.ts` rather than duplicating them.
- [ ] **Step 2:** Run `e2e-standalone-web`. Expected: PASS. A failure here is either a harness mistake (fix it) or a standalone defect: write it up as a red `test(e2e)` commit, then fix it (ask first if it's player-visible).
- [ ] **Step 3: Discriminate.** Temporarily remove `defaultTheme` and the `styles` entry from the fixture `game.cfg` and watch scenario 4 FAIL. Temporarily make Load a no-op and watch scenarios 2 and 3 FAIL. Revert.
- [ ] **Step 4: Commit:** `test(e2e): standalone play, saves, restart, theme and resources (web)`.

### Task 4: Desktop-standalone through the author pipeline

**Files:**

- Create: `apps/player-e2e/targets/desktop/wdio.standalone.conf.ts`
- Modify: `apps/player-e2e/targets/desktop/run-desktop-e2e.mjs` (accept `--standalone`: picks `wdio.standalone.conf.ts`; everything else as today)
- Modify: `apps/player-e2e/project.json` (targets `build-desktop-standalone-e2e`, `e2e-standalone-desktop`), `apps/player-e2e/tsconfig.desktop.json` (already includes `targets/desktop/**`)

**Interfaces:**

- Consumes: `STANDALONE_GAME.desktopConfig`, `stage-standalone`.
- Produces:
  - `build-desktop-standalone-e2e`: depends on stage. In order, it runs:
    1. the generator CLI, writing `dist/e2e/tauri.standalone-e2e.json`;
    2. `pnpm tauri build --debug --no-bundle -c dist/e2e/tauri.standalone-e2e.json` with env `VITE_QSPIDER_E2E=true`, `QSPIDER_E2E_STANDALONE_PUBLIC_DIR=<stage>`, `NX_SKIP_NX_CACHE=true`, `CARGO_TARGET_DIR=src-tauri/target/e2e-standalone`;
    3. the byte-identical `game.cfg` check against `dist/apps/player-standalone/game/game.cfg`.
  - The binary is `src-tauri/target/e2e-standalone/debug/qspider(.exe)`.
  - `wdio.standalone.conf.ts` spreads `config` from `wdio.conf.ts`:
    - `specs: ['../../scenarios/standalone/**/*.scenario.ts']`, no `exclude`;
    - capabilities `'tauri:options': { application: <standalone binary>, args: [] }`;
    - its own artifacts dir. Export whatever `wdio.conf.ts` needs to make this a spread rather than a copy.
  - `e2e-standalone-desktop`: depends on the build; runs `node apps/player-e2e/targets/desktop/run-desktop-e2e.mjs --standalone`.

- [ ] **Step 1:** Implement the targets and the config.
- [ ] **Step 2:** Run `PATH="$HOME/.cargo/bin:$PATH" pnpm nx run player-e2e:e2e-standalone-desktop --output-style=static`. Expected: scenarios 1 to 5 PASS. A failure that also fails on web means a harness mistake. A desktop-only failure is likely a real desktop-standalone defect, for example game files served from the embedded assets under the generated `identifier`, or the updater-less `setup`. Handle it as in Task 3, Step 2.
- [ ] **Step 3: Review Focus 5.** Run `PATH="$HOME/.cargo/bin:$PATH" pnpm e2e:desktop --spec apps/player-e2e/scenarios/core-flow.scenario.ts`. Expected: PASS (the main binary is intact).
- [ ] **Step 4: Commit:** `test(e2e): desktop-standalone target built through the author pipeline`.

### Task 5: Quit closes the standalone window (desktop)

**Files:**

- Modify: `apps/player-e2e/screenplay/support/operate-player.ts` (new abstract `appRunning(actor: UsesAbilities & AnswersQuestions): Promise<boolean>`)
- Modify: `apps/player-e2e/targets/web/operate-web-player.ts` (throws `appRunning is not supported on web`), `apps/player-e2e/targets/desktop/operate-desktop-player.ts`, `apps/player-e2e/targets/desktop/fresh-app.ts` (export `appRunning(): boolean` = processes exist under the driver, and `restartApp` tolerates an app that already exited: no "No app process found" error, end the session without failing on its dead state, then `reloadSession`)
- Create: `apps/player-e2e/screenplay/standalone/checks.ts` (`SeeAppClosed(): Task`)
- Modify: `apps/player-e2e/scenarios/standalone/standalone.scenario.ts`

**Interfaces:**

- Produces: `SeeAppClosed()`, which polls `OperatePlayer.as(actor).appRunning(actor)` until it returns `false`, through the support polling helpers (`pollUntil` or `Wait.until`, never a sleep), with the standard timeout.

- [ ] **Step 1: Write the scenario.**

```ts
scenario.desktopOnly('quitting the game closes the window', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.goToRoom),
    SeeMainText(TEXT.room(0)),
    ClickAction(ACTION.quit),
    SeeAppClosed(),
  );
});
```

Add a following scenario in the same file, so the next restart after a closed app is exercised. Scenario 1 already follows if ordered after it; keep the quit scenario not last.

- [ ] **Step 2:** Run it. Expected: FAIL (`appRunning` not implemented).
- [ ] **Step 3:** Implement `appRunning` and the `fresh-app.ts` change. The "No app process found" guard stays for the case where the app never launched: tell the two cases apart by whether the previous scenario's session saw the app (keep the last known app PIDs in the worker), not by ignoring the error.
- [ ] **Step 4:** Run `e2e-standalone-desktop`. Expected: all PASS, including the scenario after quit.
- [ ] **Step 5: Discriminate.** Temporarily make the standalone `onGameEnd$` a no-op, rebuild, and watch the quit scenario FAIL at `SeeAppClosed`. Revert and rebuild.
- [ ] **Step 6: Commit:** `test(e2e): quitting a standalone game closes the window (desktop)`.

### Task 6: Scripts, CI, docs

**Files:**

- Modify: `package.json`:
  - `e2e:standalone-web` = `nx run player-e2e:e2e-standalone-web`;
  - `e2e:standalone-desktop` = the desktop prereq check, then `nx run player-e2e:e2e-standalone-desktop`;
  - `check` appends `&& pnpm e2e:standalone-web`;
  - `check:full` appends `&& pnpm e2e:standalone-desktop`.
- Modify: `.github/workflows/checks.yml`:
  - jobs `e2e-standalone-web` and `e2e-standalone-desktop`, mirroring `e2e-web` / `e2e-desktop` (same setup, same failure-artifact upload);
  - the Rust cache covers `src-tauri -> target`, including `target/e2e-standalone`.
- Modify: `apps/player-e2e/README.md`:
  - a "Standalone" section: staging, never `public/game/`, the two targets, `--standalone`, the marker, `appRunning`/`SeeAppClosed`;
  - the CI job list;
  - fix line 274, which says `desktop-build.yml` builds Linux: its matrix is Windows and macOS only.
- Modify: `CLAUDE.md`: the two new commands under "Testing and Quality".
- Modify: `docs/superpowers/specs/2026-10-21-e2e-engine-inventory.md`: any new defects (55+).

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Run `pnpm nx format:check --all`, `pnpm nx run-many -t lint typecheck`. Expected: PASS.
- [ ] **Step 3: Commit:** `ci(e2e): standalone web and desktop jobs; docs`.

### Task 7: Final verification and PR

- [ ] **Step 1:** Run the whole-branch review (most capable model) and apply its fixes.
- [ ] **Step 2:** Run one `pnpm check:full` (`CHROME_BIN=/usr/bin/chromium`, `PATH="$HOME/.cargo/bin:$PATH"`), logging to a file. Read `CHECKFULL_EXIT=` and both desktop `Spec Files:` lines from the log. Expected: exit 0.
- [ ] **Step 3:** Push and open the PR against `main`, flagging any ⚠ product changes. Wait for CI and report it. **Ask the maintainer before adding `e2e-standalone-web` / `e2e-standalone-desktop` to the "main" ruleset.**
- [ ] **Step 4:** Copy the ledger's rulings into the final summary, then delete `.superpowers/sdd/e2e-3a-standalone/`.
