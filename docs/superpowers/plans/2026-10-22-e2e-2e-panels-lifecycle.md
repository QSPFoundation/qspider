# E2E Batch 2e — Panels, lifecycle, system commands Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cover inventory §B (panels), §J (lifecycle and timing) and §K (`qspider.*` system commands) with real-engine E2E scenarios on both targets. This includes the counter-pause-during-dialog tests deferred from 2b, and the first reusable in-page script check.

**Architecture:** One new fixture game, `panels`, opened via `OpenGameFile`. Each area of the game lives in its own location, reached from `start` (at most 8 actions per location: Serenity's `isVisible()` treats an action scrolled out of view as invisible, as found in 2d). New screenplay areas `stats/`, `objects/` and `cmd/`. New support primitive `support/page-script.ts` built on Serenity's cross-target `ExecuteScript`. It may only **observe** the page (install a listener, read a value), never change app state; 2f′ reuses it for CSS custom properties.

**Tech Stack:** Serenity/JS screenplay; web = Playwright (`CHROME_BIN=/usr/bin/chromium`); desktop = WebdriverIO + tauri-driver (`run-desktop-e2e.mjs` only); fixture `.qsps` + TOML `game.cfg` with `[game.hotkeys]`.

**Spec:** `docs/superpowers/specs/2026-10-21-e2e-phase2-design.md` (2e, "System-command observability") and `docs/superpowers/specs/2026-10-21-e2e-engine-inventory.md` §B, §J, §K + the "2e" list.

**Maintainer decisions (2026-10-22):**

- The page-script check is **introduced in 2e**; 2f′ reuses it.
- `change_theme` **moves to 2f**.
- `fullscreen:`: on web, assert `document.fullscreenElement` through the page-script check. If Chromium refuses without a user gesture, assert "no error, game continues" instead and record why. On desktop, assert "no error, game continues" (Xvfb has no window manager).

## Global Constraints

- Everything goes through NX / pnpm scripts. Desktop E2E only via `node apps/player-e2e/targets/desktop/run-desktop-e2e.mjs --spec <file>` after `pnpm nx run player-e2e:build-desktop-e2e`, with `PATH="$HOME/.cargo/bin:$PATH"`, one run at a time, waiting for it to finish. Never touch the real session; never kill processes by name.
- README Rules: locate only by `[data-qsp…]` / `[data-qa…]` / `[role=…]`; `By` only in `elements.ts`; checks via `seeEventually`; presence helpers; no `Ensure`/`isPresent` outside `support/`; no `Wait.for`; no dynamic `import()`; `screenplay/**` ≤150 lines; `tasks.ts` imports only `common/checks.ts`.
- `ExecuteScript` and any in-page script live **only** in `screenplay/support/page-script.ts`. Scripts are read-only observers.
- Markers: `*clr & *pl 'MARKER'` (or a stats/region write) per observable outcome; unique ALL-CAPS strings, referenced only via `fixtures/panels-game.ts`.
- Absence checks need a settled anchor; blocked/paused behaviour is proved by a positive outcome where possible.
- `scenario.webOnly` / `.desktopOnly` only on evidence reproduced twice, with a code comment and a PR-body line.
- ⚠ A fix that changes player-visible behaviour → stop and report to the controller (the maintainer decides). Non-visible defects are fixed in this PR.
- Local verification: targeted specs per task (web + desktop). `nx format:check --all`, lint and typecheck before every commit. **One** `pnpm check:full` at the very end, after the final review's fixes; read `CHECKFULL_EXIT=` and the desktop `Spec Files:` line from the log body.
- Plain branch `feat/e2e-2e-panels-lifecycle`, no worktree.

## Review Focus

- **Restart outside the pause screen** (probe, unverified): the `restart` command (`current-game.ts:285-291`) sets `isPaused$` true, then calls `closePauseScreen()`, which runs `history.back()` whenever `window.history.length > 1`. So Ctrl+R or `qspider_restart` during play may navigate back (e.g. to the shelf), or leave the counter paused. → Task 6.
- **Command line submit runs `$USERCOM`?** The player calls only `api.updateUserInput` (the engine API documents it as "updates user input variable"); nothing visibly calls `$USERCOM`. → Task 3 probe.
- **Custom hotkey colliding with a global one** (e.g. a game binding `1`): the expected behaviour is unclear. Not in scope; the fixture uses non-colliding keys. Noted only.
- **Panel hidden then shown keeps its content** (stats text survives `showstat 0` → `showstat 1`). → Task 3.
- **Counter must resume after every pause** (msg/input/menu/pause screen close). A stuck pause is the real-world failure. → Task 7 asserts the resume positively.

---

## File Structure

- Fixture: `apps/player-e2e/fixtures/panels/{panels.qsps,game.cfg,obj.png}`. `obj.png` is a tiny valid PNG (copy `fixtures/dialogs/view.png`). Constants in `fixtures/panels-game.ts`; registry lines in `fixtures/archives.ts`, `fixtures/build-fixtures.ts` and `fixtures/build-fixtures.spec.ts` (zip, like dialogs).
- Screenplay: new `screenplay/stats/`, `screenplay/objects/`, `screenplay/cmd/` (elements/tasks/checks as needed); extend `screenplay/game/` (Space, hover, action selected) and `screenplay/pause/` (restart button); new `screenplay/support/page-script.ts`; extend `screenplay/content/` checks if region/layer checks are reused from 2c.
- Scenarios: `scenarios/panels.scenario.ts`, `scenarios/actions.scenario.ts`, `scenarios/system-commands.scenario.ts`, `scenarios/lifecycle.scenario.ts`, `scenarios/counter.scenario.ts`.
- Docs: `apps/player-e2e/README.md` (page-script rule, new areas, fixture), inventory §B/§J/§K E2E column.

---

## Task 1: The `panels` fixture game

**Files:** create `fixtures/panels/{panels.qsps,game.cfg,obj.png}` and `fixtures/panels-game.ts`; modify `fixtures/archives.ts`, `fixtures/build-fixtures.ts`; test `fixtures/build-fixtures.spec.ts`.

**Interfaces — Produces** `PANELS_GAME` (frozen, no framework imports): `path`, `title: 'Panels game'`, and `action`/`text` entries for every location below. Exact strings:

| Location (action from `start`) | Content                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `start`                        | `*pl 'PANELS START'`; actions `Stats`, `Objects`, `Command line`, `Action keys`, `System`, `Lifecycle`, `Counter` (7)                                                                                                                                                                                                                                                                                                                |
| `stats`                        | `*clr & *pl 'STATS ROOM'`; `Write stats` → `pl 'STATS ONE'` (stats panel); `Add stats` → `pl 'STATS TWO'`; `Hide stats` → `showstat 0`; `Show stats` → `showstat 1`; `Hide actions` → `showacts 0` + `*pl 'ACTIONS HIDDEN'`; main text always holds a link `<a href="exec:showacts 1" data-qa="show-acts">` so the actions can be brought back                                                                                       |
| `objects`                      | `*clr & *pl 'OBJECTS ROOM'`; `Add object` → `addobj 'Lamp', 'obj.png'`; `Add plain` → `addobj 'Key'`; `Remove plain` → `delobj 'Key'`; `$ONOBJSEL` location `onobjsel` → `*clr & *pl 'SELECTED <<$selobj>>'`; `Hide objects` → `showobjs 0`; `Show objects` → `showobjs 1`                                                                                                                                                           |
| `cmd`                          | `*clr & *pl 'CMD ROOM'`; `Show input` → `showinput 1`; `Hide input` → `showinput 0`; `Set input` → sets the input line to `PRESET` from game code (the QSP 5.9 way; implementer checks); `$USERCOM` location `usercom` → `*clr & *pl 'TYPED <<$user_text>>'`                                                                                                                                                                         |
| `keys`                         | `*clr & *pl 'KEYS ROOM'`; actions `First` → `*clr & *pl 'KEY ONE'` … up to `Third` → `KEY THREE`; plus `Single` location `single` with exactly one action `Only` → `*clr & *pl 'SPACE RAN'`                                                                                                                                                                                                                                          |
| `system`                       | `*clr & *pl 'SYSTEM ROOM'`; `Fire event` → `gs 'qspider_event', 'e2e_event', 'A', 7`; `Region` → `gs 'qspider_update_region', 'reg', 'REGION ONE'` (with `<qsp-region name="reg">` in main); `Layer` / `Unlayer` → `qspider_show_layer` / `qspider_hide_layer` for `<qsp-layer name="lay" index="1">LAYER ON</qsp-layer>`; `Fullscreen` → `exec 'qspider.fullscreen:on'` then `*pl 'AFTER FULLSCREEN'`; `Quit` → `gs 'qspider_quit'` |
| `life`                         | `*clr & *pl 'LIFE ROOM'`; sets `lifemark = 1` and shows `LIFEMARK=<<lifemark>>`; `Restart via game` → `gs 'qspider_restart'`; a region/layer filled on entry, so restart shows they are reset                                                                                                                                                                                                                                        |
| `counter`                      | `*clr & *pl 'COUNTER ROOM'`; on entry `settimer 100` and `$counter = 'tick'`; `tick` location → `ticks += 1` and writes `TICKS=<<ticks>>` to the stats panel (`*`-free: `clr & pl`); actions `Message` → `msg 'COUNTER MSG'`; `Input` → `$x = input('COUNTER INPUT')`; `Menu` → a 1-item menu; `Stop timer` → `$counter = ''`                                                                                                        |

`game.cfg`: `id = "panels"`, `title = "Panels game"`, `file = "panels.qsps"`, and `[game.hotkeys]` with `k = "hotkey_loc"`, where location `hotkey_loc` → `*clr & *pl 'HOTKEY RAN'`. The table names intents. Where QSP 5.9 syntax differs (e.g. the input-line variable or the object-select variable), use the correct QSP and record it in the constants' doc comments. Keep every location at ≤8 actions.

- [ ] **Step 1:** `build-fixtures.spec.ts` case: `ARCHIVES.panelsZip.path` exists, has the zip magic, and contains `panels.qsps`, `game.cfg` and `obj.png`. `pnpm nx test player-e2e` → FAIL.
- [ ] **Step 2:** Author the fixture + constants + registry. `pnpm nx test player-e2e` PASS; lint clean.
- [ ] **Step 3:** Commit `test(e2e): add panels fixture game (2e)`.

## Task 2: Panel screenplay vocabulary + page-script primitive

**Files:** create `screenplay/stats/{elements,checks}.ts`, `screenplay/objects/{elements,tasks,checks}.ts`, `screenplay/cmd/{elements,tasks,checks}.ts`, `screenplay/support/page-script.ts`; modify `screenplay/game/{elements,tasks,checks}.ts`, `screenplay/pause/elements.ts`, `apps/player-e2e/eslint.config.js` (ban `ExecuteScript` outside `support/`, like `Ensure`).

**Interfaces — Produces:**

- `stats/`: `StatsPanel` (`[data-qsp="stats"]`), `StatsContent` (`[data-qsp="stats-content"]`); `SeeStats(text)` (exact, trimmed), `SeeStatsContaining(text)`, `SeeNoStatsPanel()` (`waitUntilAbsent`; needs an anchor).
- `objects/`: `ObjectsPanel` (`[data-qsp="objects"]`), `ObjectItem(name)` (`[data-qsp="object"]` filtered by `[data-qsp="object-name"]` text = name, via `visible()`), `ObjectImage(name)` (`[data-qsp="object-image"]` within it); `SelectObject(name)`; `SeeObjects(names: string[])` (ordered names), `SeeObjectImage(name, file)` (`src` ends with `file`), `SeeNoObjectsPanel()`.
- `cmd/`: `CommandLine` (`[data-qsp="cmd"]`), `CommandInput` (`[data-qsp="cmd-input"]`); `SubmitCommand(text)` (TypeInto + Enter), `SeeCommandInput(text)` (value), `SeeNoCommandLine()`.
- `game/`: `PressSpace()`, `HoverAction(label)` (support `Hover`), `SeeActionSelected(label)` (`data-qsp-selected` present on that action), `SeeNoActionsPanel()` (on `[data-qsp="actions"]`).
- `pause/elements.ts`: `RestartButton` (`[data-qsp-command="restart"]`).
- `support/page-script.ts`:
  - `RecordWindowEvents(type: string): Interaction`: installs, once per page load, a listener that appends each event's `detail` to `window.__e2eEvents[type]`.
  - `RecordedEvents(type): Question<Promise<unknown[]>>`.
  - `SeeRecordedEvent(type, expected: unknown)`: seeEventually-style polling, until some recorded `detail` deep-equals `expected`.
  - `SeePageProbe(name, expected)`: polls one of a fixed set of named read-only probes (`fullscreenElementMarker`: the `data-qsp` of `document.fullscreenElement`, or null; Task 7 may add `pageClock`).
  - No arbitrary-code export: callers pick named probes, so scenarios can't smuggle state changes.
  - Implement with `ExecuteScript.sync` + `LastScriptExecution.result()` from `@serenity-js/web`, which works on Playwright and WebdriverIO alike. Polling reuses `support/polling.ts`.

- [ ] **Step 1:** Implement. Lint: write a throwaway file outside `support/` that imports `ExecuteScript`, confirm lint fails, delete it. Typecheck clean; files ≤150 lines.
- [ ] **Step 2:** One throwaway (uncommitted) scenario proving the round-trip on both targets: open the fixture, `RecordWindowEvents('qspider-event')`, click `System` → `Fire event`, `SeeRecordedEvent` passes. Run web and desktop; delete the file.
- [ ] **Step 3:** Commit `test(e2e): panel vocabulary and read-only page-script check (2e)`.

## Task 3: Panels — stats, objects, command line, visibility

**Files:** create `scenarios/panels.scenario.ts`.

- `the stats panel shows what the game writes`: Stats → Write stats → `SeeStats('STATS ONE')` → Add stats → `SeeStatsContaining('STATS TWO')` and still `STATS ONE`.
- `hiding and showing the stats panel keeps its content`: write → `SeeStats` (anchor) → Hide → `SeeNoStatsPanel` → Show → `SeeStats('STATS ONE')`.
- `objects are listed in order with their images`: Add object, Add plain → `SeeObjects(['Lamp','Key'])`, `SeeObjectImage('Lamp','obj.png')` → Remove plain → `SeeObjects(['Lamp'])`.
- `selecting an object runs the game's selection code`: `SelectObject('Lamp')` → `SeeMainText('SELECTED Lamp')` (exact marker per constants).
- `hiding the objects panel`: anchor `SeeObjects` → Hide → `SeeNoObjectsPanel` → Show → `SeeObjects`.
- `the command line runs the game's command handler` (**probe**): Show input → `SubmitCommand('hello')` → `SeeMainText('TYPED hello')`. If `$USERCOM` never runs, that's a defect: find the cause (engine API vs player). If the fix is player-side and invisible, fix it; otherwise report. Do not commit a failing or an assertion-free scenario.
- `the game can set the command line`: Set input → `SeeCommandInput('PRESET')`.
- `hiding the command line`: Show → anchor present → Hide → `SeeNoCommandLine`.
- `hiding the actions panel` (panel_visibility ACTS): Hide actions → `SeeNoActionsPanel` (anchor: the main text marker the action wrote) → `show-acts` link → actions back (`ClickAction` works again).

Typing on desktop: 2c found WebKit `sendKeys` drops characters in Shift sequences and even plain text on CI. Use lowercase plain text. If desktop proves flaky (reproduced twice), make the typing scenarios `webOnly` with the reason.

- [ ] **Step 1:** Scenarios; web then desktop. Probe results go in the report.
- [ ] **Step 2:** Commit `test(e2e): stats, objects, command line and panel visibility (2e)`.

## Task 4: Action selection — hotkeys 1-9, Space, hover

**Files:** create `scenarios/actions.scenario.ts`.

- `digit keys run the action at that position`: Action keys → `PressActionHotkey(2)` → `KEY TWO`; `PressActionHotkey(3)` → `KEY THREE`.
- `a digit key beyond the action count does nothing`: keys room → `PressActionHotkey(9)` → then `PressActionHotkey(1)` → `KEY ONE` (positive anchor: the game still accepts input, the main text is the expected one, and no error alert).
- `space runs the only action`: Single → `PressSpace()` → `SPACE RAN`.
- `space does nothing when there are several actions`: keys room (3+ actions) → `PressSpace()` → `PressActionHotkey(1)` → `KEY ONE`, which proves Space ran none of them: a Space that ran an action would have changed the room text, and `KEY ONE` must be exact.
- `hovering an action selects it`: `HoverAction('Second')` → `SeeActionSelected('Second')`; `MoveAway` → no longer selected (anchor: it was selected).

- [ ] **Step 1:** Scenarios; web then desktop (Hover on desktop worked in 2c).
- [ ] **Step 2:** Commit `test(e2e): action hotkeys, space and hover selection (2e)`.

## Task 5: System commands

**Files:** create `scenarios/system-commands.scenario.ts`.

- `a game event reaches the page`: `RecordWindowEvents('qspider-event')` → System → Fire event → `SeeRecordedEvent('qspider-event', { name: 'e2e_event', args: ['A', 7] })`. Note `qspider_event` sends string args as `~A~` and numbers bare; check what `parseArgs` produces and assert exactly that.
- `the game updates a region through the qspider module`: Region → region text `REGION ONE` (reuse 2c's region check if one exists).
- `the game shows and hides a layer`: Layer → `LAYER ON` present → Unlayer → absent (anchor: it was present).
- `going fullscreen`: web: Fullscreen → `SeePageProbe('fullscreenElementMarker', 'game-root')` (or the actual `data-qsp` of `qsp-game-root`). If Chromium refuses without a gesture, fall back to `AFTER FULLSCREEN` + no error alert, as `webOnly` + `desktopOnly` variants per the maintainer decision. Desktop: `AFTER FULLSCREEN`, no error alert, an action still works.
- `quitting from the game returns to the shelf`: Quit → shelf shows the game (`SeeShelfIncludes('Panels game')`).

- [ ] **Step 1:** Scenarios; web then desktop.
- [ ] **Step 2:** Commit `test(e2e): qspider system commands (2e)`.

## Task 6: Lifecycle — restart, custom hotkeys

**Files:** create `scenarios/lifecycle.scenario.ts`; modify `screenplay/game/tasks.ts` (`PressRestartHotkey()` = Control+r).

- **Probe first** (Review Focus 1): in the life room, press Ctrl+R during play (pause screen closed). Does the game restart to `PANELS START` and stay on the game screen, or navigate back? Does the counter still run afterwards? Use the counter room: enter, then `life`, Ctrl+R, enter counter, `TICKS` advances. Repeat for `Restart via game` (`qspider_restart`). If it misbehaves, find the root cause. If the fix is invisible, fix it with a RED→GREEN scenario. If it changes what players see beyond "restart now works", report to the controller first.
- `the pause screen's restart starts the game over`: life → Escape → `RestartButton` → `SeeMainText('PANELS START')`, pause screen gone.
- `Ctrl+R restarts the game`: life → Ctrl+R → `PANELS START` (asserted per the probe outcome).
- `the game can restart itself`: life → Restart via game → `PANELS START`.
- `restart resets regions and layers`: life (region and layer filled on entry; anchor: both seen) → restart → re-enter `life` only after checking they are gone/reset on `start`. Pick the observable the fixture makes unambiguous.
- `a game.cfg hotkey runs its location`: start → press `k` → `HOTKEY RAN`.

- [ ] **Step 1:** Probe, then scenarios; web then desktop. Ctrl+key on desktop worked in 2d.
- [ ] **Step 2:** Commit `test(e2e): restart and game.cfg hotkeys (2e)` (+ a separate `fix(...)` commit if the probe finds a defect).

## Task 7: Counter / SETTIMER and pause during dialogs

**Files:** create `scenarios/counter.scenario.ts`; if the ruling below is approved, modify `screenplay/support/page-script.ts` (a `PageClockAdvanced(ms)` wait).

- `the counter runs the game's timer location`: Counter → `SeeStatsContaining('TICKS=3')`. The ticks are a positive, eventual measure.
- `the counter resumes after a message / an input / a menu / the pause screen` (four scenarios or one parameterised table): open the dialog; read the current ticks; close the dialog; then see ticks advance past that reading by ≥2.
- `the counter does not run while a message is open` (and the same for input, menu, pause screen): **needs the ruling below.**

**Ruling to approve with this plan — waiting for elapsed time.** A "did not tick while paused" check is about time passing. No UI event marks "enough time has passed". Options:

- (a) **Recommended:** a named, bounded wait on the page's own clock, `PageClockAdvanced(ms)` in `support/page-script.ts`. It reads `performance.now()` via the read-only probe and polls until ≥ `ms` have passed. It is used only by the counter-pause scenarios, with `ms = 5 × timer interval` (500ms at `settimer 100`). Sequence: open the dialog → read ticks T → `PageClockAdvanced(500)` → ticks still T → close → ticks > T. This is a documented exception to "no fixed sleeps": it waits for the condition under test (elapsed time) and is never used to paper over a race.
- (b) Assert only "resumes after" (above) and skip "does not run while open". Weaker: a counter that never paused would pass.

- [ ] **Step 1:** Scenarios (with (a) if approved); web then desktop. On a 100ms timer, desktop WebKit may throttle timers in a hidden Xvfb window. If ticks are slow there, raise `settimer` rather than the wait.
- [ ] **Step 2:** Commit `test(e2e): counter, SETTIMER and pause during dialogs (2e)`.

## Task 8: Docs

**Files:** `apps/player-e2e/README.md` (support list gets `page-script.ts` and its read-only rule; new areas; panels fixture in the pack description; the (a) exception if approved), inventory §B/§J/§K E2E column.

- [ ] **Step 1:** Edit; `nx format:check --all`.
- [ ] **Step 2:** Commit `docs(e2e): panels, lifecycle and system commands coverage (2e)`.

## Final verification

- [ ] Whole-branch review on the most capable model; one fix wave; scoped re-review.
- [ ] `nx format:check --all`, lint, typecheck, then **one** `pnpm check:full` to a log; read `CHECKFULL_EXIT=` and desktop `Spec Files:`.
- [ ] Push and open a PR. The body covers: scenarios, probe outcomes (restart, USERCOM), any `webOnly` with its evidence, ⚠ visible fixes, the page-script primitive and the (a) exception.
