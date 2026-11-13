# Variable Watching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One shared variable layer in `game-state` that survives OPENQST, reads unprefixed names as stored, and is pinned by E2E.

**Architecture:** Pure helpers (`variable-logic.ts`) + a memoized, ref-counted registry of xoid atoms (`variables.ts`), each with at most one engine watcher, re-attached on `qspApi$`/`gameOpenEpoch$`. Existing hooks keep their signatures and delegate to it. E2E first (red on main), then the fix.

**Tech Stack:** TypeScript, React 19, xoid (`atom`, `.watch`, `@xoid/react` `useAtom`), `@qsp/wasm-engine` 2.0.0, Vitest, Serenity/JS E2E (Playwright web, WDIO desktop).

**Spec:** `docs/superpowers/specs/2026-11-13-variable-watching-design.md`

## Global Constraints

- Branch `feat/variable-layer` in the main checkout (no worktree). Finish via PR against `main`.
- Tasks/tests through nx: `pnpm nx test game-state`, `pnpm nx test renderer`, `pnpm nx lint <project>`, `pnpm typecheck`, `pnpm format:check`; web E2E `pnpm e2e:web` (needs `CHROME_BIN=/usr/bin/chromium`). To run one spec file, pass Playwright's file filter through nx (`pnpm e2e:web -- <scenario-file>`); if that form is rejected, check `apps/player-e2e/project.json` for the target's args.
- No engine mocks; unit tests only for pure functions. Engine behaviour is proved by E2E.
- E2E follows `apps/player-e2e/README.md` Rules: locate by `data-qsp`/`data-qa`/role; checks via `seeEventually`-based `See*`; fixtures' TS modules free of test-framework imports; `screenplay/**` files ≤ 150 lines.
- Engine facts (probed on core 5.9.6): prefix read gives the type's empty value on mismatch (no conversion); unset unprefixed reads `undefined`; name lookup is case-insensitive; QSP's text of a tuple `(1, 'a''b', (2, 'c'), -3)` is `[1, 'a''b', [2, 'c'], -3]`; in QSP code an unset variable is `''` as text and `0` as number.
- A failed local web E2E leaves `apps/player-e2e/artifacts/web-report` JS that breaks `player-e2e:lint`; delete it before linting.

## Review Focus

1. **Same variable, different spelling across components** (`fcolor` in a theme, `FCOLOR` in code): both must show the value, from one entry — pinned by `variableKey` unit test (Task 2).
2. **Unmount then remount quickly** (React StrictMode double effects, main text re-render): ref-count must not drop below 0 or leak a detached entry that never re-attaches — pinned by a registry-free unit test of the pure ref-count step `nextRefCount` (Task 2) and by existing `game-html-watchers` E2E staying green (Task 3).
3. **Theme condition on an unset unprefixed variable** (`<qsp-show when="x" equals="0">`): today `#x` → 0 makes it true; must stay true — pinned by `conditionValue` unit test (Task 2).
4. **Game stops while watchers are live** (engine replaced, `qspApi$` changes): entries must re-attach to the new engine, not throw on the retired one — covered by re-attach on `qspApi$` (Task 3) and the existing shelf/return scenarios staying green (Task 6).
5. **String stored in a classic look variable** (`FCOLOR = '255'`): must not crash `cssVariableRules`; colour from `Number('255')` — pinned by a `cssVariableRules` unit test (Task 4).

---

### Task 1: E2E scenarios that pin the bugs (red on current code)

**Files:**

- Create: `apps/player-e2e/fixtures/openqst/game.cfg`, `apps/player-e2e/fixtures/openqst/first.qsps`, `apps/player-e2e/fixtures/openqst/second.qsps`, `apps/player-e2e/fixtures/openqst-game.ts`
- Create: `apps/player-e2e/scenarios/variables.scenario.ts`
- Modify: `apps/player-e2e/fixtures/archives.ts` (ARCHIVES + SOURCES entries), `apps/player-e2e/fixtures/build-fixtures.ts` (~line 138, write the zip), `apps/player-e2e/fixtures/game-html/game-html.qsps` (`watchers`, `bind` locations), `apps/player-e2e/fixtures/game-html-game.ts` (texts, marks, actions)
- Possibly modify: `apps/player-e2e/fixtures/build-fixtures.spec.ts` if it enumerates archives.

**Interfaces:**

- Produces: `ARCHIVES.openqstZip = { path: out('openqst.zip'), title: 'OPENQST game' }`; `SOURCES.openqst`; `OPENQST_GAME` (texts, action labels, expected `--code-color`); `GAME_HTML.marks.uvarBox = 'uvar-box'`, `GAME_HTML.marks.ubindField = 'ubind-field'`, `GAME_HTML.text.unprefixed = 'UNPREFIXED TEXT'`, `GAME_HTML.text.ubound(v) = \`UBOUND=${v}\``, `GAME_HTML.actions.showUbind = 'show ubind'`.

- [ ] **Step 1: Write the OPENQST fixture**

`game.cfg` mirrors `look-game/game-classic.cfg` (id `openqst`, title `OPENQST game`, `file = "first.qsps"`, classic mode).
`first.qsps`: `# first` prints `OPENQST FIRST`, action `Open second`: `openqst 'second.qsps'`.
`second.qsps`: `# second` prints `OPENQST SECOND`, action `Set colour`: `FCOLOR = -13426159` then `*pl 'COLOUR SET'`.
Pack in `build-fixtures.ts`: `write(ARCHIVES.openqstZip.path, zipPack(join(SOURCES.openqst, 'game.cfg'), ['second.qsps']))`.
`OPENQST_GAME.expectedCodeColor = 'rgba(17,34,51,1)'` (same value as `LOOK_CLASSIC_TABLE['--code-color']`, comment the link).

- [ ] **Step 2: Extend the game-html fixture**

In `# watchers` add: `uvar = 'UNPREFIXED TEXT'` and `*pl '<span data-qa="uvar-box"><qsp-variable name="uvar"></qsp-variable></span>'`.
In `# bind` add: `ubind = 'seed'`, `*pl '<input type="text" qsp-bind="ubind" data-qa="ubind-field">'`, `act 'show ubind': *clr & *pl 'UBOUND=<<ubind>>'`.

- [ ] **Step 3: Write `variables.scenario.ts`**

Three scenarios (reuse existing tasks: `StartPlayer`, `SeeStartupFinished`, `LoadGame`, `SeeGameStarted`, `ClickAction`, `SeeMainTextContaining`, `SeeCssValues`, `SeeElementText`, `TypeInto`, `ContentMark`):

```ts
scenario('a theme variable stays live after the game opens another file with OPENQST', …
  LoadGame(ARCHIVES.openqstZip.path), SeeGameStarted(T.first),
  ClickAction(A.openSecond), SeeMainTextContaining(T.second),
  ClickAction(A.setColour), SeeMainTextContaining(T.colourSet),
  SeeCssValues({ root: true }, { '--code-color': OPENQST_GAME.expectedCodeColor }));

scenario('qsp-variable shows a string stored in an unprefixed variable', …
  …openWatchers…, SeeElementText(ContentMark(GAME_HTML.marks.uvarBox), GAME_HTML.text.unprefixed, …));

scenario.webOnly('qsp-bind on an unprefixed variable holding a string stores typed text', …
  ClickAction(ACTION.bind), TypeInto('hello', ContentMark(GAME_HTML.marks.ubindField)),
  ClickAction(ACTION.showUbind), SeeMainText(GAME_HTML.text.ubound('hello')));
```

Put the webOnly reason as a comment pointing at the one in `game-html.scenario.ts`. If `TypeInto` appends to the seed, clear first the way the existing bind scenarios rely on (the existing `bind` location seeds `''`; if appending happens, seed `ubind` with a one-character non-numeric string and expect `UBOUND=<seed>hello` — decide by running it).

- [ ] **Step 4: Run and record red**

Run: `CHROME_BIN=/usr/bin/chromium pnpm e2e:web -- variables.scenario.ts`
Expected: all three FAIL on current code — OPENQST: `--code-color` stays at its pre-OPENQST value; unprefixed: element text `0`/empty; bind: `UBOUND=0`. Save the failure lines for the PR description. If the OPENQST scenario passes, record that (spec: keep it as a guard, say so in PR).

- [ ] **Step 5: Lint and commit**

Run: `pnpm nx lint player-e2e` → no errors.

```bash
git add apps/player-e2e
git commit -m "test(player-e2e): pin OPENQST watcher loss and unprefixed variable reads"
```

---

### Task 2: Pure variable helpers

**Files:**

- Create: `libs/game-state/src/variable-logic.ts`, `libs/game-state/src/variable-logic.spec.ts`

**Interfaces:**

- Produces (all exported from `variable-logic.ts`, re-exported from `libs/game-state/src/index.ts`):
  - `variableKey(name: string, key: string, index: number): string` — upper-cases the name (prefix kept), key wins over index.
  - `sameValue(a: QspVariableValue, b: QspVariableValue): boolean` — deep, tuples element-wise incl. `names`.
  - `isTuple(v: QspVariableValue): v is QspTuple`
  - `scalarOrUnset(v: QspVariableValue): string | number | undefined` — tuple → `undefined`.
  - `conditionValue(v: QspVariableValue): string | number` — tuple/`undefined` → `0`.
  - `formatQspValue(v: QspVariableValue): string` — QSP text form.
  - `nextRefCount(count: number, delta: 1 | -1): number` — never below 0.

- [ ] **Step 1: Write the failing tests**

```ts
expect(variableKey('fcolor', '', 0)).toBe(variableKey('FCOLOR', '', 0));
expect(variableKey('$x', '', 0)).not.toBe(variableKey('x', '', 0));
expect(variableKey('a', 'k', 3)).toBe(variableKey('A', 'k', 0)); // key wins
expect(variableKey('a', '', 1)).not.toBe(variableKey('a', '', 2));
expect(variableKey('a', 'K', 0)).not.toBe(variableKey('a', 'k', 0)); // keys are case-sensitive
expect(sameValue([1, 'a'], [1, 'a'])).toBe(true);
expect(sameValue([1, [2]], [1, [3]])).toBe(false);
const named = Object.assign([1], { names: ['A'] });
expect(sameValue(named, [1])).toBe(false);
expect(sameValue('5', 5)).toBe(false);
expect(sameValue(undefined, undefined)).toBe(true);
expect(scalarOrUnset([1])).toBeUndefined();
expect(scalarOrUnset('a')).toBe('a');
expect(conditionValue(undefined)).toBe(0);
expect(conditionValue([1])).toBe(0);
expect(conditionValue('x')).toBe('x');
expect(formatQspValue([1, "a'b", [2, 'c'], -3])).toBe("[1, 'a''b', [2, 'c'], -3]");
expect(formatQspValue('text')).toBe('text');
expect(formatQspValue(7)).toBe('7');
expect(formatQspValue(undefined)).toBe('');
expect(nextRefCount(0, -1)).toBe(0);
expect(nextRefCount(1, 1)).toBe(2);
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm nx test game-state -- variable-logic` → FAIL (module missing).

- [ ] **Step 3: Implement** the functions above in `variable-logic.ts` (import types from `@qsp/wasm-engine`). `formatQspValue` ignores `names` (record names are not part of the probed text form; note this in a comment).

- [ ] **Step 4: Run to verify pass**

Run: `pnpm nx test game-state -- variable-logic` → PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/game-state/src/variable-logic.ts libs/game-state/src/variable-logic.spec.ts libs/game-state/src/index.ts
git commit -m "feat(game-state): pure helpers for the variable layer"
```

---

### Task 3: Variable registry and hook rewiring (OPENQST green)

**Files:**

- Create: `libs/game-state/src/variables.ts`
- Modify: `libs/game-state/src/qsp-api.ts` (`useQspVariable`, `useQspExpression`, line-296 `newLocEffect` call, imports), `libs/game-state/src/engine-event-logic.ts` (delete `typedVariableName`; `newLocEffect` reads `#NEWLOC_EFFECT_TIME`, `#NEWLOC_EFFECT_SEQ`), `libs/game-state/src/engine-event-logic.spec.ts` (drop `typedVariableName` tests; update `newLocEffect` test names if they spell the names), `libs/renderer/src/render-state.ts` (replace `createVariableAtom`), `libs/game-state/src/index.ts`

**Interfaces:**

- Consumes: Task 2 helpers.
- Produces (exported from `variables.ts` via index):
  - `variable$(name: string, key?: string, index?: number): Atom<QspVariableValue>` — memoized by `variableKey`.
  - `acquireVariable(name: string, key?: string, index?: number): () => void` — increments ref count, attaches the engine watcher on 0→1; returned release decrements and on 1→0 detaches and deletes the entry.
  - `useQspVariableRaw(name: string | undefined, key: string, index: number): QspVariableValue` — acquire in `useEffect`, `useAtom(variable$(…))`.
  - `useQspVariable` (unchanged signature, stays in `qsp-api.ts` or moves to `variables.ts` with the same export) = `(scalarOrUnset(raw) || defaultValue) as T` — tuples, unset, `0` and `''` give the default (today's `variableOrDefault` rule).
  - `useQspExpression(variable, condition)` = `checkCondition(conditionValue(raw), condition)`.

- [ ] **Step 1: Implement `variables.ts`**

Entry: `{ atom$, count, unwatch?, name, key, index }` in a `Map<string, Entry>`. Attach: `key ? api.watchVariableByKey(name, key, cb) : api.watchVariableByIndex(name, index, cb)`, with `cb = (v) => { if (!sameValue(atom$.value, v)) atom$.set(v); }`; the name is passed as written (no `#`). Re-attach all live entries in one subscriber on `qspApi$` and one on `gameOpenEpoch$` (call old `unwatch` first; skip if no api). Use `nextRefCount`.

- [ ] **Step 2: Rewire hooks and module atoms**

`useQspVariable`, `useQspExpression` as in Interfaces. In `render-state.ts`, replace `createVariableAtom(name, default)` with a derived atom over `variable$(name)` (call `acquireVariable(name)` once at module load, never release) mapping `scalarOrUnset(v) || initial` to a string. Delete `typedVariableName` and its import/test.

- [ ] **Step 3: Unit tests and typecheck**

Run: `pnpm nx test game-state`, `pnpm nx test renderer`, `pnpm typecheck` → PASS.

- [ ] **Step 4: E2E**

Run: `CHROME_BIN=/usr/bin/chromium pnpm e2e:web -- variables.scenario.ts game-html-watchers.scenario.ts look-vars.scenario.ts look-effects.scenario.ts`
Expected: OPENQST scenario PASS; `game-html-watchers`, `look-*` PASS. The unprefixed and bind scenarios may still fail (Tasks 4–5) — note which.

- [ ] **Step 5: Commit**

```bash
git add libs/game-state libs/renderer/src/render-state.ts
git commit -m "feat(game-state): shared variable layer that survives OPENQST"
```

---

### Task 4: Names as written — built-ins typed, tuples shown by qsp-variable

**Files:**

- Modify: `libs/renderer/src/theme-core/main.tsx:22`, `libs/renderer/src/theme-core/stats.tsx:22`, `libs/renderer/src/transformers/aero/aero-view.tsx:14`, `aero-overlay.tsx:7`, `aero-input.tsx:20-21`, `aero-msg.tsx` (`MSG_X`, `MSG_Y`), `aero-menu.tsx` (`FIXED_SIZE_MENU`, `MENU_X`, `MENU_Y`), the four `useAeroEffect(…, '*_EFFECT_TIME')` callers (aero-msg/menu/view/input), `libs/renderer/src/theme-core/qspider/qsp-variable.tsx`
- Test: `libs/renderer/src/theme-core/css-variable-rules.spec.ts` (create or extend)

**Interfaces:**

- Consumes: `useQspVariableRaw`, `formatQspValue` (Tasks 2–3).

- [ ] **Step 1: Write the failing `cssVariableRules` test (Review Focus 5)**

```ts
expect(cssVariableRules({ name: '--code-color', type: 'color', defaultValue: '' } as CssVarDefinition, '255')).toEqual(
  cssVariableRules({ name: '--code-color', type: 'color', defaultValue: '' } as CssVarDefinition, String(255)),
);
```

plus: a value of `''` gives the default rule. (If this already passes, keep it as the pin and move on — it guards the raw-string path.)

- [ ] **Step 2: Prefix every numeric built-in with `#`**

Grep `useQspVariable\('[A-Z_]` and `useAeroEffect(` in `libs/renderer` and `libs/game-state`; every unprefixed built-in name gets `#` (list in spec + `MSG_X/Y`, `FIXED_SIZE_MENU`, `MENU_X/Y`). Theme/game-supplied names (props, attributes) stay untouched.

- [ ] **Step 3: `<qsp-variable>` shows the raw value**

`QspVariable` uses `useQspVariableRaw(name, vkey, index)` and renders `formatQspValue(raw)`; when `raw` is `undefined` or `''`/`0`-unset, render the prefix default exactly as today (`''` for `$`, `0` otherwise) so existing output is unchanged.

- [ ] **Step 4: Verify**

Run: `pnpm nx test renderer`, `pnpm typecheck`, then `CHROME_BIN=/usr/bin/chromium pnpm e2e:web -- variables.scenario.ts game-html-watchers.scenario.ts look-vars.scenario.ts look-effects.scenario.ts`
Expected: unprefixed qsp-variable scenario PASS; look/aero scenarios PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/renderer
git commit -m "fix(renderer): read unprefixed theme variables as stored, built-ins as numbers"
```

---

### Task 5: Bind writes by stored type, key escaped

**Files:**

- Modify: `libs/renderer/src/hooks/qsp-bind-code.ts`, `libs/renderer/src/hooks/qsp-bind.ts`
- Test: `libs/renderer/src/hooks/qsp-bind-code.spec.ts`

**Interfaces:**

- Consumes: `useQspVariableRaw`, `scalarOrUnset`.
- Produces: `bindAssignment(bind: string, bindKey: string, bindIndex: number, value: string, stored: QspVariableValue): string`.

- [ ] **Step 1: Write the failing tests**

```ts
expect(bindAssignment('x', '', 0, 'hi', 'old')).toBe('x = "hi"'); // unprefixed, string stored
expect(bindAssignment('x', '', 0, '12', 5)).toBe('x = 12'); // unprefixed, number stored
expect(bindAssignment('x', '', 0, '12', undefined)).toBe('x = 12'); // unset → number
expect(bindAssignment('x', '', 0, 'hi', [1])).toBe('x = 0'); // tuple counts as unset → number
expect(bindAssignment('$s', '', 0, 'hi', 5)).toBe('$s = "hi"'); // prefix decides
expect(bindAssignment('$s', 'a"b', 0, 'v', '')).toBe('$s["a""b"] = "v"'); // key escaped via toQspString
```

Update existing `bindAssignment` tests to pass a `stored` argument.

- [ ] **Step 2: Run to verify failure**

Run: `pnpm nx test renderer -- qsp-bind-code` → FAIL.

- [ ] **Step 3: Implement**

String literal when the name starts with `$`, or when it has no prefix and `typeof scalarOrUnset(stored) === 'string'`; otherwise `leadingInteger`. Key via `toQspString(bindKey)`. `useQspBind` reads `useQspVariableRaw` for `stored` and keeps `useQspVariable(…, '')` for the displayed value.

- [ ] **Step 4: Verify**

Run: `pnpm nx test renderer -- qsp-bind-code` → PASS; `CHROME_BIN=/usr/bin/chromium pnpm e2e:web -- variables.scenario.ts game-html.scenario.ts` → all PASS (incl. the three existing qsp-bind scenarios).

- [ ] **Step 5: Commit**

```bash
git add libs/renderer/src/hooks
git commit -m "fix(renderer): qsp-bind writes by the stored type and escapes its key"
```

---

### Task 6: Gate, notes, PR

- [ ] **Step 1:** Delete `apps/player-e2e/artifacts/web-report` if present. Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm nx test game-state`, `pnpm nx test renderer` → all PASS.
- [ ] **Step 2:** Run the touched web specs once more together: `variables`, `game-html`, `game-html-watchers`, `look-vars`, `look-effects`, `themes`/`core-flow-themes`, `shelf` (Review Focus 4) → PASS. Desktop runs on CI (variables scenarios run on every target except the webOnly bind one).
- [ ] **Step 3:** Update memory note `variable-reading-research` (A1, unprefixed fix, OPENQST result done; link the PR).
- [ ] **Step 4:** Commit spec + plan (`docs/superpowers/…`), push, open PR against `main` with: the three bugs, red-before evidence from Task 1 Step 4, the builder calls from the spec, and the test runs. Watch the target CI jobs (`e2e-web`, `e2e-desktop*`) for the new scenarios.
