# Variable watching: one shared layer, unprefixed names as stored, OPENQST-proof

Date: 2026-11-13. Engine: `@qsp/wasm-engine` 2.0.0 (core 5.9.6). Background research: memory note
`variable-reading-research`.

## Intent

qspider watches game variables in two separate ways (`useQspVariable` in `libs/game-state/src/qsp-api.ts`,
`createVariableAtom` in `libs/renderer/src/render-state.ts`), and both have bugs:

1. **OPENQST freezes watched variables.** `api.openGame(_, true)` runs the engine's `reset()`, which drops every
   watcher. `createVariableAtom` re-subscribes on `gameOpenEpoch$`, but `useQspVariable` does not. Elements that
   stay mounted across an in-game `OPENQST` (CSS variables, `DISABLESCROLL`, Aero settings and effects,
   theme-level `<qsp-variable>`/`<qsp-style>`) keep their last value. This is a hypothesis until the E2E below
   fails on main.
2. **Unprefixed names are read as numbers.** `typedVariableName` adds `#` to a name without a prefix. The reason
   given in commit 069b1be2 ("as QSP does in code") is wrong for 5.9. In 5.9, `x = 'abc'` stores a string,
   `'<<x>>'` prints `abc`, and `$x`/`#x`/`x` share one slot. A prefix asks for one type and gives that type's
   empty value (`''`, `0`, `[]`) when another type is stored; QSP code does the same (`#u` is 0 for `u = '42'`,
   while `u + 1` is 43). So
   `<qsp-variable name="x">`, `from="x"`, `qsp-bind="x"` and `<qsp-show when="x">` show the default for string
   values.
3. **Tuple watchers fire on every refresh**, because each read returns a new array and the engine compares with
   `!==`.

The why: the maintainer wants to change this code without fear. That means one place that owns variable
watching, behaviour that matches QSP, and an E2E test that pins the OPENQST case.

## Goals

- A single variable layer in `game-state` that every watched read goes through.
- Watched values survive an in-game `OPENQST` and an engine replacement.
- A name is read the way it is written, as QSP code reads it: no prefix gives the stored value; `$`/`#`/`%` give
  the value when it has that type and the type's empty value otherwise (engine 2.0 `applyTypePrefix`, no
  conversion in JS).
- Player built-ins that must be numbers are read with an explicit `#` in code.
- E2E tests: OPENQST keeps a theme-level variable live, and an unprefixed string variable shows in
  `<qsp-variable>`.

## Non-goals

- Regions and layers (`$qspider_region`, `qspider_layers`) keep their pull model (research item A2).
- One-off reads (`#NOSAVE`, `NEWLOC_EFFECT*` at new-location time) stay direct reads. They are already explicitly
  typed or converted at the call site.
- No debugger or inspector features. No engine changes.

## Anti-goals

- No regression in the existing variable scenarios: `look-vars`, `look-effects`, `game-html-watchers`, the
  `qsp-bind` scenario and the theme scenarios.
- No mocks of the engine. Unit tests cover pure functions only. Engine behaviour is proved by E2E (house rule).
- No hiding of the OPENQST test's first failure. It must be seen red on the old code before the fix lands.

## Approaches

|                                    | (a) Shared atom per variable (picked)                                                                                             | (b) Patch `useQspVariable` deps                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Fix                                | `variable$(name, key/index)` registry: one atom and at most one engine watcher per variable, re-attached on engine or game change | add `qspApi$`/`gameOpenEpoch$` to the effect deps |
| OPENQST                            | fixed in one place                                                                                                                | fixed                                             |
| Duplicate watchers, tuple re-fires | gone                                                                                                                              | remain                                            |
| Cost                               | new module, about 10 call sites                                                                                                   | about 5 lines                                     |

The maintainer picked **(a)** because it is the refactor that leaves one owner for variable watching. (b) only
patches the bug.

## Design

### Variable layer (`libs/game-state/src/variables.ts`, new)

- `variable$(name: string, key = '', index = 0): Atom<QspVariableValue>` returns a memoized atom. The memo key is
  built by a pure function from the upper-cased name (QSP names are case-insensitive), the key or index, and the
  prefix (which stays part of the identity, because `$x` and `x` read differently).
- **Engine attachment:** an entry holds one engine watcher (`watchVariableByKey` when a key is given, otherwise
  `watchVariableByIndex`), using the name exactly as written: no implicit `#`.
- **Re-attach:** when `qspApi$` changes or `gameOpenEpoch$` increments, every live entry drops its old watcher
  and registers again. The engine's immediate callback then delivers the new value. This replaces the
  hand-written re-subscribe in `createVariableAtom`.
- **Change filter:** a new value is set on the atom only if it differs structurally from the current one. A pure
  `sameValue(a, b)` compares numbers and strings by value, and tuples element by element, including
  `tuple.names`. This removes the tuple re-fire.
- **Lifecycle:** entries are reference-counted. `acquire` and `release` come from the React hook's effect, and
  when the count drops to 0 the engine watcher is detached and the entry deleted. Module-level atoms that live
  for the whole app (the format variables) acquire once and never release.
- **API used by callers:**
  - `useQspVariable(name, key, index, defaultValue)` keeps its signature, so call sites don't change. Internally
    it becomes acquire + `useSyncExternalStore` over the entry + `variableOrDefault` (implementation note:
    `useAtom` would hold on to an entry that StrictMode's release deletes).
  - `createVariableAtom` in `render-state.ts` is replaced by a derived atom over `heldVariable$(name)`, which
    acquires for the app's lifetime. `variable$` and `acquireVariable` stay private to the module.
  - `useQspExpression` watches through the same layer.
- `typedVariableName` is deleted, and its unit test goes with it.

### Names and types

- **Theme- and game-facing names** (`<qsp-variable name>`, `<qsp-style from>`, `<qsp-css-variable from>`,
  `qsp-bind`, `<qsp-show when>`, `useFormatVariable`) are passed to the engine as written.
- **Built-ins that must be numbers** get an explicit `#` at their call site: `#DISABLESCROLL` (main and stats),
  `#ALWAYS_SHOW_VIEW`, `#DISABLESHADE`, `#INPUT_X`, `#INPUT_Y`, `#MSG_X`, `#MSG_Y`, `#FIXED_SIZE_MENU`,
  `#MENU_X`, `#MENU_Y` (aero-msg.tsx, aero-menu.tsx), and every other unprefixed built-in a grep of
  `useQspVariable(` call sites finds, and the `*_EFFECT_TIME` arguments of
  `useAeroEffect` (`#MSG_EFFECT_TIME`, …). In `newLocEffect`, `NEWLOC_EFFECT_TIME` and `NEWLOC_EFFECT_SEQ`
  become `#NEWLOC_EFFECT_TIME` and `#NEWLOC_EFFECT_SEQ`, read directly with no wrapper.
- **The classic theme's unprefixed CSS sources** (`FSIZE`, `FCOLOR`, `LCOLOR`, `BCOLOR`) are read raw. A number
  behaves exactly as before. A string such as `'255'` now flows through `Number(value)` in `cssVariableRules`,
  where before it was dropped.
- **Unset values:** an unprefixed unset variable reads `undefined` (probed: `readVariable('nope')` is
  `undefined`, size 0). `variableOrDefault` already treats every falsy value as unset, so the default still
  applies.
- **Case:** the engine looks names up case-insensitively (probed: `FcOlOr` reads `FCOLOR`; a `#FCOLOR` watcher
  sees a write to `fcolor`). So one upper-cased memo entry may attach with whichever spelling came first. The
  engine's own read cache is keyed by spelling; with one entry per variable that no longer matters.
- **Tuples outside `<qsp-variable>`** (builder's call): a tuple read through an unprefixed name counts as unset
  for every other consumer (CSS variables, `<qsp-style>`, conditions, bound inputs, built-ins), so their
  defaults apply. Only `<qsp-variable>` shows tuples.

### Showing a tuple

- `<qsp-variable>` formats a tuple value with a pure `formatQspValue(value)` that reproduces QSP's own text form
  (`[1, 'a']` for `(1, 'a')`; nested tuples are bracketed; strings are single-quoted using the quoting rule the
  engine prints, which must be confirmed with the engine during implementation). Strings and numbers display as
  they are.

### `qsp-bind` on an unprefixed name

- `bindAssignment` decides the type of the literal it writes. `$name` writes a string, and `#name`/`%name` keep
  today's behaviour. An unprefixed name writes a string if the stored value is currently a string, and a number
  otherwise (including unset). The decision reads the **raw** atom value (not value-or-default, whose `''`
  default would make unset look like a string); it stays a pure, unit-tested function.
- Fix while there: the bind key is escaped with `toQspString` instead of being interpolated raw.

### Tests

**Unit tests** (pure, no mocks):

- memo-key building
- `sameValue`
- `formatQspValue`
- the bind literal-type decision
- key escaping in `bindAssignment`

**E2E tests** (follow the Rules in `apps/player-e2e/README.md`):

1. **OPENQST keeps theme variables live.** New fixture `openqst/`: `first.qsps` has an action that runs
   `OPENQST 'second.qsps'`, and `second.qsps` has an action that sets `FCOLOR` (classic theme). The scenario:
   start the first game, run the action, see the second game's text, click the colour action, then
   `SeeCssValues({ root: true }, { '--code-color': … })`. This scenario must fail on main before the fix, and the
   failure is recorded in the PR description.
2. **Unprefixed string variable.** In the existing `watchers` location of `game-html.qsps`, add
   `uvar = 'UNPREFIXED TEXT'` and `<qsp-variable name="uvar">`. The scenario sees the text, which fails on main.
3. **Bind on an unprefixed string variable** (an engine integration, so E2E by house rule): a `qsp-bind="ubind"`
   field on a variable that holds a string; typing text and showing it back gives the text, not `0`. It sits next
   to the existing `qsp-bind` scenario and is web-only like that one.
4. Existing variable scenarios stay green.

If scenario 1 is green on main, the hypothesis was wrong: keep the scenario as a regression guard, say so in the
PR, and keep the refactor (bugs 2 and 3 still justify it). Fixtures that need `OPENQST` are packed as an archive
in `fixtures/archives.ts` (so `second.qsps` resolves from the game's base URL) and run on every target.

## Left to the builder

- The exact module and file names. (Settled during implementation: only the hooks and `heldVariable$` are
  exported.)
- Whether `useQspVariable` call sites move to explicit `#` names in the same commit or a follow-up commit on the
  branch.
- The fixture's remaining packing details (test-pack inclusion or `LoadGame` of the archive).
