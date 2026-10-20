# player-e2e

End-to-end tests for the core flow: open a game, run actions, save/load, reopen from the shelf. They are written as [Serenity/JS](https://serenity-js.org) Screenplay scenarios that run unchanged on both targets.

- Web: Playwright Test (`targets/web/`), runs against the production build of `apps/player`.
- Desktop: WebdriverIO + mocha + `tauri-driver` (`targets/desktop/`), runs against the debug Tauri binary.
- Fixture: `fixtures/e2e-game.qsps` is a tiny QSP game (a `start` and a `room` location with a counter, Save and Load actions); `fixtures/e2e-game.ts` holds its path and the texts it writes. Each scenario starts with an empty shelf and no saves: on the web a fresh browser context imports it; on desktop the app opens it from its CLI argument.

## Layout

```
apps/player-e2e/
  scenarios/            the tests, one file per feature (*.scenario.ts); run on both targets
  screenplay/
    <area>/             elements.ts, tasks.ts, checks.ts for one place in the UI
      shelf/ game/ pause/ saves/
    common/             elements and checks used by more than one area
    support/            shared primitives (below)
  targets/
    web/                playwright.config.ts, Cast, OperateWebPlayer, scenario shim
    desktop/            wdio.conf.ts, Cast, OperateDesktopPlayer, scenario shim, fresh-app, prereqs
  fixtures/             test games and their constants
```

`screenplay/support/` holds: `operate-player.ts` (the abstract ability), `scenario.ts` (the `scenario()` shim), `seeEventually.ts`, `presence.ts` (`waitUntilPresent`, `PresenceOf`, `isShown`, `textIfPresent`), `visible.ts`, `timeouts.ts` and `scenario-location.ts`. Add to it only with a reason.

### Desktop isolation

`targets/desktop/wdio.conf.ts` starts one `tauri-driver` per run, with its own temporary `XDG_DATA_HOME`/`XDG_CONFIG_HOME`/`XDG_CACHE_HOME`. Before each scenario, `targets/desktop/fresh-app.ts` (called by the desktop scenario shim) ends the WebDriver session, waits (via `/proc`) until the app and its WebKit processes have exited, empties those dirs and starts a new session; `tauri-driver` then launches a new app process with the fixture as its argument. This relies on XDG dirs and `/proc`, so it is Linux-only; on other platforms the tests fail in the `beforeEach` hook.

## Rules

Scenarios are written under these rules. Lint does not enforce them yet (only the repo-wide TypeScript and ESLint rules apply), so reviewers do.

### Where things go

An **area** is a place in the UI where the player can be: a screen (shelf, game) or an overlay on it (pause menu, saves panel). Test: can you name where the player is looking with one noun?

| What     | Where                                                                                                                             |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Area     | `screenplay/<area>/`, with `elements.ts` (definitions only, the only file with selectors), `tasks.ts`, `checks.ts`                |
| Element  | In the area where it is visible; visible in more than one area: `screenplay/common/`                                              |
| Task     | In the area where the player starts it (`ReturnToShelf` starts in the game, so it is in `game/`, though it passes the pause menu) |
| Check    | In the area that shows what is checked                                                                                            |
| New area | When a new screen or overlay appears, or a file passes about 150 lines and a natural sub-place can be split out                   |
| Never    | An area per feature. "Quick save" is a scenario that uses tasks from the places it touches                                        |

- `elements.ts`: `PageElement` / `PageElements` and nothing else.
- `tasks.ts`: `Task`s and `Interaction`s (what the player does). Never asserts. May wait for the UI to settle after its own action.
- `checks.ts`: what the player expects to see. The only place `Ensure` is used, and only through `seeEventually`.
- Scenarios contain only tasks, checks and constants: no selectors, no `Ensure`, no framework or `targets/` imports.

### Naming

- Elements are nouns: `Shelf`, `MainText`, `RunLink`.
- Tasks are verb phrases: `OpenFromShelf`, `ReturnToShelf`, `OpenGameFile`.
- Checks start with `See`: `SeeMainText`, `SeeShelfTitles`, `SeeSlotEmpty`.
- Scenario files are named for the feature: `saves.scenario.ts`. Titles state behaviour: `loading a save restores the saved state`.

### Locating elements

Find controls and panels only by:

- `data-qsp*` markers, the theme contract: the renderer's markers on `qsp-*` building blocks;
- ARIA roles;
- `data-qa` hooks, **for app-shell UI only** (the shelf and the import error toast, which are not rendered from theme templates): `game-shelf`, `game-shelf-empty`, `game-card` (on the card root), `game-title`, `game-run`, `error-alert`.

Never by visible text, CSS class, nesting or layout: themes and translations change all of them. Text is only for checking content the game writes (`ROOM counter=1`) or that the scenario controls (fixture titles). If a control has no marker or role, add a `data-qsp` marker in the renderer (or a `data-qa` hook in app-shell UI); do not use a fragile selector. Lookups that can match hidden duplicates go through `visible()`.

### Reading and waiting

- **One check primitive.** Every check is `seeEventually(element, question, expectation, description)`: it waits until the element is present, then runs `Ensure.eventually`.
- **Presence helpers.** All element reads go through `support/presence.ts` (`waitUntilPresent`, `PresenceOf`, `isShown`, `textIfPresent`) or `seeEventually`. On desktop, Serenity's own `isPresent()` / `Wait.until` throw WebKit's raw "no such element" instead of returning false, so an element that has not rendered yet would fail at once with `[object Object]`. The helpers treat any read error as "not there yet".
- **Timeouts.** `INTERACTION_TIMEOUT` is 15s (`support/timeouts.ts`), set as Serenity's `interactionTimeout` by both target configs. A failing `Ensure.eventually` takes about 25s to give up because of Serenity's backoff, so the per-scenario timeout (Playwright `timeout`, mocha `timeout`) is 120s.
- **No fixed sleeps** (`Wait.for`) and **no retries** (Playwright `retries: 0`, mocha `retries: 0`, WDIO `specFileRetries: 0`).
- Every `actor.attemptsTo(...)` is awaited; a missing `await` lets a scenario pass without checking anything.
- A game that fails to open fails the scenario within seconds with the player's error text (`SeeGameStarted` in `common/checks.ts`).

### Target differences: `OperatePlayer`

`support/operate-player.ts` defines `abstract class OperatePlayer extends Ability` with one method per capability that differs by target (`startPlayer`, `openGameFile`), and one `Interaction` per capability (`StartPlayer()`, `OpenGameFile(path)`). Shared code only calls `OperatePlayer.as(actor)`. There is one subclass per target: `targets/web/operate-web-player.ts` and `targets/desktop/operate-desktop-player.ts`. Each target's Cast (`targets/<target>/cast.ts`) gives every actor its browsing ability plus its subclass. A new method does not compile until both targets implement it.

### Single-target scenarios

`scenario(title, body)` runs on both targets; each target's shim (`targets/<target>/scenario.ts`) maps it to its runner. When a step exists on only one target, split the scenario into `scenario.webOnly(...)` and `scenario.desktopOnly(...)` variants with the **same base title**. On the other target a variant shows as skipped, never silently absent. Titles get a ` (web only)` / ` (desktop only)` suffix, because Playwright rejects duplicate titles. **Never branch inside a scenario.**

### Failure locations

Failure messages carry the scenario file and line as a `[scenarios/x.scenario.ts:N]` prefix. Playwright's list reporter still names the shim file as the test location (the prefix and a `scenario` annotation carry the real one). The WDIO spec reporter prints `(root)` without titles; Serenity's console reporter carries the detail, so read that.

### Themes

The rules apply now: elements use only the theme contract, so they are the same under every theme. The machinery (fixture variants through `game.cfg`, `forEachTheme`, `themes.scenario.ts`) comes with phase 2. UI a theme renders outside the `qsp-*` vocabulary would get elements under `screenplay/themes/<theme>/`. Rationale: `docs/superpowers/specs/2026-10-20-e2e-conventions-design.md`.

## Commands

- `pnpm e2e:web` - build the player, then run Playwright.
- `pnpm e2e:desktop` - check desktop prerequisites (`targets/desktop/check-prereqs.ts`; fails in seconds, naming what's missing), build the E2E debug binary (`nx run player-e2e:build-desktop-e2e`), then run WebdriverIO.
- `pnpm exec vitest run --project player-e2e` - unit tests for the harness itself (the desktop prerequisite check, `targets/desktop/check-prereqs.ts`).
- `pnpm check` runs those unit tests and then `e2e:web` as its last steps; `pnpm check:full` adds `e2e:desktop`.

## Prerequisites

Web:

- Chromium. Either `CHROME_BIN=/usr/bin/chromium` (use a system browser) or `pnpm exec playwright install chromium`. With neither, Playwright fails with its install message.

Desktop:

- Rust toolchain.
- `tauri-driver`: `cargo install tauri-driver --locked`, with `~/.cargo/bin` on `PATH`.
- `WebKitWebDriver`: Arch `webkit2gtk-4.1`; Debian/Ubuntu `webkit2gtk-driver` (`webkitgtk-webdriver` on Ubuntu 26.04+).
- A display on Linux (`DISPLAY` or `WAYLAND_DISPLAY`; CI uses `xvfb-run -a`).
- Port 4444 free (tauri-driver's port).

A missing tool, a missing display or a busy port 4444 makes `pnpm e2e:desktop` fail with a message naming it. Web E2E likewise fails if port 4300 is already in use; it never reuses a running server.

## Headed runs

The configs read no headed env var. Web: run Playwright directly (after `nx build player`) with the flag:

```bash
CHROME_BIN=/usr/bin/chromium pnpm exec playwright test -c apps/player-e2e/targets/web/playwright.config.ts --headed
```

Desktop: the app is a real window, so it is visible whenever a display is available (no flag needed).

## Failure artifacts

All under `apps/player-e2e/artifacts/`:

- Web: `web/` (screenshots, traces) and `web-report/` (HTML report).
- Desktop: `desktop/` (per failed scenario: `<test-name>.png` screenshot and `<test-name>.html` page source with the webview URL; on a failed run: `tauri-driver.log`; `wdio-logs/`).

## CI and branch protection

Workflows: `.github/workflows/checks.yml` (every PR) and `.github/workflows/desktop-build.yml` (build-only on Linux, Windows and macOS; path-filtered). Branch protection, by the names GitHub shows in the checks list:

- Required checks on `main` (ruleset "main"): `frame`, `rust`, `e2e-web`, `e2e-desktop`.
- Not required: `build-desktop (…)` (the `desktop-build.yml` matrix jobs). The workflow is path-filtered, so a required check would block PRs where it never runs.
