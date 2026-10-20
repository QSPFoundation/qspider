# player-e2e

End-to-end tests for the core flow: open a game, run actions, save/load, reopen from the shelf.

- Web: Playwright (`web/core-flow.e2e.ts`), runs against the production build of `apps/player`.
- Desktop: WebdriverIO + `tauri-driver` (`desktop/core-flow.e2e.ts`), runs against the debug Tauri binary.
- Both are thin test files with the same four independent tests, same names, same order. Shared constants (fixture path, texts, action labels) live in `shared/core-flow.ts`.
- Fixture: `fixtures/e2e-game.qsps` is a tiny QSP game (a `start` and a `room` location with a counter, Save and Load actions). Each test starts with an empty shelf and no saves: on the web a fresh browser context imports it; on desktop the app opens it from its CLI argument.

### Desktop isolation

`wdio.desktop.conf.ts` starts one `tauri-driver` per run, with its own temporary `XDG_DATA_HOME`/`XDG_CONFIG_HOME`/`XDG_CACHE_HOME`. Before each test, `desktop/fresh-app.ts` ends the WebDriver session, waits (via `/proc`) until the app and its WebKit processes have exited, empties those dirs and starts a new session; `tauri-driver` then launches a new app process with the fixture as its argument. This relies on XDG dirs and `/proc`, so it is Linux-only; on other platforms the tests fail in the `beforeEach` hook.

## Commands

- `pnpm e2e:web` - build the player, then run Playwright.
- `pnpm e2e:desktop` - check desktop prerequisites (fails in seconds, naming what's missing), build the E2E debug binary (`nx run player-e2e:build-desktop-e2e`), then run WebdriverIO.
- `pnpm exec vitest run --project player-e2e` - unit tests for the harness itself (the desktop prerequisite check).
- `pnpm check` runs those unit tests and then `e2e:web` as its last steps; `pnpm check:full` adds `e2e:desktop`.

## Prerequisites

Web:

- Chromium. Either `CHROME_BIN=/usr/bin/chromium` (use a system browser) or `pnpm exec playwright install chromium`. With neither, Playwright fails with its install message.

Desktop:

- Rust toolchain.
- `tauri-driver`: `cargo install tauri-driver --locked`, with `~/.cargo/bin` on `PATH`.
- `WebKitWebDriver`: Arch `webkit2gtk-4.1`; Debian/Ubuntu `webkit2gtk-driver`.
- A display on Linux (`DISPLAY` or `WAYLAND_DISPLAY`; CI uses `xvfb-run -a`).
- Port 4444 free (tauri-driver's port).

A missing tool, a missing display or a busy port 4444 makes `pnpm e2e:desktop` fail with a message naming it. Web E2E likewise fails if port 4300 is already in use; it never reuses a running server.

## Known state: desktop E2E is red

3 of 4 desktop tests currently fail because of a real Tauri 2 desktop bug. Opening the pause/saves panel navigates the webview to a blank `qsp://localhost/?...&pause=true` page: `history.push` in `libs/game-state/src/pause-screen.ts` resolves against the game's `<base href>` set in `libs/game-state/src/current-game.ts`, `pushState` throws a cross-origin SecurityError, and the code falls back to `location.assign`. So `pnpm check:full` is currently red. Report the desktop result as it is; do not skip or hide it.

Expected result while this bug is open:

- `actions update the game text` must pass.
- The other three (`opening a game file starts it and adds it to the shelf`, `loading a save restores the saved state`, `a game on the shelf can be reopened`) are expected to fail, with the webview landing on `qsp://localhost/?...pause=true` (the URL is in the failure artifact `artifacts/desktop/<test-name>.html`). The first and last fail at the Quit button, the save/load test at the saves panel.
- Known flake on the same bug: in roughly 3 of 10 runs one of those three times out after 120s instead (the next app session gets stuck after the previous one ended on the blank `qsp://` page; seen with both the one-file and the old per-file layout). Treat that as the known failure, not a regression. It should disappear with the app fix; if it doesn't, investigate.
- Any other desktop failure (a different test, or one of these three failing another way), and any failure in `pnpm check`, is a regression.

When the Tauri pause/saves fix lands: re-run `pnpm e2e:desktop` (all 4 pass); do the deliberate-break check on `loading a save restores the saved state` (break only that test, confirm only it fails, revert); confirm the desktop shelf title and isolation (each test starts with an empty shelf); remove this red-state section and the matching text in the root `CLAUDE.md`; drop the `(non-blocking until Tauri 2 fix)` suffix from the job name in `checks.yml` and make `e2e-desktop` a required check.

## Headed runs

The configs read no headed env var. Web: run Playwright directly (after `nx build player`) with the flag:

```bash
CHROME_BIN=/usr/bin/chromium pnpm exec playwright test -c apps/player-e2e/playwright.config.ts --headed
```

Desktop: the app is a real window, so it is visible whenever a display is available (no flag needed).

## Failure artifacts

All under `apps/player-e2e/artifacts/`:

- Web: `web/` (screenshots, traces) and `web-report/` (HTML report).
- Desktop: `desktop/` (per failed test: `<test-name>.png` screenshot and `<test-name>.html` page source with the webview URL; on a failed run: `tauri-driver.log`; `wdio-logs/`).

## CI and branch protection

Workflows: `.github/workflows/checks.yml` (every PR) and `.github/workflows/desktop-build.yml` (build-only on Linux, Windows and macOS; path-filtered). After merge, in branch protection for `main`, using the names GitHub shows in the checks list:

- Mark `frame`, `rust`, `e2e-web` as required.
- Do not require `build-desktop (…)` (the `desktop-build.yml` matrix jobs): the workflow is path-filtered, so it would block PRs where it never runs.
- Do not require `e2e-desktop (non-blocking until Tauri 2 fix)` yet. It has no `continue-on-error`, so it shows red in the PR checks list when its tests fail; it does not block merging only because it is not a required check. Failure artifacts are uploaded.
- Make it required once the Tauri 2 fix makes it pass on `main` (see the checklist above).
