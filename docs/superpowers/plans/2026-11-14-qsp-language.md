# QSP Code That Reads Right Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The debugger's code view shows QSP code the way the bundled engine runs it (tokens, line numbers, action
names), and hover, Pin and the watch list understand fields, items and `<<…>>`.

**Architecture:** The Monarch definition in `libs/debugger/src/lib/qsp-language.ts` is rewritten to the engine's
rules and tested through `monaco.editor.tokenize` in Vitest browser mode. Hover tokenizes from the top of the code
and turns the tokens around the cursor into a path (`name[index].field…`). Game-state gets one shared path model
(`qsp-path.ts`) that hover, Pin and the watch list use to read values. Code entries are placed at their engine line
numbers.

**Tech Stack:** TypeScript, React, Monaco 0.55.1 (Monarch), xoid, Vitest (node and browser mode), Serenity/JS
Playwright + WebdriverIO E2E, NX.

**Spec:** `docs/superpowers/specs/2026-11-14-qsp-language-design.md`

## Global Constraints

- Engine `@qsp/wasm-engine` 2.0.0 (core 5.9.6) is the language reference; upstream `QSPFoundation/qsp` master
  `1b46e3f` name tables (`qsp/statements.c`, `qsp/mathops.c`) give the lists. No engine changes.
- Monarch stays the tokenizer: no hand-written lexer, no new dependency.
- No hover or watch read runs engine code: only `readVariable*` / `readVariableSize` / `readVariableItem`.
- No engine mocks. Unit tests cover pure functions (and the tokenizer through Monaco); engine behaviour is proved by
  E2E (`apps/player-e2e`, debugger scenarios run on web and desktop).
- Tasks run through NX: `pnpm nx test <project>`, never vitest directly.
- New E2E follows `apps/player-e2e/README.md` Rules (areas, naming, `data-qa`/role locators, `seeEventually`,
  `OperatePlayer`).
- Browser-mode unit tests need Chromium: `CHROME_BIN=/usr/bin/chromium`.
- Before declaring done: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm nx test debugger`,
  `pnpm nx test game-state`, and the debugger E2E specs (`pnpm e2e:web`, plus `pnpm e2e:desktop` for the debugger
  scenario). CI on the PR is the full gate.
- Commit messages: conventional commits (`feat(debugger): …`, `fix(game-state): …`, `test(player-e2e): …`).

## Review Focus

1. **Broken old code:** an unclosed `<<` inside a string must end at the string's closing quote, and an unclosed
   string ends where the engine's would (the next same quote, possibly lines later) — test in Task 2.
2. **A function name used as a variable** (`MID = 1` at statement start, `SET MID = 1`) highlights and hovers as a
   variable, while `X = MID` stays a function — test in Task 2 and Task 4.
3. **A path whose base is not a tuple, or whose field is missing,** shows "not set", never throws — test in Task 3.
4. **Huge locations:** hover re-tokenizes from the top; it must reuse the tokens while the model hasn't changed —
   test in Task 4 (same model version → same token array).
5. **Watch identity:** `a[ 'k' ].b`, `A['K'].B` and `a["k"].B` are one entry — test in Task 5.

---

## File Structure

| File                                                                                       | Responsibility                                                                                               |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `libs/debugger/vite.config.mts`                                                            | switch to `browserTest('debugger')`                                                                          |
| `libs/debugger/src/lib/qsp-language.ts`                                                    | Monarch definitions: `qsp`, `qsp-expr` (an expression, for embedding), keyword lists, `isQspKeyword`         |
| `libs/debugger/src/lib/qsp-description-language.ts`                                        | `qsp-description`: Monaco's HTML Monarch with `<<…>>` embedding `qsp-expr`                                   |
| `libs/debugger/src/lib/qsp-tokens.ts`                                                      | `qspLineTokens` (tokenize from the top, cached per model version) and `hoverTargetAt` (tokens → path target) |
| `libs/debugger/src/lib/qsp-hover.ts`                                                       | hover provider for `qsp` and `qsp-description`, built on `qsp-tokens.ts`                                     |
| `libs/game-state/src/qsp-path.ts`                                                          | pure path model: `QspPath`, `parseQspPath`, `formatQspPath`, `walkFields`                                    |
| `libs/game-state/src/debug-hover-logic.ts`                                                 | hover plan gains fields; name rule becomes Unicode                                                           |
| `libs/game-state/src/debug-hover.ts`                                                       | reads plans with fields and items; Pin name = the path                                                       |
| `libs/game-state/src/debug-watch-logic.ts` / `debug-watch.ts`                              | watch entries are paths                                                                                      |
| `libs/game-state/src/variable-logic.ts`                                                    | `applyTypePrefix`                                                                                            |
| `libs/game-state/src/code-search.ts` / `qsp-api.ts`                                        | `placeCodeLines`; action names in `LocationInfo`                                                             |
| `libs/debugger/src/lib/code-viewer.tsx`, `watch-panel.tsx`                                 | description language, action names, invalid-entry message                                                    |
| `apps/player-e2e/fixtures/debugger/debugger.qsps`, `build-fixtures.ts`, `debugger-game.ts` | `syntax` location                                                                                            |
| `apps/player-e2e/screenplay/debugger/*`, `scenarios/debugger.scenario.ts`                  | new tasks, checks, scenarios                                                                                 |

Token types (Monarch appends `.qsp` / `.qsp-expr`; code compares with `startsWith`):

| Type                                                                                                                                                                              | Text                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `keyword`                                                                                                                                                                         | statements, control words, operator words, two-word forms, `*PL` & co |
| `predefined`                                                                                                                                                                      | functions, plain or prefixed (`MID`, `$MID`, `#MAX`)                  |
| `variable`                                                                                                                                                                        | prefixed name (`$WHO`)                                                |
| `identifier`                                                                                                                                                                      | plain name (`GOLD`, `ПЕРЕМЕННАЯ`)                                     |
| `variable.field`                                                                                                                                                                  | field name after `.` (`B`, `$NAME`)                                   |
| `field.record`                                                                                                                                                                    | `NAME` in `[NAME: …]`                                                 |
| `label`                                                                                                                                                                           | `:LABEL` at statement start                                           |
| `function.call`                                                                                                                                                                   | `@LOC`, `@@LOC`                                                       |
| `comment`, `string`, `string.escape` (`''`, `""`), `delimiter.interpolation` (`<<`, `>>`), `number`, `constant` (`?`), `operator`, `delimiter` (`,` `.` `:`), `delimiter.bracket` | as named                                                              |

---

### Task 1: Debugger unit tests in browser mode

**Files:**

- Modify: `libs/debugger/vite.config.mts`, `libs/debugger/tsconfig.spec.json`, `CLAUDE.md:27`
- Create: `libs/debugger/src/lib/qsp-language.spec.ts`

**Interfaces:**

- Produces: a spec harness `tokens(code: string, lang = 'qsp'): Array<Array<{ text: string; type: string }>>` (per
  line, type without the language postfix), defined at the top of `qsp-language.spec.ts` with
  `monaco.editor.tokenize` from `./monaco-setup`. Later tasks add cases to this file.

- [ ] **Step 1: Write a smoke test** in `qsp-language.spec.ts`: `tokens("GOLD = 1")[0]` contains
      `{ text: 'GOLD', type: 'identifier' }`.
- [ ] **Step 2: Run** `CHROME_BIN=/usr/bin/chromium pnpm nx test debugger` — expected FAIL: the node environment
      cannot load `monaco-editor`.
- [ ] **Step 3: Switch the config** to `test: browserTest('debugger')` (import from `../../vitest.browser.mts`, as
      `libs/html-renderer/vite.config.mts` does); spec tsconfig like html-renderer's (drop `module: commonjs`). Add
      `debugger` to the browser-mode list in `CLAUDE.md:27`.
- [ ] **Step 4: Run** the same command — expected PASS, including the existing `debug-utils.spec.ts`.
- [ ] **Step 5: Commit** `test(debugger): run unit tests in browser mode`.

### Task 2: The QSP tokenizer

**Files:**

- Modify: `libs/debugger/src/lib/qsp-language.ts` (rewrite), `libs/debugger/src/lib/qsp-hover.ts:7-8` (use
  `isQspKeyword`)
- Test: `libs/debugger/src/lib/qsp-language.spec.ts`

**Interfaces:**

- Produces: `QSP_STATEMENTS`, `QSP_FUNCTIONS`, `QSP_CONTROL_WORDS`, `QSP_OPERATOR_WORDS: readonly string[]`
  (lower case); `isQspKeyword(word: string): boolean` (any of the four, case-insensitive, prefix stripped only for
  functions); `qspLanguageDefinition`, `qspExpressionDefinition: languages.IMonarchLanguage`;
  `registerQspLanguage(monaco)` registers `qsp` and `qsp-expr`.

Lists (from the engine tables): statements `act add obj addobj alias cla *clear clear close close all *clr clr cls
cmdclear cmdclr copyarr del act delact del obj delobj dynamic exec exit freelib gosub goto gs gt inclib insvar jump
killall killobj killvar menu mod obj modobj movearr msg *nl nl opengame openqst *p p *pl pl play refint resetobj
savegame scanstr setvar settimer showacts showinput showobjs showstat sortarr unpackarr unsel unselect view wait
xgoto xgt`; functions `arrcomp arritem arrkey arrpack arrpos arrsize arrtype countobj curacts curloc curobjs desc
dyneval func getobj iif input instr isnum isplay lcase len maintxt max mid min msecscount qspver rand replace rgb
rnd selact selobj stattxt str strcomp strfind strpos trim ucase user_text usrtxt val`; control `if elseif else end
loop while step set let local`; operator words `and or mod no obj loc`.

Approach (Monarch, not determined by the tests): two line states per nesting level — _statement start_ and
_expression_ — switched with `switchTo` (`&` outside brackets, `:` outside brackets, `ELSE`, end of line → start;
any other token at start → expression). Brackets `(` `[` push a bracket state where `&` and `!` are operators and
`NAME:` is `field.record`. `{` pushes block-level copies of the two states (built from shared rule arrays); `}`
pops. Strings push a string state per quote; `<<` pushes an interpolation state with the expression rules, where the
outer quote is `@rematch` + `@pop`. `!` at statement start pushes a comment state that pushes string/block states
for quotes and braces and pops at end of line. Use `$`-anchored rules with a state change for end of line.
No rule for the ` _` line continuation: the engine joins those lines before the viewer sees the code (spec's
engine facts), so it never appears.

- [ ] **Step 1: Write the failing tests** (each asserts the tokens of engine-spelled lines; shorthand `[text, type]`):
  - `ПЕРЕМЕННАЯ = 5` → `['ПЕРЕМЕННАЯ','identifier']`; `$ИМЯ` → `variable`; `GOLDSMITH` → `identifier`.
  - `A.B.C = 1` → `A` identifier, `.` delimiter, `B` `variable.field`, `C` `variable.field`;
    `A.$NAME` → `$NAME` `variable.field`; `A.'some field'` → `.` then `string`.
  - `R = [NAME: 'Bob', 'FULL NAME': 1]` → `NAME` `field.record`.
  - `$S = $MID('hello', 2)` → `$MID` predefined; `X = MID('a', 1)` → `MID` predefined;
    `MID = 1` → `MID` identifier; `SET MID = 1` → `MID` identifier; `$IF = 1` → `$IF` variable.
  - `ADD OBJ 'o' & DEL OBJ 'o' & DEL ACT 'x' & MOD OBJ 'o', 'p' & CLOSE ALL` → each two-word form one `keyword`;
    `IF A: X = 1 ELSE IF B: X = 2 ELSE X = 3` → `ELSE IF` keyword; `*PL 'x'` → `*PL` keyword;
    `ALIAS Y = 'x' & INSVAR 'b', 0 & MOVEARR 'd', 'c' & K = ARRKEY('$a', 0) & EXEC 'pl 1'` → all keyword/predefined.
  - `IF A ! 1: X = 1` → `!` operator; `A = 1 & ! NOTE` → `! NOTE` comment; `IF A: ! NOTE` → comment;
    `X = (A & ! B)` → `!` operator (inside brackets); `! A COMMENT WITH 'quote' AND {brace}` → all comment.
  - Multi-line comment: `! NOTE 'spans\r\nlines' {and\r\na block} END` placed on 3 lines → every token on lines 1–3
    is comment-kind (`comment`, or `string`/`delimiter.bracket` inside the comment state, as you choose — assert
    nothing is `identifier`/`keyword`), and a following line `B = 2` → `B` identifier (state returned to start).
  - Strings: `$U = 'C:\'` → string closes at `'` (next token after is not string); `'say ''hi'''` → `''`
    `string.escape`; `'multi` / `line'` on two lines → line 2 starts as string; `'to <<$P.NAME>> and <<A>>'` →
    `<<` `delimiter.interpolation`, `$P` variable, `NAME` `variable.field`, `A` identifier.
  - Block: `CODE = { pl 'in <<x>>' & k = 1 }` → `pl` keyword, `x` identifier, `k` identifier; a `{` on line 1 and
    `! note` at the start of line 2 inside the block → comment; `}` then `X = 1` on line 3 → `X` identifier.
  - Other: `U = ?` → `?` constant; `N += 2` → `+=` operator; `Z = 1 =< 2` → `=<` operator; `:LABEL1` → `LABEL1`
    label; `GOSUB 'second' & @SECOND(1) & @@SECOND` → `@SECOND`/`@@SECOND` `function.call`; `X = 1.5` → `1`, `.`,
    `5` (no float).
  - Review Focus 1: `$S = 'a << b' & X = 1` → string ends at the second `'`, `X` identifier.
  - Every name in the four lists tokenizes as `keyword`/`predefined` in an expression position.
- [ ] **Step 2: Run** `CHROME_BIN=/usr/bin/chromium pnpm nx test debugger` — expected FAIL on most cases.
- [ ] **Step 3: Rewrite `qsp-language.ts`** per the approach; keep `qspLanguageConfiguration` but drop `#region`
      folding and `/* */` from `comments` (line comment `!`); remove `//`, `/* */`, backslash escapes, floats.
- [ ] **Step 4: Run** — expected PASS.
- [ ] **Step 5: Commit** `feat(debugger): tokenize QSP the way the engine reads it`.

### Task 3: Path model and field reads (game-state)

**Files:**

- Create: `libs/game-state/src/qsp-path.ts`, `libs/game-state/src/qsp-path.spec.ts`
- Modify: `libs/game-state/src/variable-logic.ts` (+ spec), `libs/game-state/src/debug-hover-logic.ts` (export
  `splitParts`, `parseLiteral`; `PLAIN_NAME` → `QSP_NAME`), `libs/game-state/src/index.ts`

**Interfaces:**

- Produces:
  - `type QspTypePrefix = '$' | '#' | '%'`; `interface QspField { name: string; prefix?: QspTypePrefix }`
    (name upper-cased, quotes removed);
  - `interface QspPath { name: string; index?: QspVariableKey; fields: QspField[] }` (`name` keeps its prefix,
    upper-cased);
  - `parseQspPath(text: string): QspPath | null` — `NAME`, optional one literal `[…]` (number, quoted string, or a
    comma list of those), then `.field` parts (plain, prefixed, or quoted); `null` for anything else, including a
    variable/expression index and a quoted field containing `<<`;
  - `formatQspPath(path: QspPath): string` — canonical text: upper case, string keys and quoted fields in `'…'`
    with doubled quotes and upper-cased, tuple keys `1, 'X'`, no spaces except after commas;
  - `walkFields(value: QspVariableValue, fields: QspField[]): QspVariableValue` — field lookup by
    `value.names` (upper-case compare); `undefined` when a step is not a tuple or the field is missing;
  - `applyTypePrefix(prefix: QspTypePrefix | undefined, value: QspVariableValue): QspVariableValue` in
    `variable-logic.ts` — same rule as the engine wrapper: a mismatched prefix gives `''` / `0` / `[]`;
  - `QSP_NAME: RegExp` — `^[$#%]?` + a first char not in ` \t\r\n&'"()[]{}=!<>+-/*\,:;^@?.` and not a digit, then
    any chars not in that set (Unicode-aware).

- [ ] **Step 1: Write the failing tests:**
  - `parseQspPath("a['k'].b")` → `{ name: 'A', index: 'k', fields: [{ name: 'B' }] }`;
    `parseQspPath('$a[1, "x"]')` → index `[1, 'x']`; `parseQspPath("a.$name.'some Field'")` → fields
    `[{ name: 'NAME', prefix: '$' }, { name: 'SOME FIELD' }]`; `parseQspPath('ПЕРЕМЕННАЯ')` → name `ПЕРЕМЕННАЯ`;
    `parseQspPath('a[i].b')`, `parseQspPath('a[i + 1]')`, `parseQspPath("a.'x<<y>>'")`, `parseQspPath('1a')`,
    `parseQspPath('')` → `null`.
  - `formatQspPath(parseQspPath("a[ 'k' ].b")!)` === `formatQspPath(parseQspPath('A["K"].B')!)` === `"A['K'].B"`;
    `formatQspPath(parseQspPath("a['it''s']")!)` → `"A['IT''S']"`.
  - `walkFields(rec, [{ name: 'B' }, { name: 'C' }])` with `rec = [B: [C: 42]]` → `42`; missing field → `undefined`;
    base `5` with fields → `undefined`; empty fields → the value itself.
  - `applyTypePrefix('$', 5)` → `''`; `applyTypePrefix('#', 'x')` → `0`; `applyTypePrefix('%', 1)` → `[]`;
    `applyTypePrefix(undefined, 1)` → `1`; `applyTypePrefix('$', 'x')` → `'x'`.
  - `QSP_NAME` accepts `ПЕРЕМЕННАЯ`, `$ИМЯ`, `A_B`; rejects `1A`, `A.B`, `A B`.
- [ ] **Step 2: Run** `pnpm nx test game-state` — expected FAIL (module missing).
- [ ] **Step 3: Implement** in `qsp-path.ts` (reuse `splitParts`/`parseLiteral` for the index) and
      `variable-logic.ts`; export all from `index.ts`.
- [ ] **Step 4: Run** — expected PASS (existing hover-logic tests still pass with `QSP_NAME`).
- [ ] **Step 5: Commit** `feat(game-state): QSP path model for fields and items`.

### Task 4: Hover on paths, `<<…>>` and across lines

**Files:**

- Create: `libs/debugger/src/lib/qsp-tokens.ts`, `libs/debugger/src/lib/qsp-tokens.spec.ts`
- Modify: `libs/debugger/src/lib/qsp-hover.ts`, `libs/game-state/src/debug-hover-logic.ts` (+ spec),
  `libs/game-state/src/debug-hover.ts`

**Interfaces:**

- Consumes: Task 2 token types; Task 3 `QspPath`, `QspField`, `parseQspPath`, `formatQspPath`, `walkFields`,
  `applyTypePrefix`, `QSP_NAME`.
- Produces:
  - `qspLineTokens(model: { getValue(): string; getVersionId(): number; uri: { toString(): string } }, line: number,
languageId: string): Array<{ offset: number; type: string }>` — tokenizes the whole text once per model version
    (cache keyed by uri + version) and returns the line's tokens.
  - `interface HoverTarget { name: string; indexText?: string; fields: string[] }` — field texts as written
    (`B`, `$NAME`, `'some field'`), up to and including the hovered segment.
  - `hoverTargetAt(line: string, tokens: Array<{ offset: number; type: string }>, column: number):
{ target: HoverTarget; start: number; end: number } | null` — the hovered token must be `variable*`,
    `identifier*`, or a `string` right after a `.` delimiter; walks left over `.field`, `[…]` and the base name.
    The caret-after-word fallback of today's provider stays.
  - `hoverReadPlan(token, indexTextAfter, isKeyword, fieldTexts: string[] = [])` — plans `value` and `item` gain
    `fields?: QspField[]`; `itemByVar` gains it too; any field text that `parseQspPath` would reject (dynamic
    quoted field) → `{ kind: 'none' }`.
  - `readHover(plan)` — reads base or item, then `walkFields`, applying the last field's prefix
    (`describeHover(label, applyTypePrefix(prefix, raw), prefix ? raw : undefined, raw === undefined ? 0 : 1)`);
    label is `formatQspPath`; `pinName` is `formatQspPath(path)` when every index is literal (items included),
    else the base name.

- [ ] **Step 1: Write the failing tests:**
  - `qsp-tokens.spec.ts` (browser mode, real tokenizer): for line `A['K'].B.C = 1`, hovering `C` gives
    `{ name: 'A', indexText: "'K'", fields: ['B', 'C'] }`, hovering `B` gives fields `['B']`, hovering `A` gives
    no fields; `$P.$NAME` → fields `['$NAME']`; `A.'SOME FIELD'` hovering the string → fields `["'SOME FIELD'"]`;
    hovering `NAME` in `[NAME: 1]`, `LABEL1` in `:LABEL1`, `$MID` in `$MID('a',1)` → `null`; inside
    `'x <<GOLD>> y'` hovering `GOLD` → name `GOLD`; a two-line string `'a` / `<<GOLD>>'` hovering `GOLD` on line 2
    → name `GOLD` (cross-line state); `qspLineTokens` returns the same array instance for the same model version
    and a new one after the version changes (Review Focus 4).
  - `debug-hover-logic.spec.ts`: `hoverReadPlan('A', undefined, isKeyword, ['B', '$C'])` →
    `{ kind: 'value', name: 'A', fields: [{ name: 'B' }, { name: 'C', prefix: '$' }] }`;
    `hoverReadPlan('A', "'k'", isKeyword, ['B'])` → item with fields; `hoverReadPlan('A', undefined, isKeyword,
["'x<<y>>'"])` → none; existing cases unchanged; `hoverReadPlan('$A', 'ИНДЕКС', …)` → itemByVar.
- [ ] **Step 2: Run** `CHROME_BIN=/usr/bin/chromium pnpm nx test debugger` and `pnpm nx test game-state` —
      expected FAIL.
- [ ] **Step 3: Implement** `qsp-tokens.ts`, then the hover-logic and `debug-hover.ts` changes, then rewire
      `qsp-hover.ts` to `qspLineTokens` + `hoverTargetAt` (provider registered for `qsp` now; Task 7 adds
      `qsp-description`).
- [ ] **Step 4: Run** both — expected PASS.
- [ ] **Step 5: Commit** `feat(debugger): hover fields, items and <<…>> with tokens from the top`.

### Task 5: Watch entries are paths

**Files:**

- Modify: `libs/game-state/src/debug-watch-logic.ts` (+ spec), `libs/game-state/src/debug-watch.ts`,
  `libs/debugger/src/lib/watch-panel.tsx` (debugger strings are `t()` keys without locale entries today; keep it so)

**Interfaces:**

- Consumes: Task 3 `parseQspPath`, `formatQspPath`, `walkFields`, `applyTypePrefix`.
- Produces: `watchKey(name: string): string` → `formatQspPath(parseQspPath(name))`, or `''` when it doesn't parse;
  `addWatch` ignores `''` keys (as today); `watchActions.add(name: string): boolean` — `false` for an invalid
  entry; `readWatchValue(api, key)` reads paths: no index/fields → as today; item → `{ value, size: value ===
undefined ? 0 : 1, items: [] }`; fields → walk the base/item value, prefix applied, same shape.

- [ ] **Step 1: Write the failing tests** (`debug-watch-logic.spec.ts`): `watchKey("a[ 'k' ].b")`,
      `watchKey('A["K"].B')` and `watchKey("a['K'].B")` are equal (Review Focus 5); `watchKey('a[i]')` → `''`;
      `addWatch([], 'a[i]')` returns the same list; `parseWatchList('["gold","a[i]"]')` → `['GOLD']`;
      `describeChange("A['K'].B", …)` names `A['K'].B`.
- [ ] **Step 2: Run** `pnpm nx test game-state` — expected FAIL.
- [ ] **Step 3: Implement** the logic, `readWatchValue` in `debug-watch.ts`, and in the panel: when `add` returns
      `false`, keep the draft and show `t('Not a variable, item or field')` under the input
      (`data-qa="debug-watch-invalid"`); placeholder becomes `t('Variable, item or field')`.
- [ ] **Step 4: Run** — expected PASS; `pnpm nx run-many -t typecheck -p debugger game-state` clean.
- [ ] **Step 5: Commit** `feat(debugger): watch items and field paths`.

### Task 6: Code at its engine line numbers; action names

**Files:**

- Modify: `libs/game-state/src/code-search.ts` (+ spec), `libs/game-state/src/qsp-api.ts:138-149`,
  `libs/game-state/src/debug.ts:19-24`, `libs/debugger/src/lib/code-viewer.tsx`

**Interfaces:**

- Produces: `placeCodeLines(entries: Array<{ line: number; code: string }>): string[]` — element `n - 1` is engine
  line `n`; an entry's code split on `\r\n` / `\n` fills consecutive lines from its own; gaps are `''`;
  `getLocationCode` / `getActionCode` in `qsp-api.ts` return `placeCodeLines(...)`; `LocationInfo` gains
  `actionNames: string[]`; `LocationReader.getLocationActions` returns `Array<{ name: string }>`.

- [ ] **Step 1: Write the failing tests** (`code-search.spec.ts`): `placeCodeLines([{line:1,code:'A = 1'},
{line:2,code:'M = 1 + 2'},{line:4,code:"$X = 'multi\r\nline'"},{line:6,code:'B = 2'}])` →
      `['A = 1','M = 1 + 2','',"$X = 'multi","line'",'B = 2']`; the comment entry
      `{line:2, code:"! NOTE 'spans\r\nlines' {and\r\na block} END"}` followed by `{line:5,…}` fills lines 2–4 then 5;
      `[]` → `[]`; `buildLocationInfo` puts `['go', 'vars']` names into `actionNames`.
- [ ] **Step 2: Run** `pnpm nx test game-state` — expected FAIL.
- [ ] **Step 3: Implement**; in `code-viewer.tsx` the action picker item text is
      `name.trim() || t('Action {{number}}', { number: index + 1 })`.
- [ ] **Step 4: Run** — expected PASS.
- [ ] **Step 5: Commit** `fix(debugger): show code at its engine line numbers and action names`.

### Task 7: Description tab language

**Files:**

- Create: `libs/debugger/src/lib/qsp-description-language.ts`
- Modify: `libs/debugger/src/lib/monaco-setup.ts`, `libs/debugger/src/lib/qsp-hover.ts`,
  `libs/debugger/src/lib/code-viewer.tsx` (description → `qsp-description`), `qsp-language.spec.ts`

**Interfaces:**

- Consumes: `qsp-expr` from Task 2; `language` and `conf` exported by
  `monaco-editor/esm/vs/basic-languages/html/html.js`; Task 4 hover pieces.
- Produces: `registerQspDescriptionLanguage(monaco)` — language `qsp-description`: the HTML Monarch definition with
  a rule ahead of each HTML state's text rules: `<<` → `delimiter.interpolation`, `nextEmbedded: 'qsp-expr'`, into a
  state where `>>` pops both; hover provider also registered for `qsp-description`.

- [ ] **Step 1: Write the failing tests** (`qsp-language.spec.ts`, `tokens(…, 'qsp-description')`):
      `<b>Gold: <<GOLD>></b>` → `<b>` HTML tag tokens, `GOLD` `identifier`; `<a href="<<$LINK>>">` → `$LINK`
      `variable` (inside an attribute value); text without `<<` → no `identifier` tokens; `hoverTargetAt` on `GOLD`
      in that line gives name `GOLD`.
- [ ] **Step 2: Run** `CHROME_BIN=/usr/bin/chromium pnpm nx test debugger` — expected FAIL.
- [ ] **Step 3: Implement** and register in `monaco-setup.ts`.
- [ ] **Step 4: Run** — expected PASS.
- [ ] **Step 5: Commit** `feat(debugger): <<…>> highlighting and hover in descriptions`.

### Task 8: Fixture and E2E

**Files:**

- Modify: `apps/player-e2e/fixtures/debugger/debugger.qsps`, `apps/player-e2e/fixtures/build-fixtures.ts`
  (`debuggerZip`), `apps/player-e2e/fixtures/debugger-game.ts`, `apps/player-e2e/screenplay/debugger/{elements,
tasks,checks}.ts`, `apps/player-e2e/scenarios/debugger.scenario.ts`

**Interfaces:**

- Consumes: everything above, through the UI.
- Produces: fixture location `syntax` (reached by a new base action `syntax` on `start`) whose code, in order:
  sets `ПЕРЕМЕННАЯ = 5`; `A.B.C = 42`; `$INV2['k'] = 'brass'`; `R = [name: 'Bob', 'full name': 'B B']`;
  `$S = $MID('hello', 2)`; uses `add obj`/`del obj`/`close all`, `alias`, `insvar`, `movearr`, `arrkey`, `exec`;
  `IF 1 ! 2: X = 1`; `Y = 1 & ! mid-line comment`; `CODE = { $T = 'in <<A.B.C>>' }`; a line continuation; a
  multi-line string; a multi-line comment with a string and a block; then `*pl 'SYNTAX END <<ПЕРЕМЕННАЯ>>'`.
  `debuggerZip` gives `syntax` the description `<b>Gold: <<A.B.C>></b>`. `DEBUGGER_GAME.syntax` holds the tokens,
  expected hover texts, the line numbers (engine numbering) and the end text. New screenplay pieces:
  `ToggleLineBreakpoint(line: number)` (clicks the glyph margin of that editor line), `SeeCurrentLineText(text)`
  (the line carrying the current-line decoration reads `text`), `SeeActionName(name)` (picker shows it),
  `SeeWatchInvalid()`.

- [ ] **Step 1: Write the scenarios** (they fail until the fixture is built and the features are in):
  - running `syntax` shows `SYNTAX END 5` (the engine accepted every statement — this checks the keyword lists are
    real);
  - hover `ПЕРЕМЕННАЯ` → `5`; hover each segment of `A.B.C` → `[B: [C: 42]]`, `[C: 42]`, `42`; hover `$MID` → no
    hover; hover inside `'in <<A.B.C>>'` in the block → `42`;
  - Description tab: hover `C` in `<<A.B.C>>` → `42`;
  - pin from the `C` hover → watch entry `A.B.C` shows `42`; pin from `$INV2['k']` hover → entry `$INV2['K']`
    shows `'brass'`; typing `a[i]` into the watch input shows the invalid message; break on change on `A.B.C`
    names `A.B.C changed`;
  - a breakpoint on the line after the multi-line comment stops there: execution line equals the fixture's engine
    line and `SeeCurrentLineText` shows that line's code; same after the continuation and the multi-line string;
  - the Actions picker shows `go`, `vars`, `bump`, `hold`, `syntax`.
- [ ] **Step 2: Build fixtures and run** `pnpm e2e:web` (debugger scenarios) — expected FAIL until the fixture
      exists, then PASS once Step 3 is in.
- [ ] **Step 3: Add the fixture content and screenplay pieces;** keep existing `DEBUGGER_GAME` values valid
      (existing scenarios must not change).
- [ ] **Step 4: Run** `pnpm e2e:web` and `pnpm e2e:desktop` (debugger scenario) — expected PASS, no regressions;
      then `pnpm format:check`, `pnpm lint`, `pnpm typecheck`.
- [ ] **Step 5: Commit** `test(player-e2e): debugger reads QSP syntax, fields and lines right`.
