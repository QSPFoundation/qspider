# Debugger: QSP code that reads right

Date: 2026-11-14. Engine `@qsp/wasm-engine` 2.0.0 (core 5.9.6). Background: memory note `qsp-language-gap`.
Builds on #212 (desktop debugger, bundled Monaco) and #214 (variable hover, watch list, break on change).
Reference: upstream `QSPFoundation/qsp` master `1b46e3f`. Its `help/qsp_grammar.peg` and the name tables in
`qsp/statements.c` / `qsp/mathops.c` define the language; where the grammar and the engine disagree, the engine wins.

## Intent

The debugger is mainly for authors testing their own games. A smaller but real group digs into code they didn't
write, often old games whose authors are gone. Both need the debugger's code view to show code the way the engine
runs it, and hover and watch to find the right thing under the cursor.

Today the QSP language support (`libs/debugger/src/lib/qsp-language.ts`, a Monarch definition) gets basic QSP
wrong in places and knows nothing about the 5.9 additions (fields, records, `?`, new statements). Hover is built on
its tokens, so hover inherits every mistake.

This is step 1 of three. Step 2 is current (runtime) actions in the Actions tab; step 3 is navigation (go to a
location, find where a variable is set). Each gets its own design. Step 3 will reuse this step's lexer.

## Decisions (maintainer's)

1. **Approach A:** a rewritten token-based highlighter. No parser, no vendored grammar.
2. **Hover inside `<<…>>` is in** (it was deferred in #214; the lexer change makes it cheap). That covers `<<…>>` in
   strings anywhere, including strings inside `{…}` code blocks.
3. **The Description tab gets `<<…>>` highlighting and hover.**
4. **The Actions tab picker shows each base action's name** instead of "Action N".
5. Step order: this, then current actions, then navigation.
6. **Watch entries can be items and field paths with literal indices,** string keys included: `A[1]`, `A['k']`,
   `A[1, 'x']`, `A.B.C`, `A['k'].B`. Pin on an item hover pins that item (a change from #214, where it pinned the
   whole array).

## Approaches considered

- **A. Rewrite the highlighter (picked).** Token-based. It tolerates broken code, which old games often contain,
  and keeps one moving part. Cost: hand-kept keyword lists, guarded by tests.
- **B. A plus a vendored copy of `qsp_grammar.peg` as a test oracle for the lists.** Rejected: the grammar already
  lags the engine (no `exec`, no two-word statement forms), so the copy needs local patches for little gain.
- **C. A real parser (Ohm with the upstream grammar).** Rejected for now: a location with one syntax error doesn't
  parse, so it needs a token fallback anyway; new dependency; same grammar lag. Revisit only if navigation (step 3)
  needs more than tokens.

## Engine facts (probed 2026-11-14 against the bundled engine)

- **The code view shows the engine's normalized code, not the author's source.** `getLocationCode` returns:
  - everything outside strings and `{…}` blocks upper-cased: `ПЕРЕМЕННАЯ = 5`, `A.B.C = 42`, `ADD OBJ 'o'`,
    `$MID('hello', 2)`, `IF A ! 1: X = 1 ELSE IF …`
  - strings verbatim, including `<<…>>` inside them: `'to <<$p.name>>'`
  - `{…}` contents verbatim: `{ pl 'in <<x>>' & k = 1 }`
  - comments upper-cased except their quoted parts: `! A COMMENT WITH 'quote' AND {brace}`
  - two-word statements with one space; `ELSE IF` kept as two words
- **Each code entry carries a source line number.** A line continuation (` _` at line end) is joined into one
  entry; a string spanning lines stays one entry containing `\r\n`. Example entries: lines 1, 2, 4, 6 for a
  six-line source. Debug stops report the same numbers (1, 2, 4, 6).
- **Existing bug:** `getLocationCode` in `libs/game-state/src/qsp-api.ts:139` (and the action-code twin at :144)
  drops the line numbers and the viewer joins entries with `\n`. After the first continuation or multi-line
  string, the current-line highlight and breakpoints point at the wrong line.
- **Fields:** `.` reads a named field of a tuple. `a.b.c = 42` makes `A` the tuple `[B: [C: 42]]` (field names are
  upper-cased; read back as `names` on the tuple). There is no variable `A.B.C`: `readVariable('A.B.C')` returns
  undefined. Fields may carry a type prefix (`a.$name`) and may be quoted (`a.'some field'`).
- **`<<…>>` is only valid inside strings** (and descriptions / action names, which the engine formats as text).
  A bare `<<y>>` in code, including in a `{…}` block, is a syntax error. In a block, the string's `<<…>>` expands
  when the block's code runs.
- Works on the bundled engine: records `[name: 'Bob', 'full name': 'B B']`, `?`, `+=`, `=<`/`=>`, `!` as not-equal,
  `ELSE IF`, `ADD OBJ` / `DEL OBJ` / `DEL ACT` / `MOD OBJ` / `CLOSE ALL`, `ALIAS y = 'x'`, `INSVAR`, `MOVEARR`,
  `ARRKEY`, `EXEC`, `@@loc`, Cyrillic names, multi-line strings with doubled-quote escapes.
- **Upstream master and the bundled engine agree** on every name checked, including MOVEARR (the newest statement,
  2026-11-09). The lexer takes its lists from master; tests check them against the bundled engine.
- **Case:** string keys and quoted field names are case-insensitive (`$a['k']` reads as `$a['K']`); field names are
  stored upper-cased, quoted ones too (`r.'some Field'` → `SOME FIELD`). Upper-casing watch entries stays correct.
- **Function and operator names can be variables.** `mid = 1`, `and = 1`, `while = 1`, `obj = 1` each create a
  variable at statement start (as an assignment target), while `x = mid` calls the function. `end = 1` does not.

## Goals

### Lexer and highlighting

Rules follow the engine (upstream source is the reference):

- **Names:** a run of characters that are not delimiters (` \t&'"()[]{}=!<>+-/*\,:;^@?` and newline) and not `.`,
  not starting with a digit, with an optional `$`/`#`/`%` prefix. Any script works (Cyrillic, etc.).
- **Keywords:** every statement, function and operator name in the engine tables, including `alias`, `insvar`,
  `movearr`, `arrkey`, `exec`, and the two-word forms `add obj`, `del obj`, `del act`, `mod obj`, `close all`,
  `else if`. Control words `if`, `elseif`, `else`, `end`, `act`, `loop`, `while`, `step`, `set`, `let`, `local`.
  Operator words `and`, `or`, `mod`, `no`, `obj`, `loc`. A keyword is a keyword only as a whole name (`goldsmith`
  is a name). Exception, following the engine: a function or operator name that is the target of an assignment
  (`mid = 1`) is a variable there.
- **Prefixed functions** (`$mid`, `$str`, `#max`, …) are functions, not variables.
- **Comments:** `!` starts a comment only at a statement start: line start, after `&` outside brackets, and after
  the `:` that ends an `if` / `elseif` / `else` / `act` / `loop` header (and after `else`). Elsewhere `!` is the
  not-equal operator. A comment runs to the end of the line, but quoted strings and `{…}` blocks inside it span
  lines like everywhere else.
- **Strings:** `'…'` and `"…"`; the only escape is a doubled quote. They can span lines. Inside, `<<…>>` holds an
  expression, lexed as code; that expression can't use the outer string's quote character.
- **Code blocks:** `{…}` nest and their contents are code.
- **Numbers:** digits only.
- **Also:** `?` (undefined value), `=`, `+=`, `-=`, `*=`, `/=`, `<>`, `<=`, `=<`, `>=`, `=>`, `<`, `>`, `+`, `-`, `*`,
  `/`, `&`, `,`, `.`, `:` labels (`:label` — the label name is a label, not a variable), `@name` / `@@name` calls
  (the location name is a run of non-delimiters, dots allowed), line continuation ` _`.
- **Removed:** `//` and `/* */` comments, backslash escapes, `#region` folding, decimal numbers.

### Code view lines (bug fix)

- Each code entry is placed at its own line number. Gaps (joined continuation lines) are blank lines, so viewer
  line N is always engine line N. This applies to location code and action code.
- A multi-line string entry shows across its lines; `\r\n` inside entries displays as line breaks.

### Hover

Everything #214 does keeps working. New:

- **Field paths:** hovering any segment of `a.b.c` shows the value at that depth (hover `b` → `A.B`, hover `c` →
  `A.B.C`). An index before a field works the same way: `a[1].b`, `a['k'].b`. Quoted field names
  (`a.'some field'`) work. A field type prefix (`a.$name`) reads like a prefixed variable, including the "stored
  value is a …" hint.
- **No hover on:** field names in record literals (`[name: …]`), label names, the `_` continuation, keywords,
  dynamic field names (a quoted field name containing `<<…>>`; reading it would run code).
- **`<<…>>`:** hover works inside it the same as in plain code, in location code, action code (including strings in
  `{…}` blocks) and the Description tab.
- **Pin** pins exactly what the hover shows when every index on the way is a literal: a field path (`A.B.C`), an
  item (`A[1]`, `A['k']`, `A[1, 'x']`) or both (`A['k'].B`). When an index is a variable or an expression
  (`$a[i]`, `a[i].b`), Pin pins the whole base variable, as today.
- **Indices named by a variable** (`$a[i]`) accept any name the lexer accepts (today only ASCII).

### Watch list

- **Entry forms:** a variable name, then optionally one literal index (number, string, or a tuple of those), then
  optionally fields: `A`, `$A[1]`, `A['k']`, `A[1, 'x']`, `A.B.C`, `A['k'].B`, `A.$NAME`, `A.'some field'`. Indices
  that are variables or expressions are not allowed (the entry would depend on two variables).
- Entries can be typed in the watch input in these forms; an invalid entry is rejected with a short message.
- An entry is read by reading the base variable or item and walking the fields. A missing item or field shows "not
  set".
- Identity stays the upper-cased entry text, with the spacing normalized (`a[ 'k' ]` and `A['K']` are one entry).
- A path entry changes whenever its value changes, including when the base variable is replaced as a whole.
- Change notices name the path (`A.B.C changed 1 → 2`).

### Description tab

- A language for descriptions: HTML highlighting (Monaco's HTML Monarch definition, already bundled), with
  `<<…>>` lexed as a QSP expression. Hover works inside `<<…>>`.

### Actions picker

- Each item shows the action's name from `getLocationActions` (raw, `<<…>>` unexpanded), with its number as a
  fallback for an empty name.

## Non-goals

- Navigation (go to location, find usages): step 3.
- Current (runtime) actions: step 2.
- Expression box (B6), variable browser (B5), save inspection (B7): stay deferred / out.
- Hover that evaluates expressions (`$a[i + 1]` still shows the array summary).
- Editing code; highlighting the author's original source text (the viewer shows engine code).
- Engine changes.

## Anti-goals

- No hover that runs engine code. Reads only, as today.
- No regression on broken code: an unbalanced quote or brace must not swallow the rest of the location beyond what
  the engine itself would treat as a string or block.
- No regression in existing debugger and variable E2E scenarios.
- No engine mocks; unit tests cover pure functions, engine behaviour is proved by E2E (house rule).

## Calls made (Claude's, for the maintainer to check)

- **Own lexer instead of Monarch.** A pure TypeScript lexer with a line-to-line state, wired into Monaco through
  `setTokensProvider`. Reason: Monarch definitions run only inside Monaco, which the node-environment unit tests
  of `libs/debugger` can't load, so the rules would be testable only through E2E. A pure lexer gets full unit
  tests, and hover (and later step 3) uses the same tokens. Still approach A: tokens, no parse tree.
  Monaco supports this directly (0.55.1): `languages.setTokensProvider(id, { getInitialState, tokenize(line,
state) })`, with an `IState` (`clone`, `equals`) carried from line to line. Hover stops calling
  `monaco.editor.tokenize` on a single line and runs the lexer from the start of the model, so it knows when the
  cursor is inside a multi-line string or a `<<…>>`.
- **The bundled engine defines the language,** not the QSP version a game was written for. Old games run on the
  same engine.
- **A variable index pins the base.** Watching `A[I].B` with `I` re-read at each stop was considered and left out.
- **`&` inside brackets:** a statement start is tracked by bracket depth on the current line, like the engine.
- **Description `<<…>>`** reuses the expression lexer inside an HTML tokenizer; the builder picks how (extending
  Monaco's HTML Monarch definition with an embedded language, or a wrapper provider).

## Left to the builder

- Token type names and theme colours (keep the current look where a token kind exists today).
- Where the lexer lives (`libs/debugger` or a shared lib, so step 3 can reuse it) and the shape of its API.
- How hover extracts the path from tokens; how the watch-path reader is split into pure and engine parts.
- Exact fixture content. It needs at least: a Cyrillic name, a field path with index and quoted field, a record
  literal, a prefixed function, the two-word statements, `!` as not-equal and as a mid-line comment after `&`,
  `<<…>>` in a string and in a string inside `{…}`, a line continuation and a multi-line string followed by a line
  with a breakpoint, a description with `<<…>>`, and named base actions.

## Testing

- **Unit (pure):** the lexer (every rule above, the normalized engine spelling, broken-code recovery, line-to-line
  state), path extraction for hover, field walking, line placement of code entries, action labels.
- **E2E (debugger scenarios, both web and desktop as today):** hover on a Cyrillic name, on each segment of a field
  path, inside `<<…>>` in code and in the Description tab, on a prefixed function (no variable hover); pin and watch
  a field path and an item with a string key, including a change notice; type a path into the watch input; current-line highlight and a breakpoint on the line after a continuation
  and after a multi-line string; action names in the picker.
- Follow `apps/player-e2e/README.md` Rules for new scenarios.
