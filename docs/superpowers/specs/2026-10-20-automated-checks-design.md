# Automated Checks — Design

Date: 2026-10-20
Status: approved pending maintainer read-through

## Intent

The maintainer wants to hand large changes (e.g. the Tauri 2 migration) to AI coding agents and get a trustworthy answer to "did anything break?" without manually clicking through the app. Today there is no such signal: the Tauri 2 migration and five Dependabot Cargo bumps reached `main` without anything building or testing them, and the migration has still not been run end to end.

The checks must be usable by an agent locally (one command, pass/fail output it can read) and must run in CI on every change.

## Current state (as of 2026-10-20)

- GitHub workflows (`main.yml`, `prerelease.yml`, `demo.yml`) only build/publish on push to `release` or manual dispatch. Nothing runs on PRs or `main`.
- `pnpm test` runs nothing: no project has a `test` target and `nx.json` has no plugins inferring one.
- Existing tests that do pass when run directly: 18 Vitest tests in `libs/desktop` (has a `test` block in `vite.config.mts`), 8 Rust tests in `src-tauri/src/game_uri.rs`, and `tools/standalone-config/generate.spec.mjs` (never run).
- `pnpm lint` passes on all 17 projects. No typecheck target; `tsc` on player-desktop passes when run manually.
- Pre-commit hook: lint-staged runs eslint on `*.ts` only (skips `.tsx`).
- No end-to-end tests of any kind.
- `test-assets/` already holds sample games (`classic`, `aero`, `qspider`, `common`, `multi-game-archive`) as `.qsps` source plus `.zip` archives.
- Desktop opens games from a CLI argument (`filePath` / `-f` via the Tauri CLI plugin), the Open dialog, drag-and-drop, and the shelf. CLI open adds the game to the shelf and starts it.
- Save/load uses in-app slots and app storage, with no native dialog, so the core flow needs no dialog stub.
- Web open uses a plain `<input type="file">`.
- Startup update check: `checkForUpdates()` in `apps/player-desktop/src/app/init.ts` shows an `ask` dialog, so it has to be gated in test runs.
- Desktop app data lives under the OS app-data dir for `org.qsp.qspider`, and can be isolated per run (e.g. `XDG_DATA_HOME` on Linux).
- `pnpm format:check` currently fails on ~15 files, including generated ones (`pnpm-lock.yaml`, `CHANGELOG.md`, `src-tauri/gen/schemas/*.json`) and some source in `libs/debugger` and `libs/game-shelf`. Typecheck of every project and `clippy -D warnings` haven't been run yet and may also fail.

## Goals

1. One local command (`pnpm check` / `check:full`) that runs every fast check and exits non-zero on failure; usable by an agent.
2. CI on every PR (including Dependabot) and push to `main` running the same checks.
3. End-to-end tests of what a player does, against both the web player and the desktop app, starting with the core flow: **open game from file → it appears on the shelf → play a few moves → save → load and land in the same state.**
4. Broad end-to-end coverage of user features beyond the core flow.
5. Desktop end-to-end on Linux and Windows; macOS verified as "builds and launches".
6. Deeper unit tests for the logic libraries.

## Non-goals

- A coverage percentage target.
- Testing the native OS file dialog UI itself (not automatable; checked manually when touched).
- Full desktop E2E on macOS (tauri-driver does not support it).
- Visual pixel-diff testing (not requested; may revisit).

## Anti-goals (would make this a failure even if it "works")

- **Tests that pass when behaviour is wrong.** Tests that mirror implementation rather than describe player-visible behaviour give agents false confidence. E2E assertions must be about what the player sees (text, buttons, shelf entries, restored state).
- **Flaky tests.** A check that randomly fails trains everyone (agents included) to ignore it. Flakes get fixed or quarantined, not retried blindly.
- **A check suite too slow to run on every change.** Fast checks should stay in the low minutes locally.
- **Shipping test hooks in production builds.** Any test-mode stubs must be absent from release artifacts.

## Constraints

- NX 23 monorepo, pnpm 10.17, Node 24 in CI, Vite 8, Vitest 5, React 19, Tauri 2.
- Maintainer develops on Linux.
- Must work for both `player` (web) and `player-desktop` apps; `player-standalone` is covered in phase 3.
- tauri-driver supports Linux (WebKitWebDriver) and Windows (msedgedriver), not macOS.

## Design

Work is split into four phases, shipped in order. Each phase is independently useful. Phase 1 is the centrepiece: the existing unit tests are too few to give a "still works" signal on their own, so the first deliverable pairs a cheap "it still builds everywhere" frame with the core-flow E2E test that answers "it still works".

### Phase 1 — Check frame + core-flow E2E on Linux (web + desktop)

#### 1a. Check frame (builds, types, lint on every change)

- Add a `typecheck` target for all TS projects (nothing runs `tsc` today).
- Rust: `cargo fmt --check`, `cargo clippy -- -D warnings`, `cargo test` for `src-tauri` (the 8 existing Rust tests come along for free).
- Build all apps (`player`, `player-standalone`, `player-desktop`, `docs`) as a check.
- Clean-up so the frame starts green: reformat sources, add generated files (`pnpm-lock.yaml`, `CHANGELOG.md`, `src-tauri/gen/`) to `.prettierignore`, and fix any typecheck/clippy errors the new checks find.
- Lint-staged: include `*.tsx` (and `*.js/*.mjs` where eslint is configured).
- `pnpm check`: runs format check, lint, typecheck, Rust checks, builds, and the core-flow E2E (see 1b). Uses `nx affected` where it helps speed, with a way to force all. If E2E makes it too slow for every edit, split into `pnpm check` (fast) and `pnpm check:full` (with E2E) — but `check:full` is what an agent must pass before declaring work done.
- New workflow `.github/workflows/checks.yml` on `pull_request` and `push: main`: JS checks job on ubuntu; Rust checks job on ubuntu (with the webkit2gtk deps already listed in `main.yml`); Tauri desktop build-only job on ubuntu, windows and macos (no bundling/signing) so platform compile breaks (e.g. from Dependabot Cargo bumps) surface on PRs, with the Windows/macOS builds running only when `src-tauri/`, desktop libs/apps, lockfiles or workflows change, to limit CI cost; E2E jobs (1b).
- Document the check command in `CLAUDE.md` as what an agent must pass before declaring work done.

#### 1b. Core-flow E2E

- **Test game:** a small deterministic game written for testing, committed as `.qsps` under `test-assets/e2e/`, with a few locations, actions that change visible text and a variable, so "same state after load" is observable. Compiled to `.qsp` at test setup with `@qsp/converters` (or committed pre-built — builder's call). It must exercise save/load meaningfully (state changes between save and load must be detectable).
- **Two thin test files, one per target (maintainer's decision):** Playwright for web, WebdriverIO for desktop (tauri-driver speaks WebDriver; Playwright cannot attach to WebKitGTK). Each file spells out the core-flow steps in its own framework. To limit drift they share one constants module (fixture path, expected visible strings, action labels, slot index, shelf title) and use the same helper names in the same order, so the two files read side by side.
- **Runners:** Web: Playwright against the built `player` served statically (`webServer`), opening from file through the file input. Desktop: WebdriverIO + `tauri-driver` against a debug build of `player-desktop`. Opening from file uses the CLI argument path (`qspider <file>`) as the primary route.
- **Test mode for desktop:** the updater check on startup is disabled in test runs so it cannot block the UI. Mechanism (env var, Cargo feature, or separate Vite mode) is the builder's call, subject to the anti-goal: nothing test-only in release builds.
- **Isolation:** each run uses a fresh app data directory / browser profile so shelf and saves start empty.
- CI: web E2E and desktop E2E (under `xvfb-run`) jobs on ubuntu in `checks.yml`. Local: `pnpm e2e`, `pnpm e2e:web`, `pnpm e2e:desktop`. Failure artifacts: screenshots and logs uploaded in CI.
- First real use: run it against current `main` to find out whether the (untested) Tauri 2 migration works. Fixing what it finds is separate work, not part of this project.
- **Blocking policy:** all checks block merging except desktop E2E, which starts as a reported but non-blocking CI job (clearly labelled, e.g. `desktop-e2e (non-blocking until Tauri 2 fix)`). Once the migration fix makes it pass on `main`, it becomes required. Web E2E blocks from day one.
- **Where agents run:** agents run `check:full` locally on the maintainer's Linux machine. Document the prerequisites (Rust, webkit2gtk dev libs, `webkit2gtk-driver`/`WebKitWebDriver`, `tauri-driver`). If a desktop prerequisite is missing, the command fails with a clear message naming it. It never silently skips desktop E2E and reports success. No container or cloud-sandbox support needed.

### Phase 2 — Broaden E2E flows

Scenarios added to both suites (exact list approved by the maintainer before implementation, since these define "correct"):

- All open routes: CLI argument, Open dialog (desktop: stubbed in test mode to return a fixed path; web: file chooser), drag-and-drop, URL import (web), re-opening from shelf.
- Archive games (`.zip`, multi-game archive from `test-assets/`).
- Shelf management: add, remove, persistence across app restart.
- Save/load: multiple slots, quick save, autosave if present, persistence across restart.
- Settings and themes (including game-provided themes: `aero`, `qspider` test assets), language switch.
- Sound: game that plays audio does not error (assert via app state/log, not audio output).
- `player-standalone` build (web and desktop-standalone config) opens its bundled game.

### Phase 3 — More platforms

- Desktop E2E job on `windows-latest` (tauri-driver + msedgedriver).
- macOS: build + launch smoke (app starts, main window loads, no crash within N seconds) without WebDriver.

### Phase 4 — Unit tests

- Wire unit tests into NX: register the `@nx/vitest` plugin (or explicit `test` targets) so `pnpm test` actually runs the existing 18 `libs/desktop` tests and `tools/standalone-config/generate.spec.mjs`; add `test` to `pnpm check` and CI.
- Add unit tests for `game-state` (save/load, current game), `game-shelf`, `importers`, `tauri-storage`, prioritised by what phases 1–3 showed to be fragile or hard to cover end to end. Tests describe behaviour at the public API of each library, not internals.

## Decided by the maintainer

- Goal is broad coverage across all dimensions (features E2E, platforms, unit depth), investing time now.
- Core flow definition: open game from file → shelf → play → save → load.
- Desktop E2E is non-blocking in CI until the Tauri 2 migration fix lands, then required; everything else blocks.
- Agents run checks locally on the maintainer's Linux machine.
- E2E tooling: Playwright for web, WebdriverIO for desktop, two thin test files rather than one shared scenario over an adapter.
- Phased order above. Unit-test wiring alone gives little value with today's ~26 tests, so phase 1 pairs the build/typecheck/lint frame with the core-flow E2E; unit tests come last.

## My calls (Claude's — check these)

- Tools: Vitest (already present) for unit tests. (E2E tools were the maintainer's decision: Playwright for web, WebdriverIO + tauri-driver for desktop, two thin test files sharing constants.)
- Phase 1 includes the format/typecheck/clippy clean-up needed to start green.
- Windows/macOS desktop builds in PR CI only when desktop-relevant paths change.
- CLI argument as primary desktop "open from file" route; dialog stubbed only in test mode.
- Purpose-built deterministic E2E game rather than relying only on existing test assets.
- Desktop build-only check on all three OSes from phase 1.

## Left to the builder

- Exact NX wiring (inferred plugin vs explicit targets), job layout and caching in CI.
- How the test mode is switched on, within the "nothing test-only in release" constraint.
- Selector strategy (prefer accessible roles/text; add `data-testid` only where needed).
- Whether the E2E game is compiled at setup or committed pre-built.
