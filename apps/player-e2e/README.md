# player-e2e

End-to-end tests for the core flow: open a game, run actions, save/load, reopen from the shelf.

- Web: Playwright (`web/core-flow.spec.ts`), runs against the production build of `apps/player`.
- Desktop: WebdriverIO + `tauri-driver` (`desktop/*.e2e.ts`), runs against the debug Tauri binary.
- Both are thin test files with the same four independent tests. Shared constants (fixture path, texts, action labels) live in `shared/core-flow.ts`.
- Fixture: `fixtures/e2e-game.qsps` is a tiny QSP game (a `start` and a `room` location with a counter, Save and Load actions). Each test imports it fresh into an empty shelf.

## Commands

- `pnpm e2e:web` - build the player, then run Playwright.
- `pnpm e2e:desktop` - build the E2E debug binary (`nx run player-e2e:build-desktop-e2e`), then run WebdriverIO. Note the prerequisite check runs after that build.
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

- `desktop/2-actions.e2e.ts` must pass.
- `desktop/1-open-game.e2e.ts`, `desktop/3-save-load.e2e.ts` and `desktop/4-reopen-from-shelf.e2e.ts` are expected to fail, with the webview landing on `qsp://localhost/?...pause=true` (the URL is in the failure artifact `artifacts/desktop/<test>.html`).
- Any other desktop failure (a different test, or one of these three failing another way), and any failure in `pnpm check`, is a regression.

When the Tauri pause/saves fix lands: re-run `pnpm e2e:desktop` (all 4 pass); do the deliberate-break check on test 3 (break only `3-save-load.e2e.ts`, confirm only test 3 fails, revert); confirm the desktop shelf title and XDG isolation (each session starts with an empty shelf); remove this red-state section and the matching text in the root `CLAUDE.md`; drop the `(non-blocking until Tauri 2 fix)` suffix from the job name in `checks.yml` and make `e2e-desktop` a required check.

## Headed runs

The configs read no headed env var. Web: run Playwright directly (after `nx build player`) with the flag:

```bash
CHROME_BIN=/usr/bin/chromium pnpm exec playwright test -c apps/player-e2e/playwright.config.ts --headed
```

Desktop: the app is a real window, so it is visible whenever a display is available (no flag needed).

## Failure artifacts

All under `apps/player-e2e/artifacts/`:

- Web: `web/` (screenshots, traces) and `web-report/` (HTML report).
- Desktop: `desktop/` (per failed test: screenshot and page source with the webview URL; per spec: `tauri-driver` log; `wdio-logs/`).

## CI and branch protection

Workflows: `.github/workflows/checks.yml` (every PR) and `.github/workflows/desktop-build.yml` (build-only on Linux, Windows and macOS; path-filtered). After merge, in branch protection for `main`, using the names GitHub shows in the checks list:

- Mark `frame`, `rust`, `e2e-web` as required.
- Do not require `build-desktop (…)` (the `desktop-build.yml` matrix jobs): the workflow is path-filtered, so it would block PRs where it never runs.
- Do not require `e2e-desktop (non-blocking until Tauri 2 fix)` yet. It has no `continue-on-error`, so it shows red in the PR checks list when its tests fail; it does not block merging only because it is not a required check. Failure artifacts are uploaded.
- Make it required once the Tauri 2 fix makes it pass on `main` (see the checklist above).
