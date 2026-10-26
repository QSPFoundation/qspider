# Unit tests for pure functions, batch 3 (game-state) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** every pure function and inline pure block in `libs/game-state` has a unit test without mocks, and the defects found by the sweep are fixed. Engine, storage, audio and Tauri wiring stays E2E.

**Architecture:**

- `libs/game-state` gains Vitest with two projects:
  - `game-state`, a node project for `*.spec.ts`;
  - `game-state-browser`, which runs `*.browser.spec.ts` through the root `browserTest(name, include)` helper (Chromium; `CHROME_BIN=/usr/bin/chromium` locally).
- Pure logic in heavy files moves into small light files that import only types, `@qspider/utils`, `@qsp/converters` or other light game-state files. The heavy files then call them.
- Each heavy file's import chain is in the inventory.

**Tech Stack:** Vitest 5.0.5 (node + browser mode, Playwright provider), xoid, TypeScript, NX `@nx/vitest`.

**Spec:** `docs/superpowers/specs/2026-10-25-unit-tests-phase4-design.md`
**Inventory (file-by-file classes, line ranges, defects D1–D21, duplicates):** `docs/superpowers/plans/2026-10-26-game-state-inventory.md`

## Decided by the maintainer (2026-10-26)

- One PR for all of game-state.
- Fix every inventory defect except **D12** (`value || default`: 0 and `''` mean unset in QSP) and **D16** (the `prepareContent` `&gt` rewrite keeps QSP `& gt 'loc'` intact in exec links). Both get tests that pin them as intended.
- Each fix starts with a red test, then a `fix(...)` commit. Behaviour that only shows end to end (rendering, the menu callback order) also gets a red E2E.

## Global Constraints

- **No `vi.mock`, `vi.fn`, `vi.spyOn` or `vi.stubGlobal`.** Fake timers are the only test double. A plain function written in the test (a reader, an `isPanelVisible`, a callback that records calls) is an input, not a double.
- **No runtime import of a heavy module in a spec.** That means `qsp-api`, `@qspider/env`, Howler, `history/browser`, mousetrap, or anything that imports them. A spec may import only light files. Check every new light file's import chain.
- **Refactors are pure moves or extractions,** each in its own `refactor(game-state): …` commit before the test commit, with no player-visible change. Where copies differ, keep each copy's output; if one function can't, report it rather than change behaviour.
- **Tests use real inputs:** real `qspgui.cfg` lines, real theme HTML, real QSP command strings. Expected values are exact, with no snapshots. Each `it` names a behaviour.
- **Data tables are not tested.**
- **NX only:** `pnpm nx test game-state`, `pnpm nx typecheck game-state`, `pnpm nx lint game-state`, `pnpm format:check`. Before each commit, also run typecheck for every project that imports a moved symbol (renderer, game-shelf, the apps).
- **E2E:**
  - follow the `apps/player-e2e/README.md` Rules;
  - run web locally with `CHROME_BIN=/usr/bin/chromium pnpm e2e:web -g "<pattern>"` (no `--`), plus `pnpm e2e:standalone-web`;
  - desktop runs in CI only;
  - never touch `public/game/`;
  - the hostile menu in `game-html.qsps` is at its 8-action limit, so put new hostile rows in existing locations.
- **Git:** stage only the task's files; hooks run and are never bypassed (lint-staged lints each file with its project's ESLint config); no push until Task 10.

## Review Focus

1. **Style values a real game writes:**
   - `background-image:url(data:image/png;base64,…)` and `url(http://x/y.png)` keep the whole URL;
   - `--var:x` stays a custom property;
   - `linear-gradient(…)` is not wrapped in `url()`.

   Pinned in Task 2.

2. **A `qspgui.cfg` from a real classic game,** including one with no `Panels=` line, a floating panel, and panels with `dir=0` or a missing layer: the layout must not throw. Pinned in Task 3.
3. **Dialogs reopened from their own callback,** where a menu item opens another menu or a msg is followed by an input: the new dialog keeps its handler. Pinned in Task 5, with an E2E.
4. **QSP commands with dots, brackets or tildes in their arguments:**
   - `qspider.event:x[1.5]`;
   - `change_theme:my.theme`;
   - `event:e[~a]b~,2]`.

   Pinned in Task 7.

5. **Volume at the edges:** `PLAY 'x', 1` is 1%, `0` is silent, `100` is full; the player volume steps clamp at 0 and 100. Pinned in Task 8.

---

### Task 1: Test setup, conditions, utils and small light files

**Files:**

- Create: `libs/game-state/vite.config.mts`, `libs/game-state/tsconfig.spec.json`, `src/conditions.spec.ts`, `src/utils.spec.ts`, `src/toasts.spec.ts`, `src/components.spec.ts`, `src/init.spec.ts`
- Modify: `libs/game-state/project.json` (typecheck runs both tsconfigs, as in `libs/renderer`), `src/conditions.ts`

**Interfaces:**

- Produces the vite config, with two projects like `libs/desktop/vite.config.mts`:
  - `game-state` (node): include `src/**/*.spec.ts`, exclude `**/*.browser.spec.ts`;
  - `game-state-browser`: `browserTest('game-state-browser', ['src/**/*.browser.spec.ts'])`.
- The spec tsconfig uses `"types": ["node", "vite/client"]`. `vite/client` is needed for the `?raw` and `?url` imports along the typecheck chain.

- [ ] **Step 1:** Wire the test target. Prove it with a first spec run: `CHROME_BIN=/usr/bin/chromium pnpm nx test game-state` shows both projects.
- [ ] **Step 2: Write the specs.**
  - `checkCondition`:
    - every op on strings and numbers;
    - **D15** (red): `contains`/`not-contains` on the number `12` with `'1'` give true/false;
    - **D15** (red): `greater` on `'10'` vs `'9'` gives true when both are numeric strings; non-numeric strings still compare as strings;
    - an unknown op gives false.
  - `prepareContent`:
    - `"exec: x = 1 &gt 'room'"` becomes `"exec: x = 1 & gt  'room'"` (D16 intended; pin the exact output);
    - `&gt;` is unchanged;
    - `\"` becomes `&quot;`.
  - `prepareList`/`prepareObjectList`, with real engine-shaped items.
  - `clamp`, `isHashPath`, `convertQsps` (a two-line `.qsps` round trip).
  - `showError`/`showNotice` (fake timers, the 3 s expiry).
  - components register/`useComponent` fallback.
  - init `playerUrl`.
- [ ] **Step 3:** Run it. Expected: red only on D15. Commit `test(game-state): conditions, utils and small helpers`.
- [ ] **Step 4:** Fix D15. Commit `fix(game-state): conditions compare numbers as numbers and search numbers as text`.

### Task 2: attributes, extractAttributes, the URL guard and processStyles

**Files:** `src/attributes.ts` (export `processStyles`), `src/attributes.browser.spec.ts`, plus E2E rows in an existing game-html location (no new hostile action)

- [ ] **Step 1: Specs (browser mode, real `document.createElement` nodes).**
  - The URL guard:
    - `schemeView`/`neutraliseLink` on the control-character and case variants;
    - `href`, `formaction`, `action` and `xlink:href` become `#`; `src` becomes `about:blank`;
    - `data:` is kept in `src`;
    - SVG `image`/`feImage` keep `data:image/`, including through a `tag=` override.
  - Dashed and prototype attribute names: `form-action`, `__proto__`, `constructor`.
  - `BOOLEAN_ATTRIBUTES` presence gives true; `is` is dropped.
  - `processStyles`:
    - **D1:** `url(data:image/png;base64,AA)` and `url(http://x/y.png)` keep the whole value;
    - **D2:** `--accent:red` keeps the key `--accent`;
    - **D3:** `background-image` with no colon is skipped, not thrown;
    - **D4:** `linear-gradient(…)` and `none` are not wrapped, while a bare path is still wrapped (`img/a.png` becomes `url("img/a.png")`);
    - **D5:** `width: 10` gives the number `10`;
    - `-ms-` prefixes keep their current mapping.
- [ ] **Step 2:** Red on D1–D5. Commit `test(game-state): attribute extraction, url guard and style parsing`.
- [ ] **Step 3: Red E2E.** In an existing game-html location, add a `<div data-qa="style-data-bg" style="background-image:url(data:image/png;base64,…)">` (a 1×1 PNG). Check that its computed `background-image` contains `data:image/png;base64`. Commit `test(e2e): a data url in a style attribute is kept`. See it fail on web.
- [ ] **Step 4: Fix D1–D5** with a declaration splitter that respects parentheses and quotes, the first `:` as separator, trimming, custom properties kept verbatim, and `url()` wrapping only for a bare path. Commit `fix(game-state): style attributes keep urls, custom properties and gradients`. Run the unit tests and the E2E green, then the game-html, look and themes web scenarios.

### Task 3: qsp-gui-cfg and the classic layout template (gap 12)

**Files:** `src/qsp-gui-cfg.ts`, `src/qsp-gui-cfg.spec.ts` (node), and a new `src/gui-layout.ts` exporting `buildGuiLayoutTemplate(cfg: CfgData, defaultTemplate: string): string`. Modify `libs/renderer/src/render-state.ts` `qspGuiLayout$` to call it (that file already imports game-state).

- [ ] **Step 1: Refactor.** Lift the render-state composition (layer and floating panes) into `buildGuiLayoutTemplate`. This is a pure move. Commit `refactor(game-state): classic layout template composition`.
- [ ] **Step 2: Specs.**
  - `parseCfg` on a real `qspgui.cfg` (classic default, plus one with floating imgview), `parsePanels` (layout2 skip, dock_size, state bit), `buildLayoutTree`, `convertLayer`/`convertDock`/`convertPane` exact HTML, `extractFromDefaultTheme`, `buildGuiLayoutTemplate`.
  - **D6** (red): a cfg with no `Panels=` line doesn't throw, and gives the template without panels.
  - **D7** (red): `dir=0`, `dir=6` and a missing dir are skipped as center panels or ignored, without throwing; a panel with no `layer` defaults to layer 0.
  - **D8** (red): a panel name containing `"` is escaped in the HTML.
  - Minor: `<qsp-main-content>` is not taken for `<qsp-main`.
- [ ] **Step 3:** Commit the specs. Fix D6, D7 and D8 (and the minor one) in `fix(game-state): classic layout survives incomplete qspgui.cfg`. Run the classic-layout web scenarios (`grep -l qsp-cl apps/player-e2e/scenarios`).

### Task 4: debug state and the code inspector

**Files:**

- `src/debug.spec.ts` (node; `localStorage` comes from a small in-test `Storage` implementation passed in, or the reducers are lifted to take a storage argument; no `vi.stubGlobal`);
- a new `src/code-search.ts` with `searchLocations(cache, term)`, `locationInfo(…)` and the error mapping, plus its spec.

- [ ] **Step 1:** Refactor as far as tests need. The `debuggerUIState$` init reads storage through a parameter, `readDebuggerUiState(storage: Pick<Storage, 'getItem'> | null)`; `matchesBreakpoint(bp, record)` is lifted. Commit as `refactor`.
- [ ] **Step 2: Specs** for every debug reducer listed in the inventory:
  - the history cap 100 and the event-log cap 200;
  - function args are dropped in `logEvent`;
  - breakpoint add/remove/toggle;
  - `executeResume` with fake timers;
  - **D19** (red): `'null'`, `'abc'` and an unknown dock string fall back to defaults;
  - **D21** (red): an action match carries its own `actionLine`/`actionIndex` and doesn't overwrite the location `line`. Check how the debugger UI consumes the result (`grep -rn searchInCode libs`) and keep that contract;
  - an empty term matches nothing.
- [ ] **Step 3:** Commit the specs, then fix D19 and D21 (`fix(game-state): …`). If D21 changes what the debugger UI reads, update its consumer in the same fix.

### Task 5: Counter pauses and the dialogs

**Files:** a new `src/counter-pauses.ts` (pause reasons, `isPaused$`, `pauseCounter`/`resumeCounter`/`resetCounterPauses`/`withCounterPaused`). `counter.ts` re-exports from it and keeps the engine tick. Then `input.ts`, `msg.ts`, `menu.ts` and `wait.ts` import `counter-pauses`, and each gets a `.spec.ts`.

- [ ] **Step 1: Refactor.** Lift the pause logic. Confirm that `input.ts`, `msg.ts`, `menu.ts` and `wait.ts` now have no heavy chain. Commit `refactor(game-state): counter pause reasons in a light module`.
- [ ] **Step 2: Specs.**
  - Pause reasons are counted per reason; `withCounterPaused` resumes on throw. `scheduleCounter` and the delay watcher use fake timers; if the tick needs the engine, lift the scheduling decision only.
  - Every `input$`/`msg$`/`menu$` action, plus `finishWait`, with recorded callbacks.
  - **D18** (red):
    - a menu `onselect` that opens a new menu keeps the new menu's handler;
    - `clear()` resets state before it calls the callback, or the callback's reopen survives;
    - the same for input and msg.
- [ ] **Step 3: Red E2E for D18.** Use a fixture location where a menu item's code opens a second menu (`MENU` from inside a menu location). Selecting an item in the second menu runs its code. Find the dialogs or menu scenario and its fixture, and add the case there. Commit `test(e2e): a menu opened from a menu item runs its selection`. If the E2E is green before the fix (the engine resumes asynchronously), keep the unit red test, note in the report that the E2E doesn't reproduce it, and still fix it, because the unit shows the ordering bug.
- [ ] **Step 4:** Fix (state reset before the callback) in `fix(game-state): a dialog reopened from its own callback keeps its handler`. Run the dialogs, panels and saves web scenarios.

### Task 6: Theme parsing and the theme registry

**Files:** a new `src/theme-parser.ts` (`parseTheme`, `extractTagData`, `extractCssVariables`, `extractTranslations`, `extractLinks`; it creates its `DOMParser` lazily, not at import), `src/theme-parser.browser.spec.ts`, and a new `src/theme-registry.ts` (the add/reset reducers and derived selectors over plain data) with its spec. `themes.ts` keeps the fetch and the atoms that wire them.

- [ ] **Step 1:** Refactor. Commit as `refactor`.
- [ ] **Step 2: Specs** on a real theme (`libs/game-state` default themes or an e2e fixture theme):
  - tag data, CSS variables (each `type`), translations and links;
  - **D9** (red): `<b>Hello</b>\n  world` keeps `Hello</b> world`, and newlines between tags are removed;
  - **D10** (red): adding a game theme with alias `qspider:classic` doesn't replace the built-in, and `reset()` leaves the built-ins intact;
  - registry add/reset/derived current theme.
- [ ] **Step 3:** Commit the specs, then fix D9 and D10. Run the themes, look and core-flow-themes web scenarios. D9 changes theme template text, so check that the theme E2E stays green; any break in an existing theme snapshot of text means a theme relied on the gluing, so report it.

### Task 7: qspider commands and engine-event logic

**Files:**

- new `src/qspider-command-parsers.ts`: `parseArgs`, `parseEvent`, `parseSystemCmd`, `scrollStep` (the shared scroll reducer, duplicate 1), `regionKey`;
- new `src/engine-event-logic.ts`: `shouldPauseOnLink`, `isExecHref`/`stripExec`, `versionAnswer`, `gameFileUrl` (isQsps plus the directory join; duplicates 6 and 9), `isNewLoc`, `newLocEffect`, `panelVisibility`, `saveTarget`;
- specs for both.

Modify `qspider-commands.ts`, `qsp-api.ts`, `current-game.ts` (its scroll and qsps copies), `loaders.ts` (the directory join) and `panels.ts` (`reloadLayers`/`update_layers`, duplicate 2; the region read, duplicate 5).

- [ ] **Step 1:** Refactor; every duplicate calls the one function. Commit as `refactor`.
- [ ] **Step 2: Specs.**
  - **D11** (red): `parseSystemCmd('qspider.event:x[1.5]')` keeps `event:x[1.5]`; `qspider.change_theme:my.theme` keeps the dot; bare `qspider` gives nothing.
  - **D13** (red):
    - `parseEvent('e[~a]b~,2]')` gives `{name:'e', args:['a]b',2]}`;
    - an unclosed `~` keeps a string;
    - `[~a~x]` gives `['a','x']`, or define the rule and pin it.
  - The region name containing `:` is handled.
  - `panelVisibility` for every bit.
  - `isNewLoc`, `newLocEffect`, `saveTarget` branches, `versionAnswer`.
  - `gameFileUrl` with absolute and relative paths (no doubled slash).
- [ ] **Step 3:** Commit the specs, then fix D11 and D13. Run the game-html, qspider-commands and saves web scenarios (`grep -rln "qspider\." apps/player-e2e/fixtures` to find them).

### Task 8: Hotkeys, audio and volume

**Files:** a new `src/hotkey-format.ts` (`prettifyHotkeys(keys, platform)` plus the tables, `isBlockingDialogOpen`, `resolveHotkey`); renderer GlobalHotkeys/GameHotkeys pass the platform. A new `src/volume.ts` (`normalizeVolume`, `stepVolume(v, dir)`, `getFileKey`). Specs for both. `hotkeys.ts` and `audio.ts`/`sound.ts` keep Mousetrap and Howler.

- [ ] **Step 1:** Refactor. Commit as `refactor`.
- [ ] **Step 2: Specs.**
  - `prettifyHotkeys` on macOS and others, including `ctrl++`; prototype keys are not looked up.
  - `isBlockingDialogOpen` for each dialog.
  - `resolveHotkey`: space with one action, restart blocked by a dialog.
  - **D17** (red): save with NOSAVE resolves to "prevent default, do nothing".
  - **D14** (red): `normalizeVolume(1)` is `0.01`, `0` is `0`, `100` is `1`.
  - `stepVolume` clamps at 0 and 100; `getFileKey`.
- [ ] **Step 3:** Commit the specs, then fix D14 and D17. If `sound.scenario.ts` can read a sound's volume, add a red E2E for `PLAY 'x', 1`; otherwise note that the unit test carries it. Run the sound, resources and hotkey web scenarios.

### Task 9: current-game, save, pause screen, panels and remaining light files

**Files:**

- new `src/game-config.ts`: the descriptor pick, the aero window merge, `configXmlSize(doc)` (DOM), the theme choice, `windowSettingsPlan`, `parseGameCommand`;
- new `src/save-routing.ts`: `saveCommandTarget`, `finishSave`;
- new `src/pause-screen-url.ts`;
- `panels.ts` lifts: `view$` reducers, `canSelectAction`, `readLayerState`;
- `player-theme.browser.spec.ts`;
- `resources.browser.spec.ts` (`whenLoaded` with fake timers on real created elements, `clearAdditionalResources`).

- [ ] **Step 1:** Refactor (duplicates 3, 4, 7 and 8 too: `onRestart`/`onRestore`, the save pairs, the save-request helper, `selectAndRun`). Commit as `refactor`.
- [ ] **Step 2: Specs** for every lifted function and the inventory's PURE items in these files:
  - `configXmlSize` with `auto`/missing values falling back to 800/600;
  - `parseGameCommand` for `pause:saves` and `scroll:main:top`.
- [ ] **Step 3:** **D20.** `clearSlot`/`clearPath` are awaited. That's I/O, so the proof is E2E. Find the saves scenario that clears a slot, and check it reads the list after the clear; add a red E2E only if a race is observable. Commit `fix(game-state): clearing a save waits for storage`.
- [ ] **Step 4:** Commit the specs. Run the saves, pause-screen, panels and open-routes web scenarios and `pnpm e2e:standalone-web`.

### Task 10: Completeness, gate and PR

- [ ] **Step 1:** Re-sweep `libs/game-state/src` against the inventory. Every PURE and LIFT row is tested, or skipped with a reason. Write the list for the PR body.
- [ ] **Step 2: Local gate.** Run `pnpm format:check` and `CHROME_BIN=/usr/bin/chromium pnpm nx run-many -t lint typecheck test`, then the full `pnpm e2e:web` and `pnpm e2e:standalone-web`, and report the results.
- [ ] **Step 3:** Push and open a PR against `main`. The body covers the decisions, the defects fixed (D1–D21 except D12 and D16, both pinned as intended), the completeness list and the open follow-ups.
