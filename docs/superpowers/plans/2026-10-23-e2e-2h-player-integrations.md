# E2E Batch 2h — Player-side integrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cover inventory §M with E2E scenarios on both targets, and fix the defects they expose:

- shelf: remove, re-import, and persistence across a player restart;
- saves after remove and re-import;
- language: a switch re-renders the UI and persists across restart;
- light/dark player theme persists;
- the language of the desktop launch notice.

**Architecture:**

- **Restarts** use `RestartPlayer()` from 2d. On web it is a full reload in the same context; on desktop, `restartAppKeepingData()` keeps the private XDG dirs. After it, check `SeeStartupFinished()`.
- **Desktop relaunch uses the test pack.** `restartAppKeepingData()` relaunches with the test pack `game.cfg` argument, so a pack game that was removed comes back. Remove/persistence scenarios therefore use a game opened via `OpenGameFile`, never a pack title.
- **New app-shell hooks** (non-visible):
  - `data-qa` on the shelf card's remove button;
  - `data-qa` on the shelf locale selector, and a readable current value;
  - `data-qa` on the theme switch;
  - a player-theme marker on `body` (e.g. `data-player-theme`), so no check reads the `dark-theme` class;
  - a `data-qsp` marker on the pause-screen `qsp-locale-select`, if it has none.
- **Language checks:**
  - Read a translated UI string through a hooked element, for example the empty-shelf notice or the open-game control.
  - Compare it with the value in `public/locales/<lng>/translation.json`. The test reads that file at runtime, never a hard-coded string, so translations can change without breaking the test.
  - The selected value is read from the hooked selector.

**Maintainer decisions (2026-10-23):**

- **Fixed in 2h, each flagged ⚠ (player-visible), RED→GREEN in its own `fix(...)` commit:**
  - **Defect 12:** `initTheme()` keeps a saved `dark`/`light`. The OS preference applies only when nothing is saved.
  - **B1:** web `removeGame` also deletes the game's saves, as desktop already does. Re-importing a removed game starts with no old saves.
  - **B3:** the desktop multi-game launch notice is built only after i18n is ready, so it is in the saved language. This fix is made **only if a RED run confirms the bug**; if the notice is already translated, record that and make no change.
  - **B4:** a web `?game=` / `?config=` import of an existing id overwrites the entry, as file and drop import do.
- **Not fixed:** B2, volume/mute not persisted. Volume and mute are asserted in-session only; 2g covers that. Record it in the inventory as a feature gap, not a defect.
- **Parked (inventory only):**
  - B6: desktop `hasSave*` / `clear*` throw when a game has no saves entry (latent; no caller).
  - B7: desktop un-serialised `flushStorageData` could lose the last write on a quick quit.
  - B8: a desktop game whose `local_path` vanished is silently dropped at startup.
  - B9: the locale selector `value` may not match a fallback language (unsure).
  - B10: the remove button's tooltip is an untranslated English string.
  - Desktop has no single-instance guard.
  - Window-state restore, the updater, and file drop: out of scope.

**Tech Stack:** Serenity/JS screenplay; web = Playwright; desktop = WebdriverIO + tauri-driver; fixtures as `.qsps` + TOML `game.cfg`, zipped by `fixtures/build-fixtures.ts`.

**Spec:**

- `docs/superpowers/specs/2026-10-21-e2e-phase2-design.md`: 2h, the persistence decision, and `RestartPlayer` keeping data.
- `docs/superpowers/specs/2026-10-21-e2e-engine-inventory.md`: §M, the 2h list, and defect 12.

## Global Constraints

- **Same as 2g:**
  - NX/pnpm only;
  - desktop only via `run-desktop-e2e.mjs`: one run at a time, wait for it, and rebuild after any change outside `apps/player-e2e`;
  - never touch the real session, and never kill processes by name;
  - plain branch `feat/e2e-2h-player-integrations`, no worktree.
- **README Rules:**
  - locators by `data-qsp` / `data-qa` / role only;
  - checks via `seeEventually` and the page-script helpers, waits via the presence helpers;
  - ≤ 150 lines per screenplay file;
  - no sleeps;
  - `ExecuteScript` only in `support/page-script.ts`, read-only and named (`scriptResult` is lint-restricted to `screenplay/support/`).
- **Fixtures:**
  - opened via `OpenGameFile`;
  - ≤ 8 actions per location;
  - unique ALL-CAPS markers referenced only through constants.
- **Targets:** scenarios run on both targets, once each, kept coarse because each desktop scenario is an app relaunch. Use web-only only where a step exists on one target (`?game=` URL import), split as the README's "Single-target scenarios" requires.
- **Fix policy:**
  - Only the ⚠ fixes approved above, plus non-visible hooks.
  - Anything else player-visible: stop and report.
  - Every fix is RED→GREEN in its own commit.
  - Never route a scenario around a bug.
- **Discrimination:** run every key check once with its mechanism disabled and see it fail, and record that in the ledger. Every absence check needs a settled anchor: after a restart, `SeeStartupFinished()` plus a positive shelf state.
- **Local verification:**
  - targeted specs on both targets;
  - before each commit: `nx format:check --all`, plus `nx lint` and typecheck;
  - **one** `pnpm check:full` at the end, after the final review's fixes.

## Review Focus

- **Optimistic shelf writes:** `games$` actions write to storage without `await`, so a restart straight after remove can race the write. Every remove/add scenario needs a settled anchor that proves storage was written before `RestartPlayer()`. If no such anchor exists, find the root cause and report; do not add a sleep.
- **Desktop localStorage across `restartAppKeepingData()`:** the language (`i18nextLng`) and the theme (`qspider-theme`) live in WebKit's localStorage, which must survive the relaunch. The Task 1 spike settles this before any persistence scenario is written.
- **i18n debug noise:** `debug: true` makes the console noisy. Don't assert on console output.
- **A loose-file desktop game:** `remove()` throws because `<id>/` was never created, and the shelf swallows the error. The removal still persists in the JSON? Verify it; the remove scenario covers it.

---

## Task 1: Spike + hooks

**Files:** renderer / game-shelf components (hooks), `screenplay/shelf/`, `screenplay/common/`; a temporary scenario (deleted afterwards).

- [ ] **Step 1: Hooks** (non-visible), in one `feat(...)` commit:
  - the remove button, `data-qa="game-remove"`;
  - the shelf locale selector, `data-qa="locale-select"`, plus a way to read its current value (`data-value`, or the Radix trigger text);
  - the theme switch, `data-qa="theme-switch"`;
  - `body[data-player-theme]`, set by the `playerTheme$` subscriber;
  - the pause `qsp-locale-select`, a `data-qsp` marker if it has none.

  Update README "Locating elements".

- [ ] **Step 2: Spike** on both targets. Switch language and theme, `RestartPlayer()`, then record:
  - whether `i18nextLng` survives;
  - whether `qspider-theme` survives (expect `dark` to be lost because of defect 12);
  - whether a game opened via `OpenGameFile`, then removed, stays removed after the restart;
  - which settled anchor proves the shelf write happened (for example, a reload in the same session).

  Record everything in the report. If desktop localStorage does not survive, **stop and report**; it's a harness question.

- [ ] **Step 3:** delete the spike scenario.

## Task 2: Shelf remove and persistence (+ B1)

**Files:** `scenarios/shelf.scenario.ts` (new), plus shelf tasks (`RemoveFromShelf`) and checks; `libs/browser/src/lib/web-storage.ts` for B1.

- [ ] **Step 1: Scenario `a removed game stays removed after a restart`** (both targets):
  1. `OpenGameFile(X)`.
  2. Return to the shelf, and see X on it.
  3. Remove X. Anchor: the shelf without X, plus another title still present.
  4. Apply the Task 1 storage anchor.
  5. `RestartPlayer()`, then `SeeStartupFinished()`.
  6. The shelf still shows the other titles and not X.
- [ ] **Step 2: Scenario `an added game survives a restart`** (may merge into Step 1): `OpenGameFile(Y)`, `RestartPlayer()`, then Y is on the shelf and opens.
- [ ] **Step 3: RED (web),** scenario `a removed game comes back without its old saves`:
  1. `OpenGameFile(S)` (the 2d saves fixture), then save slot 1 and see it filled.
  2. Return to the shelf and remove S.
  3. `OpenGameFile(S)` again.
  4. Slot 1 is empty. Use a settled anchor (`SeeSlotEmpty` is not one): first check that another slot shows its loaded state, or that the save list finished loading. If there is no loaded marker, add a non-visible one.
  5. This fails on web today and is green on desktop.
- [ ] **Step 4: Fix B1 (⚠):** `fix(browser): removing a game deletes its saves`. GREEN on both targets. Discrimination: revert, and Step 3 fails on web.

## Task 3: Re-import (+ B4)

**Files:** `scenarios/shelf.scenario.ts` or `open-routes.scenario.ts`; `apps/player/src/app/init.ts`.

- [ ] **Step 1: Scenario `re-importing a game replaces its shelf entry`** (both targets): open game file v1, then v2 of the same id with a different title (a fixture pair). The shelf shows only the v2 title, once.
- [ ] **Step 2: RED (web only)** for the URL route: import v1 by `?game=` (served dir), then v2 by `?game=`. The shelf shows the v2 title. This fails today, because the second import keeps v1.
- [ ] **Step 3: Fix B4 (⚠):** `fix(player): a URL import replaces an existing shelf entry`, then GREEN. Discrimination: revert, and Step 2 fails.

## Task 4: Language

**Files:** `scenarios/language.scenario.ts` (new); `screenplay/shelf/` (the locale task and checks); a support helper that reads `public/locales/<lng>/translation.json` at test time. Node-side; no page script.

- [ ] **Step 1: Scenario `switching the language re-renders the player and persists`** (both targets):
  1. Shelf: switch to `ru-RU`.
  2. A hooked UI string equals the `ru-RU` translation from the locale file.
  3. `RestartPlayer()`, then `SeeStartupFinished()`. The string is still the `ru-RU` value, and the selector shows `ru-RU`.
  4. Switch back to `en-US`, and the string equals the `en-US` value.
- [ ] **Step 2: Scenario `the pause-screen language select switches the language`** (both targets): open a game, open the pause screen and Preferences, pick `uk-UA` in the pause select, and a pause-screen hooked string equals the `uk-UA` value.
- [ ] **Step 3: Discrimination:** temporarily make `changeLanguage` a no-op; Step 1 fails. Then remove the detector's `localStorage` cache; the after-restart row fails. Revert both.

## Task 5: Player theme (+ defect 12)

**Files:** `scenarios/player-theme.scenario.ts` (new); `libs/game-state/src/player-theme.ts`.

- [ ] **Step 1: RED,** scenario `the dark player theme persists across a restart` (both targets):
  1. Shelf: toggle to dark, and see `data-player-theme="dark"`.
  2. `RestartPlayer()`, `SeeStartupFinished()`.
  3. The marker is `dark`. This fails today (defect 12).
  4. Toggle again, and the marker is `light`.
- [ ] **Step 2: Fix (⚠):** `fix(game-state): a saved player theme is kept at startup`. The saved value wins; the OS preference applies only when nothing is saved. GREEN on both targets. Discrimination: revert, and Step 1 fails.

## Task 6: Desktop launch notice language (B3, RED first)

**Files:** `scenarios/language.scenario.ts`; `apps/player-desktop/src/app/init.ts` (the fix, only if RED).

- [ ] **Step 1: Scenario `the launch notice uses the saved language` (desktop only).**
  1. Switch to `ru-RU`.
  2. `RestartPlayer()`. Desktop relaunches with the pack, which imports more than one game, so the "N games added" toast shows.
  3. The toast text equals the `ru-RU` translation of `{{ count }} games added to shelf`, interpolated.

  Locate the toast through `notice-toast`, and catch it before it auto-hides after 3 s. Anchor on the toast itself: check it right after the restart, before `SeeStartupFinished()` if needed, and record the ordering.

- [ ] **Step 2: If RED, fix (⚠):** `fix(desktop): the launch notice waits for translations`. Await i18n readiness (or resolve the message at render time) before `addImported` builds the notice. GREEN. Discrimination: revert, and the scenario fails.
- [ ] **Step 3: If GREEN today,** keep the scenario as a regression guard, record "B3 not reproduced" in the ledger and the inventory, and make no product change.

## Task 7: Docs

- [ ] **Step 1: Inventory.**
  - §M rows: ✅ with scenario names.
  - The 2h list: done.
  - Defect 12: fixed in 2h. B1, B3 (fixed or not reproduced) and B4 recorded as fixed.
  - B2 as a feature gap.
  - Add B6–B10 and the desktop single-instance note as open.
  - Phase 2 is now complete; say so where the inventory tracks batch status.
- [ ] **Step 2: README:**
  - the new hooks (Locating elements);
  - the shelf remove and locale tasks;
  - the locale-file helper;
  - the desktop-relaunch-uses-the-pack caveat for persistence tests.
- [ ] **Step 3:** commit `docs(e2e): player-side integrations coverage (2h)`.

## Task 8: Whole-branch review and verification

- [ ] **Step 1:** Final whole-branch review on the most capable model. Apply its findings in one fix wave, followed by one scoped re-review.
- [ ] **Step 2:** Run `nx format:check --all`, lint and typecheck. Then run **one** `pnpm check:full`, and read `CHECKFULL_EXIT=` and the desktop `Spec Files:` line from the log body.
- [ ] **Step 3:** Push and open a PR against `main`. The PR body covers:
  - the ⚠ fixes;
  - the hooks;
  - the parked items;
  - the desktop duration.
