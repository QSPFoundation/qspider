# Debugger: current actions

Date: 2026-11-14. Engine `@qsp/wasm-engine` 2.0.0 (core 5.9.6). Step 2 of three (step 1 = #215, QSP code that reads
right; step 3 = navigation). Background: memory notes `debugger-next-steps`, `debugger-followups`.

## Intent

The debugger lists only a location's **base** actions (the ones stored in the game file), on the Actions tab of the
code viewer. The actions the player actually sees, the **current actions**, are not listed anywhere. The engine
now exposes their code (`api.getActionCode(index)`), so the debugger can show them.

A probe of the engine (Node, debug build) showed what the debugger receives while each kind of action runs:

| Action kind                            | Debug record while it runs                                                                              | Debugger today                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Base action                            | `actIndex` ≥ 0, lines of the action                                                                     | Correct                                                                                           |
| `act` written in a location's code     | `actIndex` -1, `loc` = that location, `line` = its line in that location's code                         | Correct: highlight and breakpoints land inside the `act` block                                    |
| `act` created through `dynamic`        | `actIndex` -1, `loc` = the location that ran `dynamic`, `line` = the line **inside the dynamic string** | **Wrong**: highlights an unrelated line of that location; a breakpoint on that line fires falsely |
| Code of the `dynamic` statement itself | one record for the whole `DYNAMIC …` statement                                                          | No per-line steps (engine; out of scope)                                                          |

The record's `code` is always the real text of the step. More engine facts the design relies on:

- `getActionCode(i)` returns the code with the engine's line numbers. For a `dynamic` action those count from
  the start of the dynamic string, so an action can start at line 3. For an inline `act 'x': pl 1` the code is
  the part after the colon, with a leading space.
- **The list can change mid-run.** An action that runs `cla` empties the list. After that, `getActionCode(0)`
  returns `[]` and `getSelectedActionIndex()` returns -1, while the action's remaining lines still run. Anything
  that follows a running action must save its code at its first step.
- The renderer selects an action on hover (`libs/renderer/src/theme-core/actions.tsx`). Selecting runs
  `$ONACTSEL`, so a selected index does not by itself mean that action is running.

## Decisions (maintainer's)

1. **A separate list of current actions** in the debugger, each showing its code loaded with `getActionCode`. The
   per-location base Actions tab stays as it is.
2. **Read + follow execution (option 2).** You can read a current action's code. When a step comes from a current
   action's code that the location view can't show (the `dynamic` case), the viewer follows into that action and
   highlights the right line.
3. **Placement A:** a collapsible "Current actions (N)" section at the top of the left sidebar, above the locations.
   Clicking an entry shows its code in the center viewer, titled "Current action: <name>". The entry that is
   running is marked like the running location (`▶`).

## Approaches considered

Placement (the build is otherwise the same):

- **A. Left sidebar section above the locations (picked).** It works like the locations list: pick on the left,
  read in the center. It stays visible while stepping. It collapses so long lists don't bury the locations.
- **B. A new right-panel tab "Actions".** Rejected: you click on the right and read in the center, and while
  stepping it competes with the Execution tab. The right panel is already crowded.
- **C. A code-viewer tab next to Location / Description / Actions.** Rejected: those tabs belong to the selected
  location, so it reads as "current actions of this location", which is wrong.

Scope (options offered to the maintainer):

1. Read only: leaves the wrong-line bug for `dynamic` actions.
2. **Read + follow (picked).**
3. Read + follow + breakpoints inside current actions: left for later. Current actions come and go, so a
   breakpoint would have to be tied to the action's name, which is unreliable (duplicates, renames).

## Following rules (proposed by Claude, for the maintainer to check)

**The running action.** A run counts as an action run only when qspider itself executes an action
(`execSelectedAction()` / `runAction()` in `libs/game-state/src/panels.ts`). At that moment the selected action's
index, name and code (`getActionCode`) are saved; they are cleared when that call settles. Selection alone (hover,
which also runs `$ONACTSEL`) never marks an action as running, and counter or `$ONACTSEL` runs never use the saved
action. Saving up front means `cla`, `gt` or a changed list mid-run don't lose it.

**Where the action's code came from is decided once per action, not per step.** When the action is saved, its
code is compared, at its first step, with the code of that step's location (`record.loc`, which is the location
that ran the `act` or `dynamic`; it is not always the current location, e.g. after a `gs`) at the same line numbers.
Both sides are split into lines the same way (`placeCodeLines`), so a statement spanning several lines (a `{…}`
block, a multi-line string) is compared line by line. If every line of the action is contained in the location's line with the same number,
the action was written in the location with `act` ("placed"); otherwise it came from `dynamic` ("detached").
"Contained" because an inline `act 'x': …` keeps only the part after the colon. Deciding per action avoids a
coincidental per-step match: with `$d = 'act "go": gt "room"'` on line 1 and `dynamic $d` on line 2, the
action's step `GT "room"` reports line 1, and a per-step check could wrongly keep it in the location view.

For each debug record during an action run:

1. **Steps of a placed action, and steps in other locations** (a `gs` from the action), stay in the location view,
   as today. This keeps `act` blocks written in a location in the view that also shows their breakpoints.
2. **Steps of a detached action** — `record.loc` is the action's location and `record.code`, split into lines,
   matches the saved code from `record.line` on (a multi-line statement arrives whole, line breaks included) — show that action in the current-action view with that line highlighted.
3. **Location-line breakpoints don't fire for steps of a detached action.** This removes the false hits from
   `dynamic` actions. Base-action breakpoints (`actIndex` ≥ 0) are unchanged.
4. **A step the debugger can't place** (in the action's location, but matching neither that location's line nor the
   saved code) shows the step's code alone, like the existing `[EXEC Link]` fallback.

Outside an action run, records are handled as today.

Base-action steps (`actIndex` ≥ 0) keep today's behavior (location → Actions tab → that action).

## Goals

- The list shows the current actions as the player sees them, in order, by name, and updates on every
  `actions_changed` event.
- Clicking an entry shows its code, at the engine's line numbers, highlighted and hoverable like other QSP code.
- While paused in a `dynamic`-created action, the viewer shows that action and the right line.
- No false breakpoint stops from `dynamic` actions.

## Non-goals

- Breakpoints inside current actions (scope option 3).
- Stepping through the lines of a `dynamic` statement's own code (the engine reports one step).
- Showing where a `dynamic` action was defined (the engine doesn't say).
- Step 3 navigation, and the two decisions parked from #215.

## Anti-goals

- The debugger must never highlight a line that isn't the one running. A step it can't place shows the code
  alone; it never guesses a line.
- No change to how a game runs when the debugger is closed. Saving the running action happens in the debug
  handler, which already does nothing but resume when the panel is closed.

## Constraints

- UI in `libs/debugger`, state and engine access in `libs/game-state` (as for base actions:
  `code-inspector.ts`, `qsp-api.ts`, `debug.ts`). Line placement reuses `placeCodeLines`.
- Strings go through `t()`, like the existing debugger strings.
- Tests follow the project rules: unit tests only for pure logic (the matching rules 1–4 as a pure function over
  record, location lines and saved action), no mocks. The engine behavior is covered by real E2E in the debugger
  scenario, on web and desktop. Follow `apps/player-e2e/README.md` Rules. The debugger fixture game needs a
  location that creates an action through `dynamic`, plus one written with `act`, so both rules 1 and 2 are
  exercised, along with the false-breakpoint case (rule 3) and `cla` mid-run.
- E2E locators: `data-qa` on the section, its entries (with the action name) and the running mark.

## Left to the builder

- The exact state shape, and how the run start/end in `panels.ts` reaches the debug state. Note:
  `snapshotAfterRun` also fires before a `msg`/menu/input/`wait` inside a run, so it is not a run-end signal.
- Whether the section remembers its collapsed state (a per-viewer convenience at most).
- Empty state text ("No current actions").
