# player-e2e

End-to-end tests for the core flow: open a game, run actions, save/load, reopen from the shelf.

- Web: Playwright (`web/core-flow.spec.ts`), runs against the production build of `apps/player`.
- Desktop: WebdriverIO + `tauri-driver` (`desktop/*.e2e.ts`), runs against the debug Tauri binary.
- Both are thin test files with the same four independent tests. Shared constants (fixture path, texts, action labels) live in `shared/core-flow.ts`.
- Fixture: `fixtures/e2e-game.qsps` is a tiny QSP game (a `start` and a `room` location with a counter, Save and Load actions). Each test imports it fresh into an empty shelf.

## Commands

- `pnpm e2e:web` - build the player, then run Playwright.
- `pnpm e2e:desktop` - build the E2E debug binary (`nx run player-e2e:build-desktop-e2e`), then run WebdriverIO. Note the prerequisite check runs after that build.
- `pnpm check` runs `e2e:web` as its last step; `pnpm check:full` adds `e2e:desktop`.

## Prerequisites

Web:

- Chromium. Either `CHROME_BIN=/usr/bin/chromium` (use a system browser) or `pnpm exec playwright install chromium`. With neither, Playwright fails with its install message.

Desktop:

- Rust toolchain.
- `tauri-driver`: `cargo install tauri-driver --locked`, with `~/.cargo/bin` on `PATH`.
- `WebKitWebDriver`: Arch `webkit2gtk-4.1`; Debian/Ubuntu `webkit2gtk-driver`.
- A display (CI uses `xvfb-run`).

A missing tool makes `pnpm e2e:desktop` fail with a message naming it.

## Known state: desktop E2E is red

3 of 4 desktop tests currently fail because of a real Tauri 2 desktop bug. Opening the pause/saves panel navigates the webview to a blank `qsp://localhost/?...&pause=true` page: `history.push` in `libs/game-state/src/pause-screen.ts` resolves against the game's `<base href>` set in `libs/game-state/src/current-game.ts`, `pushState` throws a cross-origin SecurityError, and the code falls back to `location.assign`. So `pnpm check:full` is currently red. Report the desktop result as it is; do not skip or hide it.

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

Workflow: `.github/workflows/checks.yml`. After merge, in branch protection for `main`:

- Mark `frame`, `rust`, `e2e-web` as required.
- Do not require `desktop-build`: it is path-filtered, so it would block PRs where it never runs.
- Make `e2e-desktop` required and drop its `continue-on-error` once the Tauri 2 fix makes it pass on `main`.
- The non-blocking `e2e-desktop` job shows green in the PR checks list even when its tests fail. Look inside it (artifacts are uploaded on failure).
