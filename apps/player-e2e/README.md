# player-e2e

End-to-end tests for the core flow: open a game, run actions, save/load, reopen from the shelf. They are written as [Serenity/JS](https://serenity-js.org) Screenplay scenarios that run unchanged on both targets.

- Web: Playwright Test (`targets/web/`), runs against the production build of `apps/player`.
- Desktop: WebdriverIO + mocha + `tauri-driver` (`targets/desktop/`), runs against the debug Tauri binary.
- Test pack: `fixtures/game.cfg` lists two games, `e2e-game/e2e-game.qsps` ("E2E game": a tiny QSP game with a `start` and a `room` location, a counter, Save and Load actions) and `second/game.qsps` ("Second game"). `fixtures/test-pack.ts` (`TEST_PACK`) holds the config path, the pack zip path and the shelf titles; `fixtures/e2e-game.ts` holds the first game's file path and the texts it writes. `e2e-game.qsps` sits in its own folder, away from `game.cfg`: the desktop player titles a single game file from a `game.cfg` next to it, and a single-file open must show the file name (`e2e-game.qsps`) on both targets. Each scenario starts with an empty shelf and no saves. On desktop the app is always launched with the pack: `tauri-driver` starts it with `game.cfg` as its argument. On web a scenario loads the pack only when it calls `LoadTestPack()` (directly or through `OpenFixture()`): `targets/web/global-setup.ts` zips `game.cfg` and the games it lists into `artifacts/test-pack.zip`, and the scenario uploads it through the Open game input. Every scenario does so except "opening a game file", which on web starts from an empty shelf.

### Product behaviour the suite relies on

The desktop player opens what it is launched with, what is dropped on it and what is picked with Open game through the same decision as the web player's Open game (`addImported`, `libs/game-shelf/src/add-imported.ts`):

- more than one game imported (a `game.cfg` listing several, or a multi-game `.zip`): all go on the shelf, overwriting entries with the same id, with the notice `{{ count }} games added to shelf`, and none starts;
- exactly one: it is added (overwriting) and starts;
- none: an error.

This changed desktop behaviour on this branch: launching with, or dropping, a multi-game `.zip` used to start its first game; it now only shelves the games. On desktop, only a file named `game.cfg` (any case) is a game config; any other `.cfg` is an error ("Only game.cfg is supported …"), not a single-file import, and a `game.cfg` that lists the same `id` twice is an error.

## Layout

```
apps/player-e2e/
  scenarios/            the tests, one file per feature (*.scenario.ts); run on both targets
  screenplay/
    <area>/             elements.ts, tasks.ts, checks.ts (as needed) for one place in the UI
      shelf/ game/ pause/ saves/
    common/             elements and checks used by more than one area
    support/            shared primitives (below)
  targets/
    web/                playwright.config.ts, global-setup (builds the pack zip), Cast, OperateWebPlayer, scenario shim
    desktop/            wdio.conf.ts, Cast, OperateDesktopPlayer, native-dialog, atspi/ (dialog.py, with-a11y-bus.sh),
                        run-desktop-e2e.mjs, private-session, scenario shim, fresh-app, prereqs
  fixtures/             the test pack (game.cfg, test-pack.ts), its games and their constants
```

`screenplay/support/` holds: `operate-player.ts` (the abstract ability), `scenario.ts` (the `scenario()` shim), `see-eventually.ts`, `presence.ts` (`waitUntilPresent`, `waitUntilAbsent`, `ClickWhenPresent`, `PresenceOf`, `AbsenceOf`, `TextNow`, `isShown`, `textIfPresent`), `polling.ts` (`pollUntil`, the fixed-interval loop under them), `element-errors.ts` (which driver errors mean "element missing"), `visible.ts`, `timeouts.ts` and `scenario-location.ts`. Add to it only with a reason.

### Desktop isolation

**Never run `wdio` directly for desktop** (`wdio run apps/player-e2e/targets/desktop/wdio.conf.ts`): the app would open on your real display, GTK would write your real dconf, and the dialog driver would talk to your real accessibility bus. Use `pnpm e2e:desktop`, or `node apps/player-e2e/targets/desktop/run-desktop-e2e.mjs [wdio args]` after a build. On Linux, `wdio.conf.ts` (`onPrepare`, before launching anything), `atspi/dialog.py` and `atspi/with-a11y-bus.sh` all refuse to run (`targets/desktop/private-session.ts` for the first) unless `QSPIDER_E2E_PRIVATE_SESSION=1` is set and `DBUS_SESSION_BUS_ADDRESS` is set and is not the desktop bus (`/run/user/<uid>/bus`).

`targets/desktop/wdio.conf.ts` starts one `tauri-driver` per run, with its own temporary `XDG_DATA_HOME`/`XDG_CONFIG_HOME`/`XDG_CACHE_HOME`. Before each scenario, `targets/desktop/fresh-app.ts` (called by the desktop scenario shim) ends the WebDriver session, waits (via `/proc`) until the app and its WebKit processes have exited, empties those dirs and starts a new session; `tauri-driver` then launches a new app process with the pack's `game.cfg` as its argument. This relies on XDG dirs and `/proc`, so it is Linux-only; on other platforms every scenario fails at its start, in the restart that runs inside each test (`targets/desktop/scenario.ts`).

## Rules

Scenarios are written under these rules. `nx lint player-e2e` enforces the mechanical ones (`eslint.config.js`), all as errors:

- `scenarios/**`: no static imports from Playwright, WebdriverIO, `@wdio/*`, `@serenity-js/playwright*`, `@serenity-js/webdriverio`, `@serenity-js/web` or `targets/**`.
- `screenplay/**`: no static imports from `targets/**`, Playwright, WebdriverIO or `@wdio/*`. `support/scenario.ts` may reach `targets/` (it loads the target's scenario shim).
- No dynamic `import()` anywhere in `apps/player-e2e`, so the import bans cannot be bypassed. The one exception is `screenplay/support/scenario.ts`, the shim loader above.
- `Ensure` is imported only in `screenplay/support/`; the ban covers `scenarios/`, `targets/` and the rest of `screenplay/`, `checks.ts` included (checks go through `seeEventually`).
- `isPresent` (from `@serenity-js/assertions` or `@serenity-js/web`) is imported only in `screenplay/support/`: on desktop it throws instead of answering false (see "Reading and waiting").
- `tasks.ts` may import checks only from `common/checks.ts` (the fail-fast guards such as `SeeGameStarted`); an import of any other `checks` module fails lint.
- `By` is imported only in `elements.ts` and `screenplay/support/`; the ban covers `scenarios/`, `targets/` and the rest of `screenplay/`.
- In `elements.ts`, a string or template literal passed straight to `By.css` must contain `[data-qsp`, `[data-qa` or `[role=`. Other `By` forms (`By.xpath`, `By.id`, `By.cssContainingText`, …) and non-literal arguments are not checked; reviewers cover those.
- No fixed sleeps: a call written as `Wait.for(...)` fails lint anywhere (an aliased `Wait` is not caught).
- `screenplay/**` files have at most 150 lines.
- `@typescript-eslint/no-floating-promises` and `no-misused-promises` (type-aware) everywhere, so an `attemptsTo(...)` without `await` fails lint.

The rest (naming, where an element or task belongs, no text or class lookups beyond what the selector check catches) is up to review.

### Where things go

An **area** is a place in the UI where the player can be: a screen (shelf, game) or an overlay on it (pause menu, saves panel). Test: can you name where the player is looking with one noun?

| What     | Where                                                                                                                             |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Area     | `screenplay/<area>/`, with `elements.ts` (definitions only, the only file with selectors), `tasks.ts`, `checks.ts` as needed      |
| Element  | In the area where it is visible; visible in more than one area: `screenplay/common/`                                              |
| Task     | In the area where the player starts it (`ReturnToShelf` starts in the game, so it is in `game/`, though it passes the pause menu) |
| Check    | In the area that shows what is checked                                                                                            |
| New area | When a new screen or overlay appears, or a file passes about 150 lines and a natural sub-place can be split out                   |
| Never    | An area per feature. "Quick save" is a scenario that uses tasks from the places it touches                                        |

An area has only the files it needs: `pause/` has only `elements.ts`.

- `elements.ts`: `PageElement` / `PageElements` and nothing else.
- `tasks.ts`: `Task`s and `Interaction`s (what the player does). Never calls `Ensure`. May compose only the fail-fast guards in `common/checks.ts` (`OpenFixture` uses `SeeGameStarted` to fail fast on an error alert); area checks belong in scenarios. May wait for the UI to settle after its own action.
- `checks.ts`: what the player expects to see, always through `seeEventually` (never `Ensure` directly).
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
- `data-qa` hooks, **for app-shell UI only** (the shelf, the Open game button and the toasts, which are not rendered from theme templates): `game-shelf` and `game-shelf-empty` (`libs/game-shelf`, `game-shelf.tsx`), `game-card` (on the card root), `game-title` and `game-run` (`game-card.tsx`), `error-alert` (`error-alert.tsx`), `startup-finished` (`startup-marker.tsx`, a hidden marker, below) and `open-game` (`apps/player-desktop/src/app/open-game-button.tsx`, desktop only). These are all the `data-qa` hooks that exist; the web player's Open game control is the `#openGame` file input, which only the web target's `openGameFile` touches.

Never by visible text, CSS class, nesting or layout: themes and translations change all of them. Text is only for checking content the game writes (`ROOM counter=1`) or that the scenario controls (fixture titles). If a control has no marker or role, add a `data-qsp` marker in the renderer (or a `data-qa` hook in app-shell UI); do not use a fragile selector. Lookups that can match hidden duplicates go through `visible()`.

### Reading and waiting

- **One check primitive.** Every check is `seeEventually(element, question, expectation, description)`: it polls until the element is present and the question meets the expectation. A read error during polling means "not yet". On timeout one strict `Ensure.that` reports Expected/Received, with the last read error appended.
- **The desktop trap.** On desktop, WebKitWebDriver answers a read of a missing element with a raw "no such element" (it prints as `[object Object]`), and Serenity's `isPresent()`, `Wait.until` and `Ensure.eventually` rethrow it instead of retrying. So an element that has not rendered yet, or is re-rendering, fails a plain read at once.
- **Presence helpers.** Checks read only through `seeEventually`. Tasks wait and click through `support/presence.ts`: `waitUntilPresent` (any read error means "not yet"), `ClickWhenPresent` (retries the click while the element is missing, up to the timeout), `waitUntilAbsent` (only a missing element counts as gone; other errors surface), `TextNow`, `isShown`, `textIfPresent`. Lint bans `Ensure` and `isPresent` outside `support/`; other reads (`Text.of`, `Attribute`, …) outside these helpers are up to review.
- **Emptiness needs a settled anchor.** A check that something is empty or absent (empty shelf, empty save slot) passes as soon as the UI is briefly empty, and `games$` and the save slots load asynchronously, so they start empty. Before such a check, check a settled anchor: something that shows only once loading has finished, or a non-empty state seen earlier in the same scenario. Neither the shelf's empty notice nor a slot's `data-save-empty` marker is one (both show while loading), so `SeeShelfTitles([])` and `SeeSlotEmpty` in `core-flow` show the expected start state but cannot prove that no game or save was left over; a real guard needs a loaded marker in the UI first. Eventual checks in general only wait for a match: they do not prove the state stays that way, so they do not catch leftovers or duplicates that appear after the match.
  - "No game started" has a settled anchor on desktop: `[data-qa="startup-finished"]` (`StartupMarker`, rendered from `startupFinished$` in `libs/game-state/src/init.ts`, set at the end of the web and desktop players' `init()` (not the standalone player's), after the desktop launch's start decision; `SeeStartupFinished` in `common/checks.ts`). On desktop the start-up shows the shelf first and starts a launched game only later, so a shelf check alone could pass before the game replaces it. "loading a game config adds all its games to the shelf without starting one" checks the marker first, then the shelf with exactly the pack's titles: a game started at launch would have replaced the shelf by then, so on desktop this exact check proves that no game started.
  - Both targets make that start decision with the same shared code, `addImported` (`libs/game-shelf/src/add-imported.ts`, unit-tested in `add-imported.spec.ts`). Desktop proves "no game started" through the startup marker as above. On web the pack is uploaded after startup, so the marker says nothing about the upload: web exercises the same code but checks only the shelf titles, an eventual check that waits for the import.
  - "opening a game file" checks the marker before `OpenGameFile`, on both targets, so the Open game click does not race `init()`.
- **Timeouts.** `INTERACTION_TIMEOUT` is 15s (`support/timeouts.ts`), set as Serenity's `interactionTimeout` by both target configs. The support helpers poll every 250ms (`POLLING_INTERVAL`), not with Serenity's exponential backoff, so a failing check gives up after about 15s. The per-scenario timeout (Playwright `timeout`, mocha `timeout`) is 45s: the scenario's steps (and, on desktop, the app restart) plus one failing check.
- **No fixed sleeps** (`Wait.for`) and **no retries** (Playwright `retries: 0`, mocha `retries: 0`, WDIO `specFileRetries: 0`).
- Every `actor.attemptsTo(...)` is awaited; a missing `await` lets a scenario pass without checking anything.
- A game that fails to open fails the scenario within seconds with the player's error text (`SeeGameStarted` in `common/checks.ts`).

### Target differences: `OperatePlayer`

`support/operate-player.ts` defines `abstract class OperatePlayer extends Ability` with one method per capability that differs by target (`startPlayer`, `loadTestPack`, `openGameFile`), and one `Interaction` per capability (`StartPlayer()`, `LoadTestPack()`, `OpenGameFile(path)`). Shared code only calls `OperatePlayer.as(actor)`. There is one subclass per target: `targets/web/operate-web-player.ts` and `targets/desktop/operate-desktop-player.ts`. Each target's Cast (`targets/<target>/cast.ts`) gives every actor its browsing ability plus its subclass. A new method does not compile until both targets implement it.

- `startPlayer`: web navigates to `/`; desktop does nothing (the app is already launched).
- `loadTestPack` (`LoadTestPack()`): web uploads `TEST_PACK.zipPath` through `openGameFile`; desktop does nothing, because `tauri-driver` launches the app with `TEST_PACK.configPath` as its argument (`wdio.conf.ts`), once per app launch.
- `openGameFile(path)` (`OpenGameFile(path)`): starts on the shelf and opens the file at `path` through the player's Open game control. Web sets the file on the `#openGame` input through the native Playwright page (Serenity's web API has no upload). Desktop clicks the `open-game` button and then drives the native GTK file chooser from `targets/desktop/native-dialog.ts`, which runs `atspi/dialog.py` (below).

Windows later uses UI Automation for the native dialog, behind the same `openGameFile`: no scenario changes.

#### The native dialog (desktop)

The file chooser is a window outside the webview, so WebDriver cannot reach it. `atspi/dialog.py` drives it through AT-SPI, the Linux accessibility API, with no keystrokes and no dependence on the UI language: it waits for the chooser (role `FILE_CHOOSER` in the `qspider` app), runs its `show_location` action to reveal the location entry, sets the path through the entry's EditableText, and activates the entry (Return). Failures exit 1 with a message that `native-dialog.ts` rethrows as `Native file dialog: ...`; a driver that hangs is killed after 22s.

- Clicking Open through AT-SPI does not confirm a path typed into the entry, so it is not used.
- GTK's location entry autocompletes, and the first activation may only accept the completion. So the entry is activated until the dialog closes, at most 3 times, and before each activation its text must still be the requested path: a completion that changed it would open a different file, so that fails instead.
- `xdotool` was considered and rejected as fragile: it depends on window focus, sends synthetic keystrokes that land wherever focus is, and depends on keyboard layout and language.

### Single-target scenarios

`scenario(title, body)` runs on both targets; each target's shim (`targets/<target>/scenario.ts`) maps it to its runner. When a step exists on only one target, split the scenario into `scenario.webOnly(...)` and `scenario.desktopOnly(...)` variants with the **same base title**. On the other target a variant shows as skipped, never silently absent. Titles get a ` (web only)` / ` (desktop only)` suffix, because Playwright rejects duplicate titles. **Never branch inside a scenario.**

### Failure locations

Failure messages carry the scenario file and line as a `[scenarios/x.scenario.ts:N]` prefix. Playwright's list reporter still names the shim file as the test location (the prefix and a `scenario` annotation carry the real one). The WDIO spec reporter prints `(root)` without titles; Serenity's console reporter carries the detail, so read that.

### Themes

The rules apply now: elements use only the theme contract, so they are the same under every theme. The machinery (fixture variants through `game.cfg`, `forEachTheme`, `themes.scenario.ts`) comes with phase 2. UI a theme renders outside the `qsp-*` vocabulary would get elements under `screenplay/themes/<theme>/`. Rationale: `docs/superpowers/specs/2026-10-20-e2e-conventions-design.md`.

## Commands

- `pnpm e2e:web` - build the player, then run Playwright.
- `pnpm e2e:desktop` - check desktop prerequisites (`targets/desktop/check-prereqs.ts`; fails in seconds, naming what's missing), build the E2E debug binary (`nx run player-e2e:build-desktop-e2e`), then run WebdriverIO through `targets/desktop/run-desktop-e2e.mjs` (below). Extra arguments to that script go to `wdio run`.
- `pnpm nx test player-e2e` - unit tests for the harness itself: the desktop prerequisite check (`targets/desktop/check-prereqs.ts`), and the private-session guard (`targets/desktop/private-session.ts`).
- `pnpm check` runs those unit tests and then `e2e:web` as its last steps; `pnpm check:full` adds `e2e:desktop`.

## Prerequisites

Web:

- Chromium. Either `CHROME_BIN=/usr/bin/chromium` (use a system browser) or `pnpm exec playwright install chromium`. With neither, Playwright fails with its install message.

Desktop:

- Rust toolchain.
- `tauri-driver`: `cargo install tauri-driver --locked`, with `~/.cargo/bin` on `PATH`.
- `WebKitWebDriver`: Arch `webkit2gtk-4.1`; Debian/Ubuntu `webkit2gtk-driver` (`webkitgtk-webdriver` on Ubuntu 26.04+).
- Linux (the run is always headless, see "Desktop runs on Linux"): `xvfb-run`, `dbus-run-session`, `dbus-send`, the AT-SPI daemons (`at-spi-bus-launcher`, `at-spi2-registryd` in `/usr/libexec` or `/usr/lib`) and `python3` with `gi.repository.Atspi`. Arch: `xorg-server-xvfb dbus at-spi2-core python-gobject`; Debian/Ubuntu: `xvfb dbus at-spi2-core python3-gi gir1.2-atspi-2.0`. No display is needed.
- Port 4444 free (tauri-driver's port).

A missing tool, AT-SPI daemon or AT-SPI Python bindings, or a busy port 4444 makes `pnpm e2e:desktop` fail with a message naming it. Web E2E likewise fails if port 4300 is already in use; it never reuses a running server.

## Headed runs

The configs read no headed env var. Web: run Playwright directly (after `nx build player`) with the flag:

```bash
CHROME_BIN=/usr/bin/chromium pnpm exec playwright test -c apps/player-e2e/targets/web/playwright.config.ts --headed
```

Desktop: on Linux the run is always headless (below), so there is no headed mode; the window lives on a private Xvfb display.

## Desktop runs on Linux

`targets/desktop/run-desktop-e2e.mjs` runs, from the workspace root, roughly the equivalent of the following (a sketch, not a recipe: the script also pins `node`/`python3`, strips more of the session's env, manages the process group and removes the private dir):

```bash
d="$(mktemp -d)" && mkdir "$d"/config "$d"/data "$d"/cache "$d"/state && \
env -u WAYLAND_DISPLAY -u AT_SPI_BUS_ADDRESS -u DBUS_SESSION_BUS_ADDRESS -u XDG_SESSION_TYPE \
  -u XDG_CURRENT_DESKTOP -u XDG_SESSION_DESKTOP -u PULSE_SERVER -u PIPEWIRE_REMOTE -u GTK_MODULES \
  -u SSH_AUTH_SOCK -u HYPRLAND_INSTANCE_SIGNATURE \
  XDG_RUNTIME_DIR="$d" XDG_CONFIG_HOME="$d/config" XDG_DATA_HOME="$d/data" \
  XDG_CACHE_HOME="$d/cache" XDG_STATE_HOME="$d/state" GSETTINGS_BACKEND=memory \
  GDK_BACKEND=x11 GIO_USE_VFS=local GVFS_DISABLE_FUSE=1 QSPIDER_E2E_PRIVATE_SESSION=1 \
  xvfb-run -a dbus-run-session -- apps/player-e2e/targets/desktop/atspi/with-a11y-bus.sh \
  wdio run apps/player-e2e/targets/desktop/wdio.conf.ts [args]
```

Nothing in the run may touch your desktop session or your home, so the layers nest outside-in:

- `xvfb-run -a` is the outermost layer: everything inside sees only its virtual `DISPLAY`. `WAYLAND_DISPLAY` is removed and `GDK_BACKEND=x11` set, so GTK uses Xvfb even on a Wayland desktop: no window appears on your screen.
- A fresh private dir (0700, removed when the run ends) covers the whole tree: the private bus, the services it activates (dconf, portals), wdio and the app. It is `XDG_RUNTIME_DIR`, and `XDG_CONFIG_HOME`, `XDG_DATA_HOME`, `XDG_CACHE_HOME` and `XDG_STATE_HOME` point at subdirectories of it. `GSETTINGS_BACKEND=memory` keeps settings out of dconf. So nothing writes `~/.config/dconf/user`, `~/.local/share/recently-used.xbel` or the like. `wdio.conf.ts` still sets its own per-run `XDG_DATA_HOME`/`XDG_CONFIG_HOME`/`XDG_CACHE_HOME` for tauri-driver and the app, which take precedence. Every variable that points at the desktop session is removed: `AT_SPI_BUS_ADDRESS`, `DBUS_SESSION_BUS_ADDRESS`, `XDG_SESSION_TYPE`, `XDG_CURRENT_DESKTOP`, `XDG_SESSION_DESKTOP`, `PULSE_SERVER`, `PIPEWIRE_REMOTE`, `GTK_MODULES`, `SSH_AUTH_SOCK` and `HYPRLAND_INSTANCE_SIGNATURE` (and `WAYLAND_DISPLAY`, above). Version-manager shims would read their state from the replaced XDG dirs, so `node` and `python3` are pinned (symlinked in the private dir) to the interpreters resolved with the real env. `GIO_USE_VFS=local` and `GVFS_DISABLE_FUSE=1` keep gvfs from mounting anything.
- `dbus-run-session` gives the run a private session bus.
- `atspi/with-a11y-bus.sh` starts the AT-SPI accessibility bus and registry on that bus. A bare `dbus-run-session` can't activate them (D-Bus would ask systemd), so the script starts `at-spi-bus-launcher --launch-immediately` and `at-spi2-registryd` itself, from `/usr/libexec` on Debian/Ubuntu or `/usr/lib` on Arch, and exits 1 naming a missing one. It fails closed: it refuses to run (exit 1) without `QSPIDER_E2E_PRIVATE_SESSION=1`, when `DBUS_SESSION_BUS_ADDRESS` is unset or is the desktop bus (`/run/user/$UID/bus`), or when `org.a11y.Bus` already has an owner. The daemons run without `DISPLAY`, so they can't publish `AT_SPI_BUS` on any X server, and with their own runtime dir. The script polls until the bus and then the registry answer, runs the command, then stops the two daemons it started (TERM, then KILL after about 2s) and exits with the command's status. The daemons' output goes to `artifacts/desktop/a11y-bus.log`, which is copied before any KILL. The AT-SPI bus lets tests drive native GTK dialogs (the file picker) from Python.
- The runner starts the tree in its own process group. On Ctrl-C (or TERM/HUP) it passes the signal to the whole group and exits with `128+n`. When the child exits, normally or not, it TERMs what is left of the group (for example, services the private bus activated), waits up to 30s, then KILLs, and only then removes the private dir.

Trade-off: the tree is a separate process group, so the terminal's Ctrl-C reaches it only through the runner. If the runner itself is SIGKILLed (or crashes), nothing forwards signals or cleans up: Xvfb, the private buses, wdio, tauri-driver and the app can be orphaned, and the private dir under `$TMPDIR` (`qspider-e2e-runtime-*`) stays behind. Find them by that process group (`ps -o pid,pgid,cmd`) and kill that group, not processes by name.

On Windows and macOS the script runs `wdio run …` directly. CI runs plain `pnpm e2e:desktop`.

Don't rebuild that environment by hand. To run part of the suite, pass wdio arguments through the runner: `pnpm e2e:desktop --spec apps/player-e2e/scenarios/core-flow.scenario.ts`, or, with the E2E binary already built, `node apps/player-e2e/targets/desktop/run-desktop-e2e.mjs --spec …`. To inspect the dialog's accessibility tree, temporarily call `dialog.py dump` from a scenario run this way; `dialog.py` refuses to run outside the runner's session.

## Failure artifacts

All under `apps/player-e2e/artifacts/`:

- Web: `web/` (screenshots, traces) and `web-report/` (HTML report).
- Desktop: `desktop/` (per failed scenario: `<test-name>.png` screenshot and `<test-name>.html` page source with the webview URL; on a failed run: `tauri-driver.log`; `wdio-logs/`; on Linux, `a11y-bus.log` from the AT-SPI daemons).

## CI and branch protection

Workflows: `.github/workflows/checks.yml` (every PR) and `.github/workflows/desktop-build.yml` (build-only on Linux, Windows and macOS; path-filtered). Branch protection, by the names GitHub shows in the checks list:

- Required checks on `main` (ruleset "main"): `frame`, `rust`, `e2e-web`, `e2e-desktop`.
- Not required: `build-desktop (…)` (the `desktop-build.yml` matrix jobs). The workflow is path-filtered, so a required check would block PRs where it never runs.
