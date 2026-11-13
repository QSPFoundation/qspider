# Debugger: variable values, watch list, break on change

Date: 2026-11-13. Engine `@qsp/wasm-engine` 2.0.0 (core 5.9.6). Background: memory note
`variable-reading-research` (items B4, B8). Builds on PR #210 (shared variable layer) and #212 (debugger in the
desktop player, bundled Monaco, debugger E2E).

## Intent

When a game misbehaves, the author's first question is "what is this variable's value right now?" The second is
"where did it change?" The F12 debugger can pause, step and set breakpoints, but it shows no variables at all.
The maintainer wants the debugger to answer both questions, the first one more.

## Decisions (maintainer's)

1. **No variable browser.** Big games have thousands of variables, and an author needs only a few at a time.
2. **The first version contains:**
   - values on hover in the code
   - a watch list
   - break on change
   - the record-display fix in `<qsp-variable>` (below)
3. **Deferred:**
   - hover inside `<<...>>` interpolation in strings
   - the expression box (B6)

   **Out:** save inspection (B7).

4. **Approach (a):**
   - Game-state owns the watch list and snapshots the watched values at each debug stop.
   - Hover reads the engine on demand.
   - `libs/debugger` only renders.
5. **Watching runs only while the debug panel is open.** No snapshots and no reads happen while it is closed.
6. **Closing the panel stops all pausing.**
   - While the panel is closed, breakpoints, break-on-change and link auto-pause are ignored. They are kept, not deleted, and work again when the panel reopens.
   - This changes today's behaviour: a breakpoint used to pause the game behind a closed panel.
7. **Fix in the same work:** `formatQspValue` (`libs/game-state/src/variable-logic.ts`) ignores record field names. So `<qsp-variable name="%r">` shows `['Ann', 30]` where QSP prints `[NAME: 'Ann', AGE: 30]`.

8. **Closing the panel while paused auto-resumes.** A held debug stop is released and `isPaused` cleared. A link
   execution held by link auto-pause runs, since the player clicked it.
9. **Closing the panel turns engine debug mode off, and reopening turns it back on if it was on.** The "was on"
   state is remembered. This keeps the "no slowdown while closed" anti-goal: with debug mode on, the engine stops
   before every line even when nothing pauses.

### Builder-check calls (Claude's, for the maintainer to check)

- **Game identity:** the watch list is keyed by the shelf entry id (`currentGameEntry$.value.id`), the same id saves
  use, which is stable across restarts.
- **Stored shape:** only the watched names are stored. The "pause on change" toggle is not persisted, so a
  forgotten toggle can't pause a fresh session.
- **Entry identity:** names are compared case-insensitively, but the prefix counts. `$a` and `a` are two entries
  (they read differently); `A` and `a` are one. Pinning an existing entry doesn't duplicate it.
- **Baseline resets:** no highlight and no pause on the first snapshot after the panel opens, after a game start or
  restart, after OPENQST, and after a save load.
- **Reporting:** every changed watched entry is reported and highlighted, not just the first. A pause happens if
  any entry with the toggle on changed.
- **Attribution:**
  - The watch list also snapshots after each engine run (the same hook used when debug mode is off).
  - A change seen at the first stop of a run was made between runs (a link's `execCode`, an event). It is labelled
    "changed between runs", not blamed on a line.
  - A change made by the last line of a run shows up in the end-of-run snapshot. It is attributed to that line,
    but there is nothing left to pause at, so it is highlighted and reported without pausing.
- **Hover on an unset name** shows "not set" (the raw read is undefined and the size is 0), not a misleading `0` or
  `''`.

## Engine facts (probed 2026-11-13 with throwaway scripts against the real engine)

- **Debug stops:**
  - With debug mode on, the engine emits a `debug` record before each **line** and waits for `resume()`.
  - At that stop, these return correct values and stay stable until resume: `readVariable`, typed reads (`$`, `#`, `%`), `readVariableSize`, `readVariableByIndex`, `readVariableByKey`.
  - Resuming afterwards works, and later `execCode` works.
- **One stop per line, not per statement.** `GOLD -= 30 & $WHO = 'Ann'` is one stop. A change seen at stop N was made by the line of stop N-1, which the debugger keeps in its execution history.
- **Records:**
  - `%r = [name: 'Ann', age: 30]` reads as the tuple `['Ann', 30]` with `names: ['NAME', 'AGE']`. Field names are upper-cased.
  - QSP prints it as `[NAME: 'Ann', AGE: 30]`.
  - A tuple without names has no `names` property.
- **Tuple keys.** `$m[1, 2] = 'cell'` stores an item whose key is the tuple `[1, 2]`. `readVariableItem` returns `{ value, key }`, and `readVariableByKey` accepts a tuple key.
- **Code text.** Debug records and the code viewer show code upper-cased (`GOLD`). Engine name lookup is case-insensitive.
- **Watchers.** Engine watchers fire after a whole engine run, not at each line, so they can't show values mid-location. Also, `openGame(_, true)` wipes them.

## Goals

### Hover (my calls; the maintainer agreed with "generally yes")

- **When it shows.** Hover works on the QSP tokenizer's `variable` tokens (`$x`, `#x`, `%x`) and on `identifier` tokens (unprefixed names) that are not keywords, in the code viewer (`language="qsp"`). It works whether or not the game is paused: reads are synchronous and happen between engine runs.
- **What it shows:**

  | Hovered text                                              | Shows                                                       |
  | --------------------------------------------------------- | ----------------------------------------------------------- |
  | `name`, `$name`, `#name`, `%name`                         | the value read with the name as written                     |
  | `$a[0]`, `$a['key']`, `$m[1, 'x']` (literal index or key) | that item                                                   |
  | `$a[i]` (index is one plain variable name)                | reads `i`, then that item, labelled with the resolved index |
  | `$a[i + 1]` (any other expression)                        | the array summary, because evaluating would run code        |
  | `$a` alone                                                | item count plus the first few items                         |

- **Prefix mismatch hint.** When a prefix hides the stored value (`$t` where `t` holds a tuple, `#u` where `u` holds `'42'`), the hover shows the typed value **and** "stored value is a <type>: <value>". This takes one extra raw read.
- **Format.** Values use QSP's printed form (see Records). Long values are truncated with an item count.
- **Pin.** A pin action in the hover adds the variable (the array, not the item) to the watch list.

### Watch list (my calls)

- **What it is.** A list of variable names (any prefix), shown in the debugger panel. You add an entry from the hover pin or by typing a name, and remove it with a button.
- **Saved per game.** It is stored in localStorage keyed by game id, the same way the dock position is stored.
- **Expanding.**
  - Arrays expand to their items with keys, for example `[1, 2] → 'cell'`.
  - Tuples expand to numbered rows, and records to named rows.
  - Nested values expand further.
- **Changed values.** A value that changed since the previous snapshot is highlighted.
- **When values refresh.**
  - In debug mode: at every stop.
  - With debug mode off: after each engine update.
  - Always only while the panel is open, and they are read fresh when it opens.

### Break on change (maintainer: in the first version; details are my calls)

- Each watch entry has a "pause when it changes" toggle.
- At each debug stop while the panel is open, a snapshot of the watched variables is compared with the previous one. If an entry with the toggle on changed, the debugger pauses.
- It shows `<name> changed <old> → <new> at <location>, line <n>`, where the line is the previous stop's record.
- It needs debug mode. With debug mode off the toggle is shown disabled, with a hint.

### Records

- `formatQspValue` prints named items as `NAME: value`. Unnamed items in the same tuple print as today.
- Nested records keep working.
- `<qsp-variable>` and the debugger use the same function.

## Non-goals

- Variable browser or enumeration.
- Expression evaluation (deferred).
- Save inspection (out).
- Hover in `<<...>>` (deferred).
- Hover on the Description tab (HTML).
- Writing or changing variables from the debugger.
- No engine changes.

## Anti-goals

- No game slowdown when the debugger panel is closed. That means zero reads, and the check for this is `isDebugPanelOpen$`.
- No noticeable slowdown per debug stop with a handful of watched variables.
- No regression in existing debugger scenarios (`apps/player-e2e/scenarios/debugger.scenario.ts`) or variable scenarios.
- No engine mocks. Unit tests cover pure functions only, and engine behaviour is proved by E2E (house rule).

## Constraints

- Monaco is bundled in the debugger's lazy chunk (#212). New UI must stay inside it. Game-state code stays engine-API based and loads nothing from Monaco.
- E2E rules in `apps/player-e2e/README.md` apply: area `debugger`, locating by `data-qa`, `seeEventually`.
- Desktop E2E runs on CI only (Linux and Windows), so hover must be triggerable portably. Prefer Monaco's keyboard command "Show Hover" (`Ctrl+K Ctrl+I`) with the cursor placed on a token, or another portable path, over raw mouse movement, if mouse hover proves unreliable under WebdriverIO.
- Watch-list storage follows the existing `readDebuggerUiState` / `persist*` pattern in `debug.ts`.

## Approaches

|                     | (a) game-state snapshots at stops (picked) | (b) reuse the shared variable layer | (c) read in UI components                                   |
| ------------------- | ------------------------------------------ | ----------------------------------- | ----------------------------------------------------------- |
| Values while paused | exact, per line                            | stale (watchers fire after a run)   | exact                                                       |
| Break on change     | works                                      | can't see mid-run changes           | needs a check at every statement even when nothing is drawn |
| Where logic lives   | game-state (pure diff is unit-testable)    | variables.ts                        | UI library                                                  |

The maintainer picked (a), with watching limited to while the panel is open.

## Tests

**E2E** (new scenarios in `debugger.scenario.ts`; the fixture `fixtures/debugger/` gets watch-friendly code: numbers,
a string, an array with string and tuple keys, a record):

1. **Hover while paused.** Hovering a variable at a breakpoint shows its value. A string, a number and a record in
   QSP form all appear.
2. **Pin and step.** Pin a variable from the hover. Step: the watch value updates and is marked as changed.
3. **Break on change.**
   - With the toggle on, resume.
   - The game pauses at the line after the change, and shows the changing location and line, plus old → new.
4. **Closed panel doesn't pause; closing releases a pause.**
   - Paused at a breakpoint, close the panel: the game continues (the main text shows the rest of the location).
   - With a breakpoint set, close the panel and trigger the location. The game runs through, with the main text
     showing the location's text.
   - Reopen and trigger again: it pauses.
5. **Watch list saved per game.** It survives a player restart, following the README shelf-settle rule before
   `RestartPlayer`.
6. **Prefix mismatch hint.** Hovering `#u` where `u` holds `'42'` shows `0` and the stored string.
7. **`<qsp-variable>` shows a record the QSP way.** Added to `variables.scenario.ts` (`game-html.qsps` watchers).
   It fails on main before the fix.

**Unit** (pure):

- `formatQspValue` with records
- the snapshot diff (which entries changed)
- the hover read plan: from a token plus its index text to which reads to make (literal, plain-variable index,
  expression → summary)
- watch-list storage parse and serialize

## Left to the builder

- The panel layout for the watch list. Follow the existing panel style, docking and sizing.
- How the watch list refreshes after engine updates when debug mode is off. One option is re-reading on the
  engine events game-state already handles. Another is engine watchers for the watched names while the panel is
  open; those must be re-attached after `OPENQST`.
- Truncation limits for the hover and the summary.
- The exact `data-qa` names.
