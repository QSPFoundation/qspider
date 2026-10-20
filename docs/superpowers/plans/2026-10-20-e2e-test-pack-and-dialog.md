# E2E Test Pack and Native Dialog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:**

- The desktop player can start from a `game.cfg` listing several games, and handles it like the web multi-game import: all games go on the shelf, a notice shows, and no game starts.
- The E2E suite loads one shared test pack on both targets.
- Desktop E2E opens game files through the real native "Open game" dialog, driven by AT-SPI.

**Architecture:**

- **Product (`libs/desktop`, `apps/player-desktop`):** a `game.cfg` launch, drop or dialog choice imports every `[[game]]` entry. Several entries mean all go on the shelf, a "N games added" notice shows, and nothing starts.
- **Test pack:** `apps/player-e2e/fixtures/game.cfg` lists the fixture games. Desktop launches with it; web uploads it as a zip built at test setup.
- **`OperatePlayer`:** gains `loadTestPack`. `openGameFile` becomes "open through the player's Open game control":
  - web: the file input;
  - desktop: the native GTK dialog through AT-SPI (`targets/desktop/atspi/dialog.py`).
- **Desktop runner:** on Linux, desktop E2E always runs inside `dbus-run-session`, then an accessibility-bus wrapper, then `xvfb-run`, with GTK on X11.

**Tech Stack:** Tauri 2, TypeScript, Serenity/JS 3.49, WebdriverIO 9 + tauri-driver, Playwright 1.64, AT-SPI 2 via Python GObject (`gi.repository.Atspi`), Xvfb, `fflate` (zip for the web pack).

**Specs:**

- Conventions, binding for all E2E code: `docs/superpowers/specs/2026-10-20-e2e-conventions-design.md`.
- This change was agreed in chat on 2026-10-20 (multi-game config "similar to multi-game import"; native dialog via AT-SPI, "fold in").

**Reference implementation:** local branch `spike/desktop-dialog-atspi` (commits `ac332ab`, `b1af533`), proven 3/3 locally:

- `apps/player-e2e/targets/desktop/atspi/dialog.py` (driver);
- `atspi/with-a11y-bus.sh` (bus wrapper);
- `targets/desktop/native-dialog.ts`, `operate-desktop-player.ts`;
- `scenarios/open-dialog.scenario.ts`.

Read them with `git show spike/desktop-dialog-atspi:<path>`. Don't copy its committed `__pycache__/`.

## Global Constraints

- **E2E conventions** (README Rules, `apps/player-e2e/README.md`) bind all E2E code, and lint enforces them (`pnpm nx lint player-e2e`).
- **Locating:** controls only via `data-qsp*` markers, roles, or `data-qa` hooks (app-shell UI).
- **Desktop multi-game behaviour must match web** (`apps/player/src/app/open-game-button.tsx`):
  - more than 1 imported entry → add all to the shelf, show the notice `{{ count }} games added to shelf` (same i18n key), start nothing;
  - exactly 1 → start it;
  - 0 → error.
- **Unchanged:** existing single-file and `.zip` behaviour on desktop.
  - Deviation (final review): desktop launch, drop and Open game now share the web's decision (`addImported`, `libs/game-shelf`), so a multi-game `.zip` launched with or dropped on desktop puts its games on the shelf instead of starting the first one. A `.cfg` other than `game.cfg` is now an error instead of a single-file import.
- **Nothing test-only in release builds.**
  - The startup marker (`startupFinished$`, `StartupMarker`, `data-qa="startup-finished"`) exists for automation, like the `data-qa` hooks, and ships in release builds as harmless hidden markup; it changes no behaviour.
- **Desktop E2E on Linux always runs headless** under Xvfb, with an AT-SPI bus and registry started explicitly (no systemd activation in a bare session), `WAYLAND_DISPLAY` unset and `GDK_BACKEND=x11`.
- **AT-SPI binary paths differ per distro:** Arch uses `/usr/lib/at-spi-bus-launcher` and `/usr/lib/at-spi2-registryd`; Ubuntu uses `/usr/libexec/…`.
- **Prerequisites fail loudly and are named:** a missing tool is never a silent skip.
- **Script and CI job names stay the same** (`e2e:web`, `e2e:desktop`, `check`, `check:full`; `e2e-web`, `e2e-desktop`).
- **Verification:**
  - local web: `CHROME_BIN=/usr/bin/chromium`;
  - local desktop: `PATH="$HOME/.cargo/bin:$PATH" pnpm e2e:desktop`, which wraps itself, so no manual `xvfb-run`;
  - `pnpm check` exits 0 after every task, and `pnpm check:full` at the end.

## Plan decisions (check these)

- **D1. The test pack is `apps/player-e2e/fixtures/` itself.** `fixtures/game.cfg` lists:
  - `e2e-game.qsps`, titled `E2E game`;
  - a second game, `second/game.qsps`, titled `Second game`, a copy of `test-assets/multi-game-archive/second/game.qsps`.

  The single-file fixture `fixtures/e2e-game.qsps` keeps serving single-file opens, where the shelf title is the file name `e2e-game.qsps`.

- **D2. The web pack zip is built at test setup** with `fflate`, in the Playwright `globalSetup`, into `apps/player-e2e/artifacts/test-pack.zip`. It is not committed.
- **D3. `OperatePlayer` methods:** `startPlayer`, `loadTestPack`, `openGameFile(path)`.
  - Web `openGameFile` uses the file input.
  - Desktop `openGameFile` clicks `[data-qa="open-game"]` and drives the native dialog.
  - The spike's separate `openGameViaDialog` merges into `openGameFile`.
  - The desktop launch-fixture guard is removed.
- **D4. Linux desktop wrapping lives in a launcher script** (`targets/desktop/run-desktop-e2e.mjs`) called by `e2e:desktop`. CI's `xvfb-run -a pnpm e2e:desktop` becomes `pnpm e2e:desktop`.

## Review Focus

1. **A `game.cfg` with entries whose files are missing:** the import must still fail clearly, not leave half-added games. Pinned in Task 1 with a unit test.
2. **Desktop launch with the pack:** it must not auto-start a game. A scenario that expects the shelf must not be satisfied by a started game. Pinned in Task 3: the pack scenario checks that the shelf shows exactly both titles.
3. **The AT-SPI bus failing to start on CI** (Ubuntu paths): it must fail with a named prerequisite, not a 15s dialog timeout. Pinned in Task 2 (wrapper and prereqs).
4. **A dialog that rejects the path:** fails fast with "did not accept <path>" (proven in the spike). Pinned in Task 3 by a one-off check.
5. **Leftover pack games between scenarios:** each scenario still starts from wiped app data (`restartAppWithEmptyData`), and the pack reloads on every launch. Covered because the pack scenario checks the exact shelf list.

---

### Task 1: Desktop imports a multi-game `game.cfg`

**Files:**

- Modify:
  - `libs/desktop/src/lib/desktop-importer.ts`
  - `libs/desktop/src/lib/shell.ts` (dialog filter: add `cfg`)
  - `apps/player-desktop/src/app/utils.ts` (supported types: add `.cfg`)
  - `apps/player-desktop/src/app/init.ts` (launch)
  - `apps/player-desktop/src/app/app.tsx` (drop)
  - `apps/player-desktop/src/app/open-game-button.tsx` (add `data-qa="open-game"`; its multi-entry branch already matches web)
- Create: `libs/desktop/src/lib/config-entries.ts`, `libs/desktop/src/lib/config-entries.spec.ts`

**Interfaces:**

- Produces (`config-entries.ts`):
  ```ts
  export function entriesFromConfig(
    config: PlayerConfig,
    urlPrefix: string,
    fileDir: string,
    localId: string,
  ): GameShelfEntry[]; // one entry per [[game]], loadConfig = { url: urlPrefix, entrypoint: game.file, local_path: fileDir, local_id: localId }
  ```
  It maps the same fields as the existing single-entry branch in `desktop-importer.ts`, so that branch is refactored to use it.
- `importDesktop(filePath)`: when the file name is `game.cfg`, parse it and return `entriesFromConfig(...)` for **all** entries. If there are none, throw `Error('No games listed in game.cfg')`.
- Launch and drop use one shared helper (e.g. `addImported(imported, t)` in `apps/player-desktop/src/app/`), with the rule from Global Constraints. `init.ts` and `app.tsx` both use it.

- [ ] **Step 1: Failing unit tests** in `config-entries.spec.ts`:
  - two `[[game]]` → two entries with each `id`, `title` and `entrypoint`, the shared `local_path`/`local_id`, and the `url` prefix;
  - icon resolved against `urlPrefix`;
  - zero games → `[]`.

  Run `pnpm exec vitest run --project desktop`. Expected: FAIL (module missing).

- [ ] **Step 2: Implement `entriesFromConfig`** and refactor `desktop-importer.ts` to use it. Add the `game.cfg` branch and the shared add/notice/start helper, plus `.cfg` in the supported types and dialog filter. Tests PASS.
- [ ] **Step 3: Verify:**
  - `pnpm nx run-many -t lint typecheck -p desktop player-desktop`;
  - `CHROME_BIN=/usr/bin/chromium pnpm check` exits 0. Desktop E2E is unchanged; the launch argument is still the single fixture.
- [ ] **Step 4: Commit** `feat(desktop): open multi-game game.cfg like the web multi-game import`

---

### Task 2: Headless Linux desktop runner with an AT-SPI bus

**Files:**

- Create:
  - `apps/player-e2e/targets/desktop/atspi/with-a11y-bus.sh` (from the spike; locate the launcher and registry under `/usr/lib` or `/usr/libexec`, and exit 1 naming the missing binary);
  - `apps/player-e2e/targets/desktop/run-desktop-e2e.mjs`.
- Modify:
  - `targets/desktop/prereqs.ts` (+ its spec);
  - root `package.json` (`e2e:desktop`);
  - `.github/workflows/checks.yml` (e2e-desktop job: apt packages, drop `xvfb-run`);
  - `.gitignore` (`__pycache__/`);
  - `apps/player-e2e/README.md` (running desktop E2E, prerequisites).

**Interfaces:**

- `run-desktop-e2e.mjs [wdio args…]`:
  - on Linux, it runs `dbus-run-session -- <with-a11y-bus.sh> xvfb-run -a wdio run apps/player-e2e/targets/desktop/wdio.conf.ts [args]` with `WAYLAND_DISPLAY` removed and `GDK_BACKEND=x11` set, and returns its exit code;
  - on other platforms, it runs `wdio run …` directly.
- `"e2e:desktop": "node apps/player-e2e/targets/desktop/check-prereqs.ts && nx run player-e2e:build-desktop-e2e && node apps/player-e2e/targets/desktop/run-desktop-e2e.mjs"`.
- `findMissingPrereqs` (Linux) checks `tauri-driver`, `WebKitWebDriver`, `xvfb-run`, `dbus-run-session`, and `python3` with `gi.repository.Atspi`. The last is checked through an injected `canImportAtspi()` so it stays testable.
- The display prerequisite is dropped on Linux, because Xvfb provides the display.
- CI apt additions: `at-spi2-core`, `python3-gi`, `gir1.2-atspi-2.0`, `dbus` (on top of `webkit2gtk-driver`, `xvfb`).

- [ ] **Step 1: Update the prereqs tests first.** Missing `xvfb-run`, `dbus-run-session` and Atspi are each named on Linux, and DISPLAY is no longer required. Run `vitest --project player-e2e`. Expected: FAIL.
- [ ] **Step 2: Implement** the prereqs, the wrapper and the launcher. Tests PASS.
- [ ] **Step 3: Verify:**
  - `PATH="$HOME/.cargo/bin:$PATH" pnpm e2e:desktop` passes the existing suite (4 passing, 1 skipped) with no window on your screen;
  - temporarily point the wrapper at a nonexistent launcher path → exit 1, naming it; revert;
  - run actionlint on `checks.yml`.
- [ ] **Step 4: Commit** `test(e2e): run desktop e2e headless with an accessibility bus`

---

### Task 3: Test pack, native dialog, scenarios

**Files:**

- Create:
  - `apps/player-e2e/fixtures/game.cfg`, `fixtures/second/game.qsps` (D1);
  - `fixtures/test-pack.ts` (titles, paths);
  - `targets/web/global-setup.ts` (zip, D2);
  - `targets/desktop/atspi/dialog.py`, `targets/desktop/native-dialog.ts` (from the spike);
  - `screenplay/shelf/elements.ts` `OpenGameButton`.
- Modify:
  - `screenplay/support/operate-player.ts` (D3);
  - `targets/web/operate-web-player.ts`, `targets/desktop/operate-desktop-player.ts`;
  - `targets/desktop/wdio.conf.ts` (launch argument = `fixtures/game.cfg`);
  - `targets/web/playwright.config.ts` (`globalSetup`);
  - `screenplay/game/tasks.ts` (`OpenFixture` → load pack and open the e2e game from the shelf);
  - `screenplay/shelf/checks.ts` (`SeeShelfIncludes(title)`);
  - `scenarios/core-flow.scenario.ts`.
- Delete: `targets/desktop/launch-fixture.ts` and its spec.
- Add devDep: `fflate`.

**Interfaces:**

```ts
// fixtures/test-pack.ts
export const TEST_PACK: { configPath: string; zipPath: string; titles: readonly ['E2E game', 'Second game'] };
// screenplay/support/operate-player.ts
abstract loadTestPack(actor): Promise<void>; // web: upload TEST_PACK.zipPath via the file input; desktop: nothing (launched with it)
abstract openGameFile(actor, path): Promise<void>; // web: file input; desktop: click Open game + native dialog
export const LoadTestPack: () => Interaction;
// screenplay/shelf/checks.ts
export const SeeShelfIncludes: (title: string) => Task; // seeEventually: shelf titles include `title`
```

**Scenarios** (`core-flow.scenario.ts`, both targets unless tagged):

- `loading a game config adds all its games to the shelf without starting one`: `StartPlayer`, `LoadTestPack`, `SeeShelfTitles([...TEST_PACK.titles])`.
- `opening a game file starts it and adds it to the shelf`: `StartPlayer`, `OpenGameFile(E2E_GAME.path)`, `SeeGameStarted`, `ReturnToShelf`, `SeeShelfIncludes('e2e-game.qsps')`. It replaces the webOnly/desktopOnly pair; desktop now goes through the real dialog.
- The 3 gameplay scenarios: `OpenFixture()` now means `StartPlayer`, `LoadTestPack`, `OpenFromShelf('E2E game')`, `SeeGameStarted`. Their bodies are otherwise unchanged.

- [ ] **Step 1: Write the scenarios above.** Run `pnpm e2e:web`. Expected: FAIL (missing pack and interactions).
- [ ] **Step 2: Implement** the pack, `globalSetup`, ability changes, AT-SPI driver, launch argument and checks. Remove the launch-fixture guard.
- [ ] **Step 3: Verify:**
  - web passes (5 scenarios);
  - desktop passes (5), 3 runs in a row;
  - break only "loading a save…" → only it fails, on both targets;
  - a nonexistent path in `OpenGameFile` on desktop → "did not accept <path>" within about 10s (Review Focus 4);
  - revert each temporary change;
  - `CHROME_BIN=/usr/bin/chromium PATH="$HOME/.cargo/bin:$PATH" pnpm check:full` exits 0.
- [ ] **Step 4: Commit** `test(e2e): shared test pack and native desktop open dialog`

---

### Task 4: Docs

**Files:** `apps/player-e2e/README.md`, `docs/superpowers/specs/2026-10-20-e2e-conventions-design.md`, `CLAUDE.md` (only if a command changed).

- [ ] **Step 1: README:**
  - the test pack and how each target loads it;
  - `openGameFile` per target (file input versus native dialog through AT-SPI);
  - the Linux runner chain and why: no systemd activation, X11 for GTK, `xdotool` rejected as fragile;
  - the AT-SPI quirks (Open-button clicks are ignored, so the entry is activated, up to 3 times);
  - Windows later uses UI Automation behind the same method;
  - desktop "only the launch fixture" text removed.
- [ ] **Step 2: Spec amendment** (Target differences): desktop opens files through the native dialog, and both targets load one shared test pack.
- [ ] **Step 3: Verify.** `pnpm format:check`, and grep the README for stale `launch fixture` wording.
- [ ] **Step 4: Commit** `docs(e2e): test pack, native dialog and headless desktop runner`
