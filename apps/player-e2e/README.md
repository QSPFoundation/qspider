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

Workflows: `.github/workflows/checks.yml` (every PR) and `.github/workflows/desktop-build.yml` (build-only on Linux, Windows and macOS; path-filtered). Branch protection, by the names GitHub shows in the checks list:

- Required checks on `main` (ruleset "main"): `frame`, `rust`, `e2e-web`, `e2e-desktop`.
- Not required: `build-desktop (…)` (the `desktop-build.yml` matrix jobs). The workflow is path-filtered, so a required check would block PRs where it never runs.
