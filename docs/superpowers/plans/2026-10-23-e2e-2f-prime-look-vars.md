# E2E Batch 2f′ — Aero/classic look variables Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cover inventory §E's look variables, the 2f′ list, with real-engine E2E scenarios:

- every `qsp-css-variable` mapping in the built-in Aero and classic themes;
- the component-level Aero vars: dialog positions, `DISABLESHADE`, `ALWAYS_SHOW_VIEW`, `FIXED_SIZE_MENU`;
- the Aero format wrappers;
- new-location effects;
- the classic `qspgui.cfg` colours and font;
- the theme `css-link` effect, carried from 2f.

**Architecture:**

- **One new kind of check:** a named, read-only page probe in `support/page-script.ts`. It reads computed style values (custom properties, or a plain property where the player writes one) off one marked element.
- **The target is restricted.** It is the game root, or an element named by its `data-qsp` / `data-qa` value. The value is validated against `^[a-z0-9-]+$` before it is put into a selector. No code and no selector come from scenarios.
- **Values, never layout.** We assert the value the player applied (`--aero-msg-x: 111px`, a trigger's inline `left: 222px`). We never assert positions measured from layout.
- **New `data-qsp` hooks** on the class-only Aero elements, all non-visible:
  - the shade overlay `overlay`;
  - the menu trigger `menu-anchor`;
  - the new-location effect wrapper `newloc-effect`.

  The wait-lock already has `data-qsp="wait"`, so nothing is needed there.

- **One fixture source, `look-game.qsps`,** packed twice: in Aero mode and in classic mode. Its actions set the variables on demand. Fixture images of a known natural size cover the `-w` / `-h` vars.

**Maintainer decisions (2026-10-23):**

- **Coverage depth = mapping table.**
  - One action sets every mapped variable to a distinct value. One probe call reads every mapped custom property, and the result is compared with a frozen table (Aero and classic).
  - Dedicated scenarios cover each component that reads variables itself.
  - No per-variable scenarios.
- **Suspected defect: the classic cfg colours.**
  - The defect: `classic.html` gives `--code-color`, `--code-background-color`, `--code-link-color` and `--code-font-size` a `default-value`, so `QspCssVariable` always writes them. They then shadow the `var(--cl-*)` fallback in `classic.css`, so `qspgui.cfg` BackColor/FontColor/LinkColor/FontSize never apply.
  - **If a RED run confirms it, fix it in 2f′.** The fix is a separate `fix(themes)` commit, flagged ⚠ (player-visible) in the PR.
  - Games with no cfg must look exactly as before. The derived `--*-contrast` / `--*-inverted` values included: a bare fallback would turn them `gray`.

**Builder calls (mine; flag in review if wrong):**

- **`MENU_X/Y` are not CSS variables.** They become an inline `left`/`top` on the menu trigger. The probe reads the trigger's computed `left`/`top`. The probe accepts any property name, not only `--*`.
- **`MSG_X/Y` and `INPUT_X/Y` are inline custom properties** on the dialog container, not on the root. Custom properties inherit, so they are read on `[data-qsp="msg"]` / `[data-qsp="input"]`.
- **`FIXED_SIZE_MENU`** only adds the `aero-fixed-menu` class. The check reads the menu's `class` attribute; it is not used as a locator. It lives in `screenplay/themes/aero/`, because the class is Aero's own vocabulary.
- **New-location effects:**
  - A `fade` with `NEWLOC_EFFECT_TIME=60000` stays in flight for a minute, so the wrapper's computed `opacity` is deterministically below 1 when checked.
  - Short effects, and `NEWLOC_EFFECT_SEQ=1`, must still deliver the new location's text.
  - No sleeps.
- **The css-link effect** becomes an extra check inside the existing "a game-provided theme loads with its files" scenario: `e2e-theme.css` sets a custom property on the theme chrome. That adds no desktop relaunch.
- **The classic cfg fixture:** the existing `gui-cfg-game/qspgui.cfg` colours equal the classic defaults (BackColor `0xE0E0E0`, FontColor `0`, LinkColor `0xFF0000`, FontSize `12`). The defect is invisible with them. Change them to distinct values. The 2f dock scenario does not read colours.

**Tech Stack:** Serenity/JS screenplay; web = Playwright; desktop = WebdriverIO + tauri-driver; fixtures as `.qsps` + TOML `game.cfg` (+ images), zipped by `fixtures/build-fixtures.ts`.

**Spec:**

- `docs/superpowers/specs/2026-10-21-e2e-phase2-design.md`: the 2f′ decisions (computed-style check; `data-qsp` hooks for class-only Aero elements).
- `docs/superpowers/specs/2026-10-21-e2e-engine-inventory.md`: §E, §F and the 2f′ list.
- `docs/superpowers/specs/2026-10-20-e2e-conventions-design.md`: "Themes".

## Global Constraints

- **Same as 2f:**
  - NX/pnpm only;
  - desktop only via `run-desktop-e2e.mjs`: one run at a time, wait for it, rebuild after any change outside `apps/player-e2e`;
  - never touch the real session or kill processes by name;
  - plain branch `feat/e2e-2f-prime-look-vars`, no worktree.
- **README Rules:**
  - locators;
  - `seeEventually` / `seeScriptEventually`, and the presence helpers;
  - ≤150 lines per screenplay file;
  - no sleeps: the page-clock exception stays scoped to the counter checks;
  - `ExecuteScript` only in `support/page-script.ts`.
- **Fixtures:**
  - new ones are opened via `OpenGameFile`;
  - **at most 8 actions per location**;
  - markers are unique ALL-CAPS strings, referenced only through `fixtures/look-game.ts`;
  - no apostrophes in `!` comments.
- **The probe stays read-only and named.** No probe takes code. The only scenario-supplied strings are a marker value (regex-validated) and property names (they go only to `getPropertyValue`, never into a selector).
- **Theme matrix (2f decision):** the look-variable scenarios are theme-feature scenarios, so they run **on both targets, once each**. Keep them coarse: several checks per scenario, because each desktop scenario is an app relaunch (~25 s).
- **⚠ Player-visible fixes:** only the approved classic-cfg fix, and only if RED confirms it. Anything else that is visible: stop and report. Non-visible defects are fixed RED→GREEN in their own `fix(...)` commit.
- **Discrimination:** every key check is run once with its mechanism disabled and seen to FAIL. Record the commands and the failure lines in the ledger. Every absence check has a settled anchor.
- **Local verification:**
  - targeted specs per task, on both targets;
  - `nx format:check --all`, lint and typecheck before each commit;
  - **one** `pnpm check:full` at the end, after the final review's fixes.
- **Ledger:** `.superpowers/sdd/2026-10-23-e2e-2f-prime-look-vars/ledger.md` (task status, commits, discrimination evidence).

## Review Focus

- **Colour encoding.**
  - `convertColor` reads the alpha byte, and `alpha === 1 ? 1 : alpha / 255` is odd.
  - Check the engine Readme: does QSP `RGB()` yield alpha 255 (opaque) or 0? If a game's `FCOLOR = RGB(255,0,0)` comes out `rgba(255,0,0,0)` (transparent), that is a defect. Verify it against the engine contract before calling it coherent, and report it; don't route around it.
  - Table values are frozen literals written from the contract, never copied from a run.
- **Resource URLs differ by target.** Web uses `http://…/`, desktop uses the Tauri asset URL. Resource values are asserted on their stable suffix (`…/look/back.png")`), not by equality.
  - Note: `prepareUrl` replaces only the **first** backslash. That is 2g's (backslash paths), so don't fix it here; mention it in the 2g notes if it is seen.
- **The derived classic values (`--border-color`, `--*-contrast`, `--*-inverted`)** must be unchanged for a cfg-less game after the fix: the control zip's before/after table.
- **WebKit computed-style differences:** whitespace and colour serialisation in `getPropertyValue`. The probe trims, and the table uses the form both engines return; check on desktop early (Task 1).
- **Newloc `onRest`:** with `SEQ=1`, `mainContent$` updates only when the leave animation rests. A long `NEWLOC_EFFECT_TIME` with `SEQ=1` would hold the old text for that long. Keep the sequential scenario's time short.

---

## Task 1: Hooks and the computed-style probe

**Files:**

- `libs/renderer/src/transformers/aero/aero-overlay.tsx`: `data-qsp="overlay"` on the overlay div.
- `libs/renderer/src/transformers/aero/aero-menu.tsx`: `data-qsp="menu-anchor"` on the `data-menu-trigger` div.
- `libs/renderer/src/transformers/aero/aero-newloc-effect.tsx`: `data-qsp="newloc-effect"` on the `animated.div` wrapper.
- `apps/player-e2e/screenplay/support/page-script.ts`: the new probe and checks.
- `apps/player-e2e/README.md`: the support list and "Locating elements" (the new markers).

**Interfaces — Produces:**

```ts
/** Where a style probe reads: the game root, or the first element with this data-qsp / data-qa value. */
export type StyleTarget = { root: true } | { qsp: string } | { qa: string };

/** Computed values of `names` on the target (trimmed); null when the target is absent. */
export const CssValues = (target: StyleTarget, names: string[]): QuestionAdapter<Record<string, string> | null>;

/** Eventually every name in `expected` reads exactly its value. */
export const SeeCssValues = (target: StyleTarget, expected: Record<string, string>): Task;

/** Eventually the one value meets `expectation` (e.g. endsWith, isLessThan via a number adapter). */
export const SeeCssValue = (target: StyleTarget, name: string, expectation: Expectation<string>): Task;
```

- [ ] **Step 1:** Add the three markers. This is a non-visible change: `feat(renderer): data-qsp hooks for aero overlay, menu anchor, newloc effect`.
- [ ] **Step 2:** Add the probe. It is a self-contained function (`styleValues(kind, value, names)`).
  - It validates `value` against `/^[a-z0-9-]+$/` and throws otherwise. Build the selector only after validation: `qsp-game-root`, `[data-qsp="…"]` or `[data-qa="…"]`.
  - It reads `getComputedStyle(el).getPropertyValue(name).trim()` for each name and returns a plain object, or null.
  - Add it to the `PROBES`-style section with a doc comment saying why it is safe (no code, validated marker).
- [ ] **Step 3: Smoke test, both targets.**
  - Add a temporary scenario: the Aero game, then `SeeCssValues({ root: true }, { '--color': '<aero default>' })`.
  - Run it on web and on desktop. This settles serialisation, `rgba(0,0,0,1)` vs `rgb(0, 0, 0)`, before the table is written.
  - Remove the temporary scenario.
  - Record both outputs in the ledger.
- [ ] **Step 4:** README: add the probe and its rules to the support list; add the three markers to "Locating elements". Commit `feat(e2e): computed-style probe for look variables`.

## Task 2: The look fixture

**Files:**

- `apps/player-e2e/fixtures/look-game/`:
  - `look-game.qsps`;
  - `game-aero.cfg` / `game-classic.cfg` (or one cfg generated per mode, like the missing-theme variants);
  - `look/back.png` (natural size **7×5**), `look/top.png`, `look/msg.png` (**11×3**), `look/act.png`.
  - The images are tiny PNGs, either committed or generated in `build-fixtures.ts` from a base64 literal (pick one, and justify it in the commit).
- `apps/player-e2e/fixtures/look-game.ts`: the constants and both frozen tables.
- `fixtures/archives.ts`, `fixtures/build-fixtures.ts`, `fixtures/build-fixtures.spec.ts`: the `lookAeroZip`, `lookClassicZip` entries and the spec cases.
- `apps/player-e2e/fixtures/gui-cfg-game/qspgui.cfg`: distinct colours, e.g. BackColor `0x203040`, FontColor `0x00A0F0`, LinkColor `0x10C020`, FontSize `17`. Update `GUI_CFG_GAME` with the expected values.

**Locations (≤ 8 actions each):**

- `start` (`LOOK START`):
  - `Set vars`: `gs 'set_all'` sets every variable in the mapping table to its table value;
  - `To dialogs`, `To formats`, `To effects`.
- `set_all`: a subroutine with no actions. Each table row is one assignment, so the table and the QSP read side by side.
- `dialogs` (`LOOK DIALOGS`):
  - `Msg`: `msg 'LOOK MSG'`;
  - `Input`: `$r = input 'LOOK INPUT'`;
  - `Menu`: a two-item menu, `menu 'look_menu'`;
  - `View`: `view 'look/msg.png'`;
  - `No shade`: `DISABLESHADE = 1`;
  - `Place`: `MSG_X=111`, `MSG_Y=112`, `INPUT_X=121`, `INPUT_Y=122`, `MENU_X=131`, `MENU_Y=132`;
  - `Fixed menu`: `FIXED_SIZE_MENU = 1`;
  - `Keep view`: `ALWAYS_SHOW_VIEW = 1`, which also appends to `LOG`.
- `formats` (`LOOK FORMATS`):
  - `Set formats`: sets `$MAIN_FORMAT='MAINFMT[%TEXT%]'`, plus the stats, msg, input, action, selected-action, object, menu and selected-menu formats. Each has a unique ALL-CAPS wrapper. The action format uses `%IMAGE%`.
  - Then `gt 'formats'` to re-render.
  - An action with an image: `act 'Pic', 'look/act.png'`.
  - `Msg`, `Input`, `Menu` (for their wrappers).
  - One object, `addobj`.
- `effects` (`LOOK EFFECTS`):
  - `Slow fade`: `$NEWLOC_EFFECT='fade'`, `NEWLOC_EFFECT_TIME=60000`, `gt 'arrive'`;
  - `Quick slide`: `l_slide`, `300`, `gt 'arrive'`;
  - `Seq fade`: `fade`, `300`, `NEWLOC_EFFECT_SEQ=1`, `gt 'arrive'`.
- `arrive` (`LOOK ARRIVED`).

- [ ] **Step 1:** Write the qsps and both cfgs. Write the tables in `look-game.ts` as `Record<cssName, expectedValue>`:
  - `LOOK_AERO_TABLE`: every `qsp-css-variable` in `public/themes/aero.html`, plus each `-contrast` / `-inverted` / `-w` / `-h` it derives.
  - `LOOK_CLASSIC_TABLE`: `classic.html` likewise.
  - Resource rows hold a suffix, and the check uses `endsWith` for them.
  - Write a header comment on how each value follows from the assignment: unit + `px`/`pt`, the colour encoding per the engine contract.
- [ ] **Step 2: Completeness guard.** A `build-fixtures.spec.ts` case parses `public/themes/aero.html` and `classic.html` for `qsp-css-variable name=` and asserts that the table keys equal that set. A new mapping then cannot slip past the table. ☝️ This is a test over the product's theme data, not over tool config, so it stays within the no-tests-for-tool-config rule.
- [ ] **Step 3:** Build fixtures through NX, run the fixture spec and commit `test(e2e): look-variable fixture`.

## Task 3: Mapping-table scenarios (Aero + classic)

**Files:** `apps/player-e2e/scenarios/look-vars.scenario.ts` (new); `screenplay/look/{tasks,checks}.ts` if needed (≤150 lines).

- [ ] **Step 1: `the Aero theme maps every look variable`.**
  1. Open `lookAeroZip`.
  2. `SeeGameStarted(LOOK START)`.
  3. Settled anchor: `SeeCssValues(root, AERO_DEFAULTS_SUBSET)`. This is a small set of defaults, e.g. `--color`, `--font-size`.
  4. `ClickAction('Set vars')`.
  5. `SeeCssValues(root, LOOK_AERO_TABLE)` for the exact rows, and `SeeCssValue(..., endsWith)` for the resource rows.
  6. The `-w` / `-h` rows read `7px` / `5px` and `11px` / `3px` (the image natural sizes; eventual, since the image loads).
- [ ] **Step 2: `the classic theme maps every look variable`.** The same on `lookClassicZip` with `LOOK_CLASSIC_TABLE`.
- [ ] **Step 3: `the look variables reach the dialog portal`.** After `Set vars`, open `Msg` and `SeeCssValues({ qsp: 'msg' }, { '--color': … })`. The msg renders in `#portal-container`, so this proves the portal half of the selector.
- [ ] **Step 4: Discrimination.**
  - Temporarily rename one `from=` in `aero.html` (e.g. `FCOLOR`→`FCOLORX`): Step 1 must FAIL on that row.
  - Temporarily drop `#portal-container` from the rule in `css-variables.tsx`: Step 3 must FAIL.
  - Revert both, and record the failures in the ledger.
- [ ] **Step 5:** Web + desktop targeted runs. Commit `test(e2e): look-variable mapping tables (2f′)`.

## Task 4: Classic `qspgui.cfg` colours (RED → ⚠ fix)

**Files:** `scenarios/themes.scenario.ts` (or `look-vars.scenario.ts`), `screenplay/classic/checks.ts`; the fix lives in `public/themes/classic.html` + `public/themes/classic.css`.

- [ ] **Step 1: RED.** Scenario `qspgui.cfg colours and font apply to the classic layout`:
  1. Open `GUI_CFG_GAME.path`.
  2. Anchor: `SeeStatsInDock('left')`.
  3. `SeeCssValues(root, { '--color': cfg font colour, '--background-color': cfg back colour, '--link-color': …, '--font-size': '17pt', '--font-name': … })`.
  4. Expect FAIL on all but `--font-name`. Record the output.
  - **If it passes, there is no defect.** Drop the fix, keep the scenario and record that.
- [ ] **Step 2: Baseline before the fix.** Scenario `a classic game without qspgui.cfg keeps the default look`:
  1. Open `GUI_CFG_GAME.controlPath`.
  2. Anchor: `SeeStatsInDock('bottom')`.
  3. `SeeCssValues(root, CLASSIC_DEFAULT_LOOK)` over `--color`, `--link-color`, `--background-color`, `--background-color-contrast`, `--background-color-inverted`, `--background-color-inverted-contrast`, `--border-color`, `--font-size`.
  - Fill the expected values from the current code's semantics, then confirm them **before** the fix. This one must pass now and after.
- [ ] **Step 3: Fix** (separate `fix(themes): qspgui.cfg colours and font size apply in the classic theme` commit, flagged ⚠):
  - Remove `default-value` from the four `classic.html` vars.
  - In `classic.css`, give each `var(--code-x, var(--cl-x))` a final default equal to the old one: `#000000`, `#0000ff`, `#e0e0e0` and `12pt`.
  - Also give the derived contrast/inverted values their literal defaults: the values `getContrastColor('#e0e0e0')` / `invertColor` produce today.
- [ ] **Step 4: GREEN.** Steps 1 and 2 pass on both targets. Also rerun the 2f dock scenario and the core flows (classic is the default theme for everything).
- [ ] **Contract (verified 2026-10-23 in `QSPFoundation/qspgui`, `qspgui/frame.cpp:375-415`):**
  - `BCOLOR`, `FCOLOR`, `LCOLOR` and `$FNAME` win when non-zero or non-empty; otherwise the cfg value applies. The fix matches this.
  - Font size: if `UseFontSize=1` ("Always use selected font size", frame.cpp:573), the cfg size always wins. Otherwise `FSIZE` wins when non-zero, else the cfg size.
  - The fixture has `UseFontSize=0`, so the cfg size is the fallback, which is what the fix does.
  - qSpider ignores `UseFontSize`. With `=1` the game's `FSIZE` would still win. **Maintainer: park it.** Add it to the inventory's "Suspected defects" (Task 8) with the frame.cpp reference; no product change in 2f′.
- [ ] **Step 5: Hidden users.**
  - Grep `fixtures/themed-game/e2e-theme.html` (it copies `classic.html`). Leave it: it is a third-party-style theme.
  - Note in the PR that third-party themes copying `classic.html` keep the old behaviour.

## Task 5: Aero dialog vars

**Files:** `scenarios/look-vars.scenario.ts`; `screenplay/themes/aero/{elements,checks}.ts` (`Overlay`, `MenuAnchor`, `SeeMenuFixed`); reuse `msg/`, `input/`, `menu/`, `view/` tasks.

- [ ] **Step 1: `DISABLESHADE removes the dialog shade`.**
  - Go `To dialogs`, click `Msg`, `SeeMsg`, then see `[data-qsp="overlay"]` present. Dismiss.
  - Click `No shade`, then `Msg`. With `SeeMsg` as the settled anchor, check the overlay is absent (`waitUntilAbsent`).
- [ ] **Step 2: `MSG/INPUT/MENU positions place the dialogs`.**
  - Defaults first: `--aero-msg-x` = `200px`, `--aero-msg-y` = `165px` on `{ qsp: 'msg' }`.
  - Then `Place`, and:
    - `Msg` → `111px` / `112px`;
    - `Input` → `--aero-input-x/y` = `121px` / `122px`;
    - `Menu` → the `menu-anchor` computed `left` / `top` = `131px` / `132px`.
- [ ] **Step 3: `FIXED_SIZE_MENU fixes the menu size`.**
  - `Menu` → the class lacks `aero-fixed-menu`. The anchor is the menu items being visible.
  - Close it, `Fixed menu`, `Menu` → the class has `aero-fixed-menu`.
- [ ] **Step 4: `ALWAYS_SHOW_VIEW keeps the view open`.**
  - Control: `View` → click the view → view gone.
  - Then `Keep view` → `View` → click the view → click an action that appends `LOG`.
  - With that `LOG` text as the settled anchor, the view is still present. The positive outcome is the LOG line plus the view.
- [ ] **Step 5: Discrimination.** Temporarily neutralise each mechanism and see its check FAIL, then revert:
  - `isShadeDisabled` forced false;
  - `msgX` hard-coded to 200;
  - the fixed class not added;
  - `alwaysShow` ignored.
- [ ] **Step 6:** Both targets. Commit `test(e2e): aero dialog look variables (2f′)`.

## Task 6: Format wrappers

**Files:** `scenarios/look-vars.scenario.ts`; reuse `content/`, `game/`, `stats/`, `objects/`, `msg/`, `input/`, `menu/` checks.

- [ ] **Step 1: `Aero format variables wrap the panels`.**
  1. `To formats`, then `Set formats`.
  2. Main text `MAINFMT[LOOK FORMATS]`, plus the stats and object wrappers.
  3. Action `Pic`: its text is wrapped, and an `<img>` whose `src` ends with `look/act.png` (`%IMAGE%`).
  4. `Msg` → `MSGFMT[…]`; `Input` → `INPUTFMT[…]`; `Menu` → each item `MENUFMT[…]`.
  5. Hover one action and see `SELACTFMT[…]` (hover via `support/hover.ts`); hover one menu item the same way.
- [ ] **Step 2: Discrimination.** Temporarily make `aeroParsedMainContent$` skip the format: the main check must FAIL. Revert.
- [ ] **Step 3:** Both targets. If the hover is flaky on desktop, stop and report; don't `webOnly` it silently. Commit `test(e2e): aero format variables (2f′)`.

## Task 7: New-location effects

**Files:** `scenarios/look-vars.scenario.ts`; `screenplay/themes/aero/checks.ts` (`SeeNewlocEffectInFlight`: the opacity probe parsed to a number, `< 1`).

- [ ] **Step 1: `a new-location effect animates the change`.**
  - `To effects` → `Slow fade`. Then `SeeCssValue({ qsp: 'newloc-effect' }, 'opacity', below 1)`.
  - The 60 s fade makes this deterministic.
  - The location content `LOOK ARRIVED` is present: non-sequential mode sets it at once.
- [ ] **Step 2: `effects still deliver the new location`.** Two scenarios, fresh games, both fast:
  - `Quick slide` → `SeeMainText(LOOK ARRIVED)`;
  - `Seq fade` → `SeeMainText(LOOK ARRIVED)`. This is the `onRest` path.
- [ ] **Step 3: Discrimination.**
  - Temporarily make `AeroNewlocEffect` return `children` always: Step 1 must FAIL (no wrapper).
  - Temporarily drop the `onRest` update: `Seq fade` must FAIL.
  - Revert.
- [ ] **Step 4:** Both targets. Commit `test(e2e): aero new-location effects (2f′)`.

## Task 8: Theme css-link effect, docs

**Files:** `fixtures/themed-game/e2e-theme.css` (`.e2e-theme-chrome { --e2e-theme-css: LOADED; }`); `fixtures/themes-game.ts` (`theme.cssMark`); `scenarios/themes.scenario.ts`; the inventory, README, design notes.

- [ ] **Step 1:** In "a game-provided theme loads with its files", after `SeeThemeChrome`, add `SeeCssValues({ qa: 'e2e-theme-chrome' }, { '--e2e-theme-css': 'LOADED' })`. Discrimination: point the `css-link` at a missing file and see it FAIL. Revert.
- [ ] **Step 2: Inventory.**
  - §E rows: ✅ with the scenario names.
  - The §F css-link row: ✅.
  - Add the classic-cfg defect to "Suspected defects", marked fixed in 2f′, or "not reproduced".
  - Add any new suspected defects found (e.g. colour alpha).
- [ ] **Step 3: README.** Under Themes: the look-var scenarios and the tables' completeness guard; the probe's rules under support.
- [ ] **Step 4:** Commit `docs(e2e): look variables coverage (2f′)`.

## Task 9: Whole-branch review and verification

- [ ] **Step 1:** Final whole-branch review on the most capable model (spec + quality + the scenario quality bar). Apply its fixes.
- [ ] **Step 2:** `nx format:check --all`, lint, typecheck. Then **one** `pnpm check:full`; read `CHECKFULL_EXIT=` and the desktop `Spec Files:` line from the log body.
- [ ] **Step 3:** Push and open a PR against `main`. The body covers:
  - the ⚠ classic-cfg fix;
  - the markers;
  - the probe;
  - the desktop duration delta;
  - parked items.
