# E2E Test Conventions — Design

Date: 2026-10-20
Status: draft for review

## Intent

Phase 1 of the automated checks (`2026-10-20-automated-checks-design.md`) added four core-flow tests on web (Playwright) and desktop (WebdriverIO + tauri-driver). Its layout was fine for a first run: two framework-specific helper files (`web/player.ts`, `desktop/player.ts`) and two test files. It will not survive growth. Phase 2 adds many more flows (open routes, archives, saves, settings, themes, sound, standalone), and the helper files would turn into thousands of utility functions that mix looking things up with checking them, duplicated per framework.

This design sets the rules for how E2E tests are written and organised from now on. Agents and the maintainer must be able to tell, without asking:

- where a new element, action or check goes;
- when to create a new group and when to extend an existing one;
- how a test runs on both targets;
- how themes are covered.

Phase 2 scenarios are written under these rules.

## Background: the spike

A spike on branch `spike/serenity-js` (commit `0ca5c72`, local, not pushed) ported all four core-flow tests to Serenity/JS Screenplay. One shared file held the elements, tasks, checks and scenarios. Two thin entry files covered web (`@serenity-js/playwright-test`) and desktop (`@serenity-js/webdriverio` with mocha, reusing the existing tauri-driver config and fresh-app-per-test setup).

Results:

- **Coverage:** all 4 scenarios pass on web and on desktop (desktop 3 runs in a row, about 9.5s per run).
- **Independence:** breaking one scenario fails only that scenario on both targets. Failure messages are clear (`Expected … to eventually equal "ROOM counter=2"`, `Received string: ROOM counter=1`).
- **Size:** 184 lines in place of 394 for the current two-framework version.

Problems the spike found (each becomes a rule below):

1. **Desktop waiting trap.** Serenity's WebdriverIO adapter does not retry WebKitWebDriver's `no such element` response (empty message), so `Ensure.eventually` on an element that is not rendered yet fails at once with `[object Object]`. An explicit `Wait.until(element, isPresent())` first avoids it. Possibly a Serenity bug, still to be reported.
2. **Hidden elements.** Playwright's role locators skipped hidden elements implicitly; Serenity's do not. Lookups must filter to visible elements.
3. **Hidden errors.** With WebdriverIO's spec reporter alone, desktop failures print "Unknown error". `@serenity-js/console-reporter` is needed to see what failed.
4. **No file upload.** `@serenity-js/web` has no file-upload interaction. On web it needs the native Playwright page.
5. **Packaging.** `mocha` must be a direct dev dependency (pnpm) for `@serenity-js/mocha`.

The spike's single shared file is the shape this design replaces.

## Goals

1. One scenario definition runs on web and desktop. A target difference is written once, in one place.
2. Every file has one job, and its location follows from a rule, not from judgement.
3. Doing (tasks) and checking (checks) never mix.
4. Tests survive themes and translations: the same elements work under every theme and language.
5. The rules are enforced by lint where possible, not by comments.
6. Failures name the scenario file and line, and show the failing step in plain words.

## Non-goals

- Visual / pixel comparison of themes.
- Unit-test conventions. Unit tests are phase 4 of the automated-checks design.
- Choosing the phase 2 scenario list. The maintainer approves it separately; this design only says how scenarios are written.

## Anti-goals

- **A junk drawer by another name.** A single helpers file, or an area that holds everything, is the failure this design exists to prevent.
- **Tests that pass while behaviour is wrong.** Assertions are about what the player sees.
- **Flaky tests.** No retries, no fixed sleeps.
- **Our own framework.** Serenity's own mechanisms (abilities, Casts, tasks, questions) are used as documented rather than wrapped in a homemade layer.

## Decided by the maintainer

- Serenity/JS Screenplay over both runners: `@serenity-js/playwright-test` for web, `@serenity-js/webdriverio` (mocha) for desktop. This reverses phase 1's "two thin test files, no shared layer". The spike showed the shared layer works on both targets and removes the per-framework duplication.
- **Areas are places in the UI where the player can be**, not source folders.
- **Themes are a dimension, not an area.**
- **Target differences live in an abstract Serenity ability** (`OperatePlayer`) with one subclass per target, handed out by each runner's Cast. This is Serenity's documented pattern, the same one `BrowseTheWeb` uses.
- **Single-target scenarios are tagged**, not kept in separate files.
- **First change: migrate the four core flows only.** The theme rules (fixture variants via `game.cfg`, `forEachTheme`, `themes.scenario.ts`) are part of the conventions, but the machinery is built with the phase 2 scenario list, not in this change.
- **Replace outright.** The migration deletes the phase 1 tests in the same change:
  - `web/`, `desktop/player.ts`, `desktop/core-flow.e2e.ts`, `shared/core-flow.ts` (its constants move to `fixtures/`/`shared/` as the new layout needs);
  - the old configs move into `targets/`.

  No side-by-side period. The `e2e:web` / `e2e:desktop` / `check` / `check:full` scripts and the CI job names stay the same, and point at the new layout.

## Design

### Layout

```
apps/player-e2e/
  scenarios/                    # the tests, one file per feature; run on both targets
    core-flow.scenario.ts
  screenplay/
    <area>/                     # one folder per place in the UI (see "Areas")
      elements.ts               # element definitions only
      tasks.ts                  # what the player does
      checks.ts                 # what the player expects to see
    common/                     # elements that appear in more than one area
    support/                    # the few shared primitives (below)
    themes/<theme>/             # exception only (see "Themes")
  targets/
    web/                        # Playwright config, Cast, OperateWebPlayer, scenario shim
    desktop/                    # WDIO config, Cast, OperateDesktopPlayer, scenario shim,
                                # fresh-app, prereqs, check-prereqs
  fixtures/                     # test games
  shared/                       # constants used by fixtures and scenarios
```

`support/` holds exactly these, and new entries need a reason:

- `OperatePlayer`: the abstract ability.
- `scenario()`: the test-definition shim, with `.webOnly` / `.desktopOnly` tags.
- `seeEventually()`: the one wait-then-read check primitive.
- `visible()`: the visible-only lookup.
- Fixture helpers.

### Areas

An **area** is a place in the UI where the player can be: a screen (shelf, game) or an overlay on it (pause menu, saves panel, settings). The test: can you name where the player is looking with one noun?

Initial areas, taken from the spike:

- `shelf/`: shelf, cards, titles, empty notice. Tasks: open from shelf. Checks: shelf titles.
- `game/`: main text, actions. Tasks: click action, reach counter, return to shelf. Checks: main text.
- `pause/`: the pause menu and its controls.
- `saves/`: the save slots panel. Tasks: choose slot. Checks: slot empty.
- `common/`: the dialog frame and other shared UI.

Placement rules:

- **Element:** goes in the area where it is visible. If it is visible in more than one area, it goes in `common/`.
- **Task:** goes in the area where the player starts it. `ReturnToShelf` starts in the game, so it lives in `game/`, even though it passes through the pause menu.
- **Check:** goes in the area that shows what is being checked.
- **New area:** create one when a new screen or overlay appears, or when an area's file hits the size limit and a natural sub-place can be split out.
- **Never an area per feature.** "Quick save" and "themes" are scenarios that use tasks from the places they touch.

### Files: one job each

- **`elements.ts`:** element definitions (`PageElement` / `PageElements`) and nothing else. It is the only place selectors (`By.*`) appear.
- **`tasks.ts`:** `Task`s and `Interaction`s, meaning things the player does. Never asserts. It may wait for the UI to settle after its own action (e.g. "dialog closed after choosing a slot").
- **`checks.ts`:** things the player expects to see. It is the only place `Ensure` is used, always through `seeEventually()`.
- **Size limit:** about 150 lines per file. Past it, split along places.

### Naming

- Elements are nouns: `SaveSlot`, `MainText`.
- Tasks are verb phrases: `SaveToSlot`, `ReturnToShelf`, `OpenGameFile`.
- Checks start with `See`: `SeeMainText`, `SeeShelfTitles`, `SeeSlotEmpty`.
- Scenario files are named for the feature: `saves.scenario.ts`.
- Scenario titles state behaviour: `loading a save restores the saved state`.

### Locating elements: the theme contract

- **Controls and panels are located only by the theme contract:** the renderer's `data-qsp="…"` markers on `qsp-*` building blocks (`main-content`, `actions-list`, save-slot attributes, …) and ARIA roles.
- **Never by visible text, CSS classes, nesting or layout.** Themes and translations (`<qsp-t>`) change all of those. The phase 1 tests and the spike break this rule: "Quit", "Save"/"Load", "Run" and "Game shelf is empty" are found by English text. Migrating to these conventions fixes that.
- **Text is only for checking content the game writes** (`ROOM counter=1`), or content the scenario controls, such as fixture titles.
- **Missing markers:** if a control has no marker or role, add a `data-qsp` marker in the renderer (or a role, where it is accessible markup anyway). Do not use a fragile selector. These markers are the contract themes already rely on.
- **Visible only:** every lookup that can match hidden duplicates goes through `visible()`. This comes from spike problem 2.

### Checks and waiting

- **One way to check:** every check goes through `seeEventually(element, question, expectation)`. It waits for the element to be present, then `Ensure.eventually` on the answer. This contains the desktop waiting trap (spike problem 1) in one function. The trap is also reported upstream; if Serenity fixes it, only this function changes.
- **No waiting tricks:** no fixed sleeps (`Wait.for(duration)`) and no retries (Playwright `retries: 0`; WDIO `specFileRetries: 0`, mocha `retries: 0`).
- **Fail fast on errors:** the error-alert guard from phase 1 ("fail fast with the player's error text") stays as one shared check in `common/`. Tasks that open games use it.

### Target differences: `OperatePlayer`

- **The abstraction:** `support/operate-player.ts` defines `abstract class OperatePlayer extends Ability`, with one method per capability that differs per target: `openGameFile(actor, path)`, `restartApp(actor)`, and more as needed.
- **One interaction per capability** wraps it (e.g. `OpenGameFile(path)`). Shared code only ever calls `OperatePlayer.as(actor)`.
- **Two subclasses:**
  - `targets/web/operate-web-player.ts` (`OperateWebPlayer`) uses the native Playwright page, e.g. for file upload (spike problem 4).
  - `targets/desktop/operate-desktop-player.ts` (`OperateDesktopPlayer`) launches the app with the test pack's `game.cfg` as its argument, restarts it through a new session, and opens game files through the native Open game dialog, driven through AT-SPI (`targets/desktop/native-dialog.ts`, `atspi/dialog.py`). Windows later uses UI Automation behind the same `openGameFile`.
- **One shared test pack:** both targets load `fixtures/game.cfg` (two games). Web zips it in `global-setup.ts` and uploads it through the Open game input; desktop gets the config as its launch argument.
- **Desktop E2E runs headless and isolated on Linux:** `run-desktop-e2e.mjs` runs the tree under Xvfb with a private D-Bus session and AT-SPI bus, private XDG directories and no writes to the real session or home. `xdotool` was rejected as fragile (focus, keystrokes, layout).
- **Wiring:** each runner's Cast gives every actor its web-browsing ability plus its `OperatePlayer` subclass.
- **Compile-checked:** adding a method to `OperatePlayer` does not compile until both targets implement it.

### Scenarios

- **Real test files:** `scenarios/*.scenario.ts` call `scenario(title, async (actor) => …)` from `support/`. Each runner provides an implementation that maps it to its own `it`: Playwright Test's `it` with the `actor` fixture, or mocha's `it` with `actorCalled(...)`. Failures point at the scenario file and line.
- **Single-target scenarios** use `scenario.webOnly(...)` or `scenario.desktopOnly(...)`. They are reported as skipped on the other target, never silently absent.
- **Independent:** every scenario starts from a clean app (web: fresh browser context; desktop: fresh app process with wiped app data, as in phase 1). It sets up what it needs through tasks.
- **Contents:** scenarios contain only tasks, checks and constants. No selectors, no `Ensure`, no framework imports.

### Themes

- **A dimension, not an area.** Areas and elements are the same under every theme, because elements use only the theme contract.
- **The fixture chooses the theme**, not scenario code. A game selects its theme through `game.cfg` (`defaultTheme = "…"`, plus `themes = [...]` for game-provided theme files), as `test-assets/qspider/game.cfg` does. A theme variant of a fixture is therefore the fixture game plus a `game.cfg`.
  - Web imports a single uploaded file, so variants that need a `game.cfg` are opened as a `.zip`.
  - Desktop reads `game.cfg` next to the launched file.
  - Scenarios open a variant via a fixture helper (e.g. `OpenGameFile(fixture({ theme: 'aero' }))`).
- **`forEachTheme(themes, title, body)`** runs a scenario once per theme without copying it. The core flows should run under default, `aero`, `classic` and one custom theme; the exact matrix is chosen with the phase 2 scenario list.
- **Theme features** (switching, CSS variables, game-provided themes) are scenarios in `themes.scenario.ts`.
- **The exception:** UI a theme renders outside the `qsp-*` vocabulary gets elements under `screenplay/themes/<theme>/`. If that folder starts to grow, it signals a missing building block in the theme contract.

### Lint enforcement

ESLint rules scoped to `apps/player-e2e` (`no-restricted-imports` / `no-restricted-syntax`):

- **`scenarios/**`:** no imports from `@playwright/test`, `webdriverio`, `@wdio/*`, `@serenity-js/playwright*`, `@serenity-js/webdriverio`, `@serenity-js/web`, or `targets/**`.
- **Outside `checks.ts` and `support/`:** no `Ensure` / `Ensure.eventually`.
- **Outside `elements.ts`, `common/` and `support/`:** no `By.*`.
- **Inside `elements.ts`:** `By.css` selectors must target `[data-qsp…]` or a role. This is a best-effort `no-restricted-syntax` check on string literals.
- **`screenplay/**`:** no imports from `targets/**`, Playwright or WebdriverIO.
- **Everywhere in `apps/player-e2e`:** no `Wait.for(` (fixed sleeps).
- **Size:** `max-lines` of about 150 for files under `screenplay/**`.
- **Promises:** `@typescript-eslint/no-floating-promises` and `@typescript-eslint/no-misused-promises` (type-aware) for all of `apps/player-e2e`. Without them, a missing `await` on `actor.attemptsTo(...)` lets a scenario finish before its steps run, so it passes without checking anything. There is no Serenity/JS ESLint plugin on npm (checked 2026-10-20), so these generic rules plus the restrictions above are the enforcement.

### Tooling

- Add `@serenity-js/console-reporter` to the desktop crew so failures are readable (spike problem 3), and to web as well, for the same readable step trace.
- `mocha` stays a direct dev dependency (spike problem 5).
- Failure artifacts stay under `apps/player-e2e/artifacts/`:
  - Playwright traces and screenshots;
  - desktop screenshots, page source and tauri-driver log;
  - no archived Serenity report: only the console reporter's output is used (in the runner's log), as decided during implementation (controller ruling R8).
- Desktop keeps phase 1's infrastructure unchanged: one tauri-driver per run, fresh app per test, the port and driver guards, the prerequisite check before the build.

## Calls made while writing this (Claude's — check these)

- **Text lookups go during the migration.** Every text-based lookup of a control is removed as part of it. Where a control has no `data-qsp` marker or role, the marker is added in the renderer (`libs/renderer`). These are small, additive attributes in production code, on the contract themes already use.
- **Lint rules are errors from the start**, scoped to the new layout (`scenarios/`, `screenplay/`, `targets/`). The phase 1 files are deleted in the same change, so nothing needs excluding.
- **Where the rules live:**
  - the conventions are written into `apps/player-e2e/README.md`, as a short rules section with the placement table;
  - root `CLAUDE.md` points agents to it;
  - this design doc stays as the rationale.

## Left to the builder

- Exact signatures of `seeEventually`, `visible`, `scenario`, `forEachTheme` and the fixture helpers.
- How the `scenario()` shim picks the runner's implementation: a module alias per runner config or a runtime switch.
- The ESLint rule syntax, and which rules can only be best-effort.
- Which missing `data-qsp` markers or roles to add to the renderer while removing text-based lookups.
- Filing the upstream Serenity/JS issue for the WebKitWebDriver `no such element` handling.
