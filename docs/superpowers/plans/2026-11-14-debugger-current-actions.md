# Debugger current actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The debugger lists the game's current actions in a collapsible sidebar section, shows each one's code, and
follows execution into an action created by `dynamic` instead of highlighting a wrong line of the location.

**Architecture:** Pure rules in a new `libs/game-state/src/action-run.ts` (where an action's code came from, where a
step belongs, whether a breakpoint fires). `panels.ts` saves the running action when qspider executes one;
`debug.ts` settles its origin at the first step and records where each step belongs. `libs/debugger` reads that
state: a new sidebar section, a "current action" and "step code" mode in the code viewer, and the running action
in the Execution tab.

**Tech Stack:** TypeScript, React 19, xoid, Monaco (existing viewer), Vitest (node project of `game-state`),
Serenity/JS screenplay E2E on Playwright (web) and WebdriverIO (desktop).

**Spec:** `docs/superpowers/specs/2026-11-14-debugger-current-actions-design.md`

## Global Constraints

- Engine `@qsp/wasm-engine` 2.0.0: `getActionCode(index): QspLineInfo[]`, `getSelectedActionIndex(): number`,
  `getLocationCode(name): QspLineInfo[]`; code lines go through `placeCodeLines` (`code-search.ts`) everywhere.
- The base Actions tab of the code viewer stays as it is.
- No change to how a game runs when the debugger panel is closed or debug mode is off: nothing is read from the
  engine on an action click then.
- The debugger must never highlight a line that isn't the one running; a step it can't place shows its code alone.
- Unit tests only for pure logic (`action-run.ts`, `matchesBreakpoint`), no mocks; engine behavior is proved by E2E
  on web and desktop. E2E follows `apps/player-e2e/README.md` Rules (locate by `data-qa`, `seeEventually`,
  `OperatePlayer`).
- UI strings through `t()` with English keys, like the other debugger strings (no locale entries; the debugger has
  none).
- `data-qa` hooks: `debug-current-actions` (section), `debug-current-action` (entry, with `data-action` = name and
  `data-running="true|false"`), `debug-current-actions-toggle` (collapse button).
- Local checks before done: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm nx test game-state`,
  `pnpm nx test player-e2e`, web debugger spec, desktop debugger spec.

## Review Focus

1. **An action that shows a `msg` (or menu, input, `wait`) mid-run.** The run must stay "running" until the action
   really ends, and the debugger must still follow afterwards. Pinned in Task 2's E2E-facing check via the `hold`
   base action (base actions are unaffected: still location view) and in Task 4 by `detached` running past its
   `cla`; the builder confirms that `execSelectedAction()`'s promise settles only when the run ends (it does in
   2.0.0: the engine awaits the dialog listeners), and if not, ends the run on the next `execSelectedAction` instead.
2. **Hovering actions while the debugger is paused or running** (`$ONACTSEL`, counter runs). No entry gets the
   running mark, and no counter step is placed into an action. Task 1 unit: `placeStep` with no run returns
   `'location'`; Task 4 E2E: after a run ends, `SeeCurrentActionRunning(name, false)`.
3. **A statement that spans several lines** (a `{…}` block, a multi-line string) inside a `dynamic` action: the
   engine sends it whole, line breaks included. Task 1 unit tests both `actionOrigin` and `placeStep` with one; the
   fixture's `detached` action holds a multi-line string (Task 3) and Task 4 steps across it.
4. **A placed `act` whose action is inline** (`act 'x': pl 1`): its code is only the part after the colon, with a
   leading space. Task 1 unit test: `actionOrigin` returns `'placed'`.
5. **An action defined in a location reached by `gs`**, so `record.loc` is not the current location. Task 1 unit
   test: `settleRun` takes the location from the record, not from the run.

---

## File Structure

- Create `libs/game-state/src/action-run.ts`: pure types and rules (`ActionRun`, `ActionOrigin`, `StepPlace`,
  `actionOrigin`, `settleRun`, `placeStep`, `codeLinesOf`). Unit-tested in `action-run.spec.ts`.
- Modify `libs/game-state/src/debug.ts`: `matchesBreakpoint` gets a `place` parameter; `DebugState` gains
  `actionRun`, `stepPlace`, `codeView`; `debugActions` gains `beginActionRun`, `endActionRun`,
  `selectCurrentAction`; `setCurrentRecord` settles the run and places the step.
- Modify `libs/game-state/src/panels.ts`: `execSelectedAction` begins and ends the run.
- Modify `libs/game-state/src/index.ts`: export `action-run.ts`.
- Modify `apps/player-e2e/fixtures/debugger/debugger.qsps`, `build-fixtures.ts`, `build-fixtures.spec.ts`,
  `debugger-game.ts`, `apps/player-e2e/README.md` (fixture description): the `acts` location.
- Create `libs/debugger/src/lib/current-actions.tsx`: the sidebar section.
- Modify `libs/debugger/src/lib/debug-panel.tsx` (mount the section), `code-viewer.tsx` (view modes),
  `location-right-panel.tsx` (Execution tab), `debugger.css`.
- Modify `apps/player-e2e/screenplay/debugger/{elements,tasks,checks}.ts`, `apps/player-e2e/scenarios/debugger.scenario.ts`.

---

### Task 1: Pure rules for action runs

**Files:**

- Create: `libs/game-state/src/action-run.ts`
- Create: `libs/game-state/src/action-run.spec.ts`
- Modify: `libs/game-state/src/debug.ts` (`matchesBreakpoint`, ~line 157)
- Modify: `libs/game-state/src/debug.spec.ts` (the `matchesBreakpoint` block, ~line 130)
- Modify: `libs/game-state/src/index.ts`

**Interfaces:**

- Produces (all exported from `@qspider/game-state`):
  ```ts
  export type ActionOrigin = 'placed' | 'detached';
  export type StepPlace = 'location' | 'action' | 'code';
  export interface ActionRun {
    index: number; // index in the current actions list when it started
    name: string;
    lines: string[]; // placeCodeLines(getActionCode(index)), saved at start
    loc: string | null; // record.loc of its first step; null until then
    origin: ActionOrigin | null; // null until the first step
  }
  export function codeLinesOf(code: string): string[]; // split on \r?\n
  export function actionOrigin(actionLines: string[], locationLines: string[]): ActionOrigin;
  export function settleRun(run: ActionRun, record: DebugRecord, locationLines: string[]): ActionRun;
  export function placeStep(record: DebugRecord, run: ActionRun | null): StepPlace;
  export function matchesBreakpoint(bp: DebugBreakpoint, record: DebugRecord, place?: StepPlace): boolean; // debug.ts
  ```
- `DebugRecord` and `DebugBreakpoint` stay in `debug.ts`; `action-run.ts` imports them as types only.

Rules (from the spec, "Following rules"):

- `actionOrigin`: `'placed'` when every non-empty action line `i` (trimmed) is contained in `locationLines[i]`;
  otherwise `'detached'`. An action with no non-empty line is `'placed'`.
- `settleRun`: if `run.origin` is already set, return `run` unchanged; else `loc = record.loc`,
  `origin = actionOrigin(run.lines, locationLines)`.
- `placeStep`: `'location'` when `run` is null, `run.origin !== 'detached'`, `record.actIndex >= 0`, or
  `record.loc !== run.loc`. Otherwise `'action'` when the record's lines (`codeLinesOf(record.code)`, trimmed) equal
  `run.lines` from index `record.line - 1` on (trimmed); else `'code'`.
- `matchesBreakpoint(bp, record, place = 'location')`: as today, but a breakpoint with a `line` and no `actionIndex`
  never matches when `place !== 'location'`. A breakpoint without a line still matches.

- [ ] **Step 1: Write the failing tests** in `action-run.spec.ts` (no mocks; build records with a local `record()`
      helper like `debug.spec.ts`):

```ts
describe('actionOrigin', () => {
  it('is placed when every action line sits in the same location line', () => {
    expect(
      actionOrigin(
        ['', '', 'PLACED = 1', "*PL 'PLACED DONE'"],
        ['ACT1', "ACT 'placed':", 'PLACED = 1', "*PL 'PLACED DONE'"],
      ),
    ).toBe('placed');
  });
  it('is placed for an inline act (code after the colon, leading space)', () => {
    expect(actionOrigin(['', " PL 'x'"], ['X = 1', "ACT 'x': PL 'x'"])).toBe('placed');
  });
  it('is detached when one line differs even if another coincides', () => {
    expect(actionOrigin([` GT "room"`, 'Y = 2'], [`$D = 'act "go": GT "room"'`, 'DYNAMIC $D'])).toBe('detached');
  });
  it('compares a multi-line statement line by line', () => {
    const lines = ['', "$NOTE = 'two", "lines'"];
    expect(actionOrigin(lines, ['ACT 1', "$NOTE = 'two", "lines'"])).toBe('placed');
    expect(actionOrigin(lines, ['ACT 1', 'X = 1', 'Y = 2'])).toBe('detached');
  });
  it('is placed for an action with no code', () => {
    expect(actionOrigin([], ['X = 1'])).toBe('placed');
  });
});

describe('settleRun', () => {
  it('takes the location from the first step, not the current location', () => {
    const run = { index: 0, name: 'a', lines: ['', 'Z = 3'], loc: null, origin: null };
    expect(settleRun(run, record({ loc: 'other', line: 2, code: 'Z = 3' }), ['GS 1', 'Z = 3'])).toEqual({
      ...run,
      loc: 'other',
      origin: 'placed',
    });
  });
  it('keeps a settled run', () => {
    const run = { index: 0, name: 'a', lines: ['X'], loc: 'start', origin: 'detached' as const };
    expect(settleRun(run, record({ loc: 'other' }), [])).toBe(run);
  });
});

describe('placeStep', () => {
  const detached = {
    index: 1,
    name: 'detached',
    lines: ['', '', 'DETACHED = 1', "$NOTE = 'two", "lines'"],
    loc: 'acts',
    origin: 'detached' as const,
  };
  it('is location without a run', () => expect(placeStep(record({ loc: 'acts', line: 3 }), null)).toBe('location'));
  it('is location for a placed run', () =>
    expect(placeStep(record({ loc: 'acts', line: 3, code: 'X' }), { ...detached, origin: 'placed' })).toBe('location'));
  it('is location for a base action step', () =>
    expect(placeStep(record({ loc: 'acts', line: 3, code: 'DETACHED = 1', actIndex: 0 }), detached)).toBe('location'));
  it('is location in another location (a gs from the action)', () =>
    expect(placeStep(record({ loc: 'helper', line: 3, code: 'DETACHED = 1' }), detached)).toBe('location'));
  it('is action when the step is the saved line', () =>
    expect(placeStep(record({ loc: 'acts', line: 3, code: ' DETACHED = 1' }), detached)).toBe('action'));
  it('is action for a whole multi-line statement', () =>
    expect(placeStep(record({ loc: 'acts', line: 4, code: "$NOTE = 'two\r\nlines'" }), detached)).toBe('action'));
  it('is code when nothing matches', () =>
    expect(placeStep(record({ loc: 'acts', line: 3, code: 'OTHER' }), detached)).toBe('code'));
});
```

In `debug.spec.ts`, add to the `matchesBreakpoint` block:

```ts
it('a line breakpoint does not fire for a step placed outside the location', () => {
  expect(matchesBreakpoint(bp({ line: 3 }), record({ line: 3 }), 'action')).toBe(false);
  expect(matchesBreakpoint(bp({ line: 3 }), record({ line: 3 }), 'code')).toBe(false);
  expect(matchesBreakpoint(bp({ line: 3 }), record({ line: 3 }), 'location')).toBe(true);
});
it('a location breakpoint still fires for a step placed in an action', () => {
  expect(matchesBreakpoint(bp(), record({ line: 3 }), 'action')).toBe(true);
});
```

- [ ] **Step 2: Run to see them fail**

Run: `pnpm nx test game-state -- action-run debug.spec`
Expected: FAIL (`action-run` module not found; the `place` argument is ignored).

- [ ] **Step 3: Implement** `action-run.ts` with the signatures and rules above; add the `place` parameter to
      `matchesBreakpoint` (update its doc comment); `export * from './action-run';` in `index.ts`.

- [ ] **Step 4: Run to see them pass**

Run: `pnpm nx test game-state`
Expected: PASS, whole project.

- [ ] **Step 5: Commit**

```bash
git add libs/game-state/src/action-run.ts libs/game-state/src/action-run.spec.ts libs/game-state/src/debug.ts libs/game-state/src/debug.spec.ts libs/game-state/src/index.ts
git commit -m "feat(game-state): rules for placing steps of current actions"
```

---

### Task 2: Run state in game-state

**Files:**

- Modify: `libs/game-state/src/debug.ts`
- Modify: `libs/game-state/src/panels.ts:30-33`

**Interfaces:**

- Consumes: Task 1 (`ActionRun`, `StepPlace`, `settleRun`, `placeStep`, `matchesBreakpoint(bp, record, place)`).
- Produces:
  ```ts
  type CodeView = { kind: 'location' } | { kind: 'current-action'; index: number } | { kind: 'step-code' };
  interface DebugState { /* existing */ actionRun: ActionRun | null; stepPlace: StepPlace; codeView: CodeView; }
  export const debugActionRun$ = debugState$.focus('actionRun');
  export const debugCodeView$ = debugState$.focus('codeView');
  debugActions.beginActionRun(index: number, name: string, lines: string[]): void;
  debugActions.endActionRun(): void;
  debugActions.selectCurrentAction(index: number): void; // codeView → current-action
  ```
  Initial state: `actionRun: null`, `stepPlace: 'location'`, `codeView: { kind: 'location' }`.

Behavior:

- `beginActionRun` does nothing unless `isDebugPanelOpen$.value && debugState$.value.isEnabled`; otherwise sets
  `actionRun` to `{ index, name, lines, loc: null, origin: null }`.
- `endActionRun` sets `actionRun: null` and `stepPlace: 'location'`.
- `selectLocation` / `selectLocationWithLine` also set `codeView: { kind: 'location' }`.
- `setCurrentRecord`: before the pause decision, if `actionRun` has no origin, settle it with
  `getLocationCode(record.loc)` lines (read through `qspApi$` + `placeCodeLines`, as `qsp-api.ts`'s `getLocationCode`
  does; import `placeCodeLines` from `./code-search`, not from `./qsp-api`, to avoid an import cycle). Compute
  `place = placeStep(record, actionRun)`, store `stepPlace`, and set `codeView` to
  `{ kind: 'current-action', index: actionRun.index }` for `'action'`, `{ kind: 'step-code' }` for `'code'`, and
  leave it for `'location'` (the code viewer already selects the record's location). Pass `place` to
  `matchesBreakpoint`. While the panel is closed nothing of this runs (keep the existing early return first).
- `panels.ts` `execSelectedAction()`: take the index from `selectedAction$.value` before it is reset to `NO_ACTION`
  (the renderer's click calls `selectAction(index)` without awaiting it, so the engine's
  `getSelectedActionIndex()` may lag; fall back to it only when `selectedAction$` holds `NO_ACTION`, as for
  `runAction` after its awaited select); when it is ≥ 0, call
  `debugActions.beginActionRun(index, actions$.value[index]?.name ?? '', placeCodeLines(api.getActionCode(index)))`
  — but only read the code when the panel is open and debug is on (check `isDebugPanelOpen$` and
  `isDebugEnabled$` first; Global Constraints). End the run in a `finally` on the engine's promise.
  `runAction` goes through `execSelectedAction`, so it is covered.

- [ ] **Step 1: Implement** the state, actions and wiring above.

- [ ] **Step 2: Run the unit tests and type check**

Run: `pnpm nx test game-state && pnpm nx typecheck game-state`
Expected: PASS (Task 1 tests still green; no new unit tests here, the wiring is proved by E2E in Task 4).

- [ ] **Step 3: Run the existing debugger E2E on web** (base-action, location and `hold` behavior unchanged)

Run: `pnpm e2e:web apps/player-e2e/scenarios/debugger.scenario.ts`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add libs/game-state/src/debug.ts libs/game-state/src/panels.ts
git commit -m "feat(game-state): track the running current action in the debugger"
```

---

### Task 3: Fixture location `acts`

**Files:**

- Modify: `apps/player-e2e/fixtures/debugger/debugger.qsps` (append the location)
- Modify: `apps/player-e2e/fixtures/build-fixtures.ts` (`debuggerZip`: base action `acts` on `start`)
- Modify: `apps/player-e2e/fixtures/debugger-game.ts`
- Modify: `apps/player-e2e/fixtures/build-fixtures.spec.ts:76-81`
- Modify: `apps/player-e2e/README.md` (the `debugger/` fixture paragraph)

**Interfaces:**

- Produces in `DEBUGGER_GAME`: `location.acts = 'acts'`, `action.acts = 'acts'` (base action `gt 'acts'`, added
  last), and

```ts
acts: {
  start: 'ACTS START',
  placed: { name: 'placed', line: 3, code: 'PLACED = 1', done: 'PLACED DONE' },
  detached: {
    name: 'detached',
    /** Engine lines inside the dynamic block: first line, the `cla` line, the multi-line string's first line, the last. */
    first: { line: 3, code: 'DETACHED = 1' },
    cla: { line: 4, code: 'CLA' },
    note: { line: 5, code: "$NOTE = 'two" },
    last: { line: 7, code: "*PL 'DETACHED DONE'" },
    done: 'DETACHED DONE',
  },
},
```

The location, exactly (line numbers matter; the engine numbers the dynamic action's lines from the block's
opening line):

```
# acts
*pl 'ACTS START'
act 'placed':
  placed = 1
  *pl 'PLACED DONE'
end
dynamic {
act 'detached':
  detached = 1
  cla
  $note = 'two
lines'
  *pl 'DETACHED DONE'
end
}
---
```

`acts` location line 3 is `PLACED = 1`, the same number as `detached`'s first line: a line breakpoint there is the
false-hit case.

- [ ] **Step 1: Update the build-fixtures test** to expect `DEBUGGER_GAME.location.acts` last in the location list.
- [ ] **Step 2: Run it to see it fail:** `pnpm nx test player-e2e` → FAIL on the location list.
- [ ] **Step 3: Add the location, the base action and the constants.**
- [ ] **Step 4: Verify the engine line numbers** with a throwaway Node probe (debug engine, as in the spec's probe:
      `initDebugQspEngine`, `readQsps` + `writeQsp`): run `acts`, print `getActionCode` of both actions and the records
      of running each. The `line`/`code` values must match the constants above; fix the constants if not. Don't commit
      the probe.
- [ ] **Step 5: Run** `pnpm nx test player-e2e` → PASS.
- [ ] **Step 6: Update the README fixture paragraph** (one sentence on `acts`: `placed` written with `act`,
      `detached` made by `dynamic` with a `cla` and a multi-line string, its line 3 coinciding with `placed`'s).
- [ ] **Step 7: Commit**

```bash
git add apps/player-e2e/fixtures apps/player-e2e/README.md
git commit -m "test(player-e2e): debugger fixture gets placed and dynamic current actions"
```

---

### Task 4: Current actions UI and its E2E

**Files:**

- Create: `libs/debugger/src/lib/current-actions.tsx`
- Modify: `libs/debugger/src/lib/debug-panel.tsx:192` (render `<CurrentActions />` first in `.qsp-debugger-sidebar`)
- Modify: `libs/debugger/src/lib/code-viewer.tsx`
- Modify: `libs/debugger/src/lib/location-right-panel.tsx:152-170`
- Modify: `libs/debugger/src/lib/debugger.css`
- Modify: `apps/player-e2e/screenplay/debugger/elements.ts`, `tasks.ts`, `checks.ts`
- Modify: `apps/player-e2e/scenarios/debugger.scenario.ts`

**Interfaces:**

- Consumes: Task 2 (`debugActionRun$`, `debugCodeView$`, `debugActions.selectCurrentAction`, `stepPlace`), Task 3
  (`DEBUGGER_GAME.acts`), `actions$` from `@qspider/game-state`, `placeCodeLines` + `qspApi$` for live code (add a
  `getCurrentActionCode(index: number): string[]` next to `getActionCode` in `qsp-api.ts`, returning
  `placeCodeLines(api.getActionCode(index))`).
- Produces (screenplay):
  ```ts
  CurrentActionEntry(name: string)       // [data-qa="debug-current-action"][data-action="<name>"]
  SelectCurrentAction(name: string): Task
  ToggleCurrentActions(): Task           // clicks debug-current-actions-toggle
  SeeCurrentActions(names: string[]): Task       // entries in order
  SeeCurrentActionRunning(name: string, running: boolean): Task
  SeeExecutionInCurrentAction(name: string, line: number): Task // debug-current-execution data-action + data-line
  SeeEditorTitle(text: string): Task     // .qsp-monaco-code-title text
  ```

UI behavior:

- Section header "Current actions (N)" with a collapse toggle (`useState`, expanded by default); entries are the
  names from `actions$`, in order; the entry at `actionRun.index` while `actionRun` is set gets `▶ ` and
  `data-running="true"`; empty list shows `t('No current actions')`. Clicking an entry calls
  `debugActions.selectCurrentAction(index)`; the selected entry gets the `selected` class (when `codeView` is
  `current-action` with that index).
- Code viewer by `codeView.kind`:
  - `location`: today's behavior. Its auto-follow effect must not override the view when `stepPlace !== 'location'`.
  - `current-action`: if `actionRun?.index === codeView.index`, show `actionRun.lines` (saved code, survives `cla`),
    else `getCurrentActionCode(index)`; title `t('Current action: {{name}}', { name })`; no tabs, no breakpoint
    gutter clicks (pass no `onBreakpointToggle`, or make it a no-op); highlight `currentRecord.line` when
    `stepPlace === 'action'`; empty code shows `t('// Empty action')`.
  - `step-code`: show `currentRecord.code` alone, title `t('Running code')`, highlight line 1 (the `[EXEC Link]`
    precedent).
- Execution tab: when `stepPlace === 'action'`, add `data-action={actionRun.name}` to `debug-current-execution` and
  show `t('Current action')`: name instead of the `Action` index row.

- [ ] **Step 1: Write the failing E2E scenarios** in `debugger.scenario.ts` (with the screenplay additions above),
      using `const { acts: ACTS } = DEBUGGER_GAME` and a helper
      `InActs = () => [...OpenDebuggerGame(), ClickAction(ACTION.acts), SeeMainTextContaining(ACTS.start)]`:

```ts
scenario('the current actions list shows the actions the player sees and their code', async (player) => {
  await player.attemptsTo(
    ...InActs(),
    OpenDebugger(),
    SeeCurrentActions([ACTS.placed.name, ACTS.detached.name]),
    SelectCurrentAction(ACTS.detached.name),
    SeeEditorTitle(`Current action: ${ACTS.detached.name}`),
    SeeEditorCode(ACTS.detached.first.code),
    ToggleCurrentActions(),
    SeeCurrentActions([]),
    ToggleCurrentActions(),
  );
});

scenario('stepping in a dynamic action follows into its code past a cla and a multi-line string', async (player) => {
  await player.attemptsTo(
    ...InActs(),
    OpenDebugger(),
    EnableDebugging(),
    ToggleLocationBreakpoint(LOCATION.acts),
    ClickAction(ACTS.detached.name),
    SeeDebugStatus('paused'),
    SeeExecutionInCurrentAction(ACTS.detached.name, ACTS.detached.first.line),
    SeeCurrentActionRunning(ACTS.detached.name, true),
    SeeCurrentLineText(ACTS.detached.first.code),
    StepDebugger(),
    SeeCurrentLineText(ACTS.detached.cla.code),
    StepDebugger(),
    SeeExecutionInCurrentAction(ACTS.detached.name, ACTS.detached.note.line), // list is empty now
    SeeEditorTitle(`Current action: ${ACTS.detached.name}`),
    StepDebugger(),
    SeeCurrentLineText(ACTS.detached.last.code),
    ResumeDebugger(),
    SeeMainTextContaining(ACTS.detached.done),
  );
});

scenario('a line breakpoint on the location does not fire for a dynamic action', async (player) => {
  await player.attemptsTo(
    ...InActs(),
    OpenDebugger(),
    EnableDebugging(),
    SelectLocation(LOCATION.acts),
    ToggleLineBreakpoint(ACTS.placed.line),
    ClickAction(ACTS.detached.name),
    SeeMainTextContaining(ACTS.detached.done),
    SeeDebugStatus('running'),
  );
});

scenario('an act written in a location is followed in the location code', async (player) => {
  await player.attemptsTo(
    ...InActs(),
    OpenDebugger(),
    EnableDebugging(),
    SelectLocation(LOCATION.acts),
    ToggleLineBreakpoint(ACTS.placed.line),
    ClickAction(ACTS.placed.name),
    SeeDebugStatus('paused'),
    SeeExecutionLine(LOCATION.acts, ACTS.placed.line),
    SeeCurrentLineText(ACTS.placed.code),
    SeeEditorTitle(`Location: ${LOCATION.acts}`),
    ResumeDebugger(),
    SeeMainTextContaining(ACTS.placed.done),
    SeeCurrentActionRunning(ACTS.placed.name, false),
  );
});
```

Check the existing `ToggleLineBreakpoint` signature in `screenplay/debugger/editor/tasks.ts` and pass what it
takes. `SeeCurrentActions([])` after collapsing means no entries are rendered.

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm e2e:web apps/player-e2e/scenarios/debugger.scenario.ts -g "current action|dynamic action|act written"`
Expected: FAIL (no `debug-current-actions` section; the dynamic step highlights `acts` line 3).

- [ ] **Step 3: Implement** the section, view modes, Execution tab and CSS (reuse the location list's item,
      `selected` and `execution-indicator` styles).

- [ ] **Step 4: Run the whole debugger spec on web:** `pnpm e2e:web apps/player-e2e/scenarios/debugger.scenario.ts`
      → all pass.

- [ ] **Step 5: Run it on desktop:** `pnpm e2e:desktop --spec apps/player-e2e/scenarios/debugger.scenario.ts` → all
      pass.

- [ ] **Step 6: Commit**

```bash
git add libs/debugger libs/game-state/src/qsp-api.ts apps/player-e2e/screenplay/debugger apps/player-e2e/scenarios/debugger.scenario.ts
git commit -m "feat(debugger): list current actions and follow steps into dynamic ones"
```

---

### Task 5: Local gate

- [ ] **Step 1:** `pnpm format:check && pnpm lint && pnpm typecheck` → all pass (delete a leftover
      `apps/player-e2e/web-report` first if a failed web E2E left one; it breaks `player-e2e:lint`).
- [ ] **Step 2:** `pnpm nx test game-state && pnpm nx test debugger && pnpm nx test player-e2e` → pass.
- [ ] **Step 3:** If the desktop debugger spec's run time changed notably, note it for the shard-timings refresh
      (README "Shards"); don't refresh without CI logs.
- [ ] **Step 4:** Report results; then push and open the PR against `main` (CI is the full gate).
