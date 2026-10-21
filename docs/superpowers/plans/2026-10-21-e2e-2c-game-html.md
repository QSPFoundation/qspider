# E2E Batch 2c — Game HTML & interaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cover every §D game-HTML / interaction touch point with real-engine E2E scenarios on both targets, fix the three approved ⚠ defects (dead `<form qsp-on:submit>`, unescaped `qsp-bind`, case-sensitive `javascript:` guard), and apply _targeted_ neutralization of the three proven inline-injection vectors (SVG `<script>`, self-defeating `<iframe>` sandbox, mixed-case `javascript:`) plus malformed-markup resilience.

**Architecture:** One shared fixture game (`game-html`) authors every §D surface at a known location/action, self-marking elements with `data-qa` (game-authored `data-*` passes through `content/attributes.ts`, verified). Scenarios open it via `OpenGameFile` (both targets), drive it through new screenplay areas, and assert observable outcomes with the existing `seeEventually` / presence primitives only — **no computed-style / page-evaluate check** (that primitive is reserved for 2f′). Hardening is observable-by-construction: an injected script, if it ran, would mutate the main panel's text; we assert the benign text is exactly what's present.

**Tech Stack:** Serenity/JS screenplay; web = Playwright (`CHROME_BIN`), desktop = WebdriverIO + tauri-driver (`pnpm e2e:desktop` only, isolated session); fixtures authored as `.qsps` + TOML `game.cfg`, zipped by `fixtures/build-fixtures.ts`; QSP binaries via `@qsp/converters`.

**Spec:** `docs/superpowers/specs/2026-10-21-e2e-phase2-design.md` (intent/scope/decisions) and `docs/superpowers/specs/2026-10-21-e2e-engine-inventory.md` §D + "2c" scenario list (per-scenario targets). Maintainer decision 2026-10-21: game-HTML hardening = **targeted neutralization** (not full allow-list enforcement, not deferred); the two other ⚠ fixes are already design-doc-approved.

## Global Constraints

- Run every task through **NX targets**, never direct vitest/playwright/wdio. Web: `nx run player-e2e:e2e-web` (needs `CHROME_BIN=/usr/bin/chromium`). Desktop: `pnpm e2e:desktop` only — never `wdio`/the a11y wrapper directly; stays in its private isolated session, never the real desktop/a11y bus.
- Locate **only** by `[data-qsp…]` / `[data-qa…]` / `[role=…]` (eslint `UNMARKED_SELECTORS`). `By` only in `elements.ts`.
- `screenplay/**` files **≤150 lines** (eslint `max-lines`). `elements.ts` = locators; `tasks.ts` = actions; `checks.ts` = assertions via `seeEventually` only. `Ensure`/`isPresent` banned outside `screenplay/support/`; use `support/presence` + `support/see-eventually`.
- **No fixed sleeps**; no dynamic `import()` (except the sanctioned target shim); no cross-target imports; `tasks.ts` must not import area `checks.ts`.
- **No computed-style / `page.evaluate` / `getComputedStyle` / CSS-custom-property reads** anywhere in 2c — that check primitive is 2f′ scope. Assert everything via text / presence / role.
- New fixtures are opened via `OpenGameFile` (import), **not** added to the shared launch `game.cfg` (that would break the exact `SeeShelfTitles` anchor). All 2c scenarios therefore run on **both** targets (no drag/URL routes involved).
- Fixture `.qsps` authoring: wipe then print — `*clr & *pl 'MARKER'` per observable outcome, unique ALL-CAPS markers, referenced only through the fixture `.ts` constants, never literally in scenarios.
- `pnpm check` must stay green each task; the batch ends green on `pnpm check:full` (adds desktop E2E). Desktop green may legitimately involve a `specFileRetries` retry (intrinsic relaunch flake, #167) — that is expected, not a regression.
- ⚠ player-visible fixes (Tasks 4, 5, 7) are called out in the PR body.

## Review Focus

- **`qsp-bind` input containing `"` / newline** (code injection into generated QSP). Expected: the variable holds the literal typed value; the generated code does not break. → Task 5.
- **Malformed / unclosed game markup** (`<b><i>OOPS`) must not crash the player or blank the panel. Expected: content still renders, no error alert. → Task 7.
- **Mixed-case / whitespace-prefixed `JavaScript:` / `VBScript:` hrefs.** Expected: neutralized to `#`, clicking runs nothing. → Task 7.
- **A `qsp-on:` event not in `supportedEvents` is silently dropped** (`wheel` is listed but has no `eventsMap` entry — latent bug). Documented as out-of-scope note in Task 3; not fixed here.
- **Desktop vs web parity for in-content link clicks and hover** (`mouseenter`/`mouseleave` semantics differ by driver). Every 2c scenario runs on both targets; hover uses a cross-driver `Hover` support interaction. → Tasks 2, 3.

---

## File Structure

- Fixture game: `apps/player-e2e/fixtures/game-html/{game-html.qsps,game.cfg}` (+ `view.png` reuse if needed for `<area>`/`<img>`).
- Fixture constants: `apps/player-e2e/fixtures/game-html-game.ts` (frozen, no framework imports).
- Registry: `apps/player-e2e/fixtures/archives.ts` (`SOURCES.gameHtml`, `ARCHIVES.gameHtml`), `apps/player-e2e/fixtures/build-fixtures.ts` (one `write(...)` line), `apps/player-e2e/fixtures/build-fixtures.spec.ts` (magic-byte assertion).
- Screenplay: new area `apps/player-e2e/screenplay/content/` (`elements.ts`/`tasks.ts`/`checks.ts`); extend `screenplay/game/` only if a check already belongs there. Hover support: `apps/player-e2e/screenplay/support/hover.ts`.
- Scenarios: `apps/player-e2e/scenarios/game-html.scenario.ts` (may split into `game-html-links`, `-watchers`, `-hardening` if one file would exceed 150 lines).
- Production fixes (libs): `libs/game-state/src/attributes.ts` (Fix A), `libs/renderer/src/content/attributes.ts` (Fix B, Fix D), `libs/renderer/src/theme-core/html/form.tsx` (Fix B reconcile), `libs/game-state/src/hooks/qsp-bind.ts` (Fix C), `libs/renderer/src/transformers/base/default-transformers.tsx` (Fix E), `libs/renderer/src/theme-core/qspider/qsp-style.tsx` (marker M).

---

## Task 1: The `game-html` fixture game

**Files:**

- Create: `apps/player-e2e/fixtures/game-html/game-html.qsps`, `apps/player-e2e/fixtures/game-html/game.cfg`
- Create: `apps/player-e2e/fixtures/game-html-game.ts`
- Modify: `apps/player-e2e/fixtures/archives.ts`, `apps/player-e2e/fixtures/build-fixtures.ts`
- Test: `apps/player-e2e/fixtures/build-fixtures.spec.ts`

**Interfaces — Produces** (the marker/outcome contract every later task consumes; author exactly these):

Each feature lives at a location reached by an action from `# start` (`gt`), or is on `start` itself. Elements that must be located carry `data-qa`. Each observable outcome is `*clr & *pl 'MARKER'` in the main panel (asserted via `[data-qsp="main-content"]`).

| Feature                  | Location/action                                                                                                                                                                              | Element `data-qa`                         | Outcome marker                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------- |
| start                    | `# start`, `*pl 'GAME HTML START'`                                                                                                                                                           | —                                         | `GAME HTML START`                                    |
| markup renders           | action `markup` → loc with `<b data-qa="mk-bold">MARKUP BOLD</b>`                                                                                                                            | `mk-bold`                                 | element text `MARKUP BOLD`                           |
| exec link                | action `links` → loc; `<a href="exec:gt ''exec_done''" data-qa="exec-link">`                                                                                                                 | `exec-link`                               | `EXEC LINK RESULT`                                   |
| numeric link             | same loc; first action runs `*clr & *pl 'NUM LINK RESULT'`; `<a href="1" data-qa="num-link">`                                                                                                | `num-link`                                | `NUM LINK RESULT`                                    |
| `<area>` exec            | same loc; `<img src="view.png" usemap="#m"><map name="m"><area shape="rect" coords="0,0,20,20" href="exec:gt ''area_done''" data-qa="area-link"></map>`                                      | `area-link`                               | `AREA LINK RESULT`                                   |
| `qsp-on:click`           | action `events` → loc; `<span qsp-on:click="exec:gt ''click_done''" data-qa="on-click">`                                                                                                     | `on-click`                                | `ON CLICK RESULT`                                    |
| `qsp-on:mouseenter`      | same loc; `data-qa="on-enter"` → `enter_done`                                                                                                                                                | `on-enter`                                | `ON ENTER RESULT`                                    |
| `qsp-on:mouseleave`      | same loc; `data-qa="on-leave"` → `leave_done`                                                                                                                                                | `on-leave`                                | `ON LEAVE RESULT`                                    |
| `<form qsp-on:submit>`   | action `form` → loc; `<form qsp-on:submit="exec:gt ''form_done''" data-qa="the-form"><input type="text" data-qa="form-field"><button type="submit" data-qa="form-submit">GO</button></form>` | `the-form`, `form-field`, `form-submit`   | `FORM SUBMIT RESULT`                                 |
| `qsp-bind` (string)      | action `bind` → loc; `$boundstr=''`; `<input type="text" qsp-bind="$boundstr" data-qa="bind-field">`; action `show bind` → `*clr & *pl 'BOUND=<<$boundstr>>'`                                | `bind-field`                              | `BOUND=<value>`                                      |
| `qsp-variable`           | action `watchers` → loc; `$wvar='VAR ONE'`; `<qsp-variable name="$wvar"></qsp-variable>`; action `change var` sets `$wvar='VAR TWO'`                                                         | `[data-qsp="variable"]` (renderer marker) | element text `VAR ONE` → `VAR TWO`                   |
| `qsp-show`               | same loc; `<qsp-show when="$wvar='VAR TWO'"><span data-qa="show-child">SHOWN</span></qsp-show>`                                                                                              | `show-child`                              | absent → present after `change var`                  |
| `qsp-style`              | same loc; `$wcss='.e2e{color:red}'`; `<qsp-style from="$wcss"></qsp-style>`; action `change style` sets `$wcss='.e2e{color:blue}'`                                                           | `[data-qsp="style"]` (added in Task 6)    | element text `.e2e{color:red}` → `.e2e{color:blue}`  |
| `qsp-region`             | same loc; `<qsp-region name="reg"></qsp-region>`; an action fills region `reg` with `REGION TEXT` (per QSP region API)                                                                       | `[data-qsp="region"]`                     | element text contains `REGION TEXT`                  |
| `qsp-layer`              | same loc; `<qsp-layer name="lay"></qsp-layer>`; an action fills layer `lay` with `LAYER TEXT`                                                                                                | `[data-qsp="layer"]`                      | element text contains `LAYER TEXT`                   |
| svg `<script>`           | action `hostile svg` → loc; `<svg><script>document.querySelector('[data-qsp="main-content"]').append('PWNED')</script></svg>`; then `*pl 'SVG BENIGN'`                                       | —                                         | main-content text exactly `SVG BENIGN`               |
| `<iframe>`               | action `hostile iframe` → loc; `<iframe data-qa="hostile-frame" srcdoc="<script>parent.document.body.setAttribute('data-qa-pwned','1')</script>"></iframe>`; `*pl 'IFRAME BENIGN'`           | `hostile-frame`                           | main-content `IFRAME BENIGN`; no `[data-qa-pwned]`   |
| mixed-case `javascript:` | action `hostile js` → loc; `<a href="JavaScript:document.querySelector('[data-qsp=&quot;main-content&quot;]').append('PWNED')" data-qa="js-link">JS LINK</a>`; `*pl 'JS BENIGN'`             | `js-link`                                 | after click, main-content exactly `JS BENIGN`        |
| malformed markup         | action `hostile malformed` → loc; text `<b><i>MALFORMED OK` (unclosed)                                                                                                                       | —                                         | main-content contains `MALFORMED OK`, no error alert |

Notes for the author: QSP single-quote strings escape `'` by doubling it (`''`), which is why exec payloads read `exec:gt ''exec_done''`. `qsp-on:*` values **must** start with `exec:` (the renderer strips the first 5 chars as the prefix). Keep each location's text to exactly the element(s) under test plus its benign marker so `SeeMainText` (trimmed exact match) is unambiguous. Verify the QSP region/layer fill API against `@qsp/wasm-engine` behaviour; if a surface genuinely cannot be driven from `.qsps`, record a ledger ruling and narrow that one assertion rather than block.

- [ ] **Step 1: Author `game-html.qsps` + `game.cfg`** covering every row above. `game.cfg` TOML: one `[[game]]` with `id`, `title='Game HTML'`, `file='game-html.qsp'` (or `.qsps` per existing fixture convention — mirror `fixtures/dialogs/game.cfg`).
- [ ] **Step 2: Create `game-html-game.ts`** — frozen `GAME_HTML` object with `path` (resolved `../artifacts/fixtures/game-html.zip`), `title`, `actions` (the action labels), `marks` (the `data-qa` names), `text` (every outcome marker, incl. `inject: 'PWNED'`). No framework imports.
- [ ] **Step 3: Register** `SOURCES.gameHtml` + `ARCHIVES.gameHtml` in `archives.ts`; add `write(ARCHIVES.gameHtml.path, zipPack(join(SOURCES.gameHtml,'game.cfg'), ['view.png']))` to `buildFixtures()` (include `view.png` for the `<area>`/`<img>`; reuse the dialogs `view.png`).
- [ ] **Step 4: Extend `build-fixtures.spec.ts`** — assert `game-html.zip` begins with ZIP magic `50 4b`.
- [ ] **Step 5: Build fixtures + run the spec.** Run: `nx run player-e2e:test`. Expected: PASS (magic bytes).
- [ ] **Step 6: Commit** — `test(e2e): game-html fixture for batch 2c`.

---

## Task 2: In-content links & markup-in-panel scenarios

**Files:**

- Create: `apps/player-e2e/screenplay/content/elements.ts`, `apps/player-e2e/screenplay/content/tasks.ts`, `apps/player-e2e/screenplay/content/checks.ts`
- Create/Modify: `apps/player-e2e/scenarios/game-html.scenario.ts`

**Interfaces — Consumes:** `GAME_HTML` (Task 1); `OpenGameFile`/`StartPlayer` (`support/operate-player`), `SeeGameStarted`/`SeeStartupFinished` (`common/checks`), `SeeMainText` (`game/checks`), `ClickAction` (`game/tasks`), `support/presence`, `support/see-eventually`, `support/visible`.
**Produces:** `content/elements.ts` locators `ExecLink`/`NumLink`/`AreaLink`/`MarkupBold` (By.css `[data-qa=…]`, wrapped in `visible(...)`); `content/tasks.ts` `ClickContent(element)` = `ClickWhenPresent(element)`; `content/checks.ts` `SeeContentText(mark,text)` = `seeEventually([data-qa=mark] → trimmed Text → equals)`.

- [ ] **Step 1: Write the failing scenarios** in `game-html.scenario.ts`: (a) markup renders — open, `ClickAction(markup)`, `SeeContentText('mk-bold','MARKUP BOLD')`; (b) exec link — `ClickAction(links)`, `ClickContent(ExecLink)`, `SeeMainText('EXEC LINK RESULT')`; (c) numeric link → `NUM LINK RESULT`; (d) area exec → `AREA LINK RESULT`.
- [ ] **Step 2: Run web, expect the new scenarios to fail** only for a real reason (missing area/elements), not green-by-accident. Run: `CHROME_BIN=/usr/bin/chromium nx run player-e2e:e2e-web`.
- [ ] **Step 3: Implement** `content/` area files (locators/tasks/checks ≤150 lines, allowed selectors only).
- [ ] **Step 4: Run web green.** Run: `CHROME_BIN=/usr/bin/chromium nx run player-e2e:e2e-web`. Expected: PASS.
- [ ] **Step 5: Lint.** Run: `nx run player-e2e:lint` + `nx run player-e2e:typecheck`. Expected: PASS.
- [ ] **Step 6: Commit** — `test(e2e): in-content links and markup rendering (2c)`.

---

## Task 3: `qsp-on` event scenarios + Hover support

**Files:**

- Create: `apps/player-e2e/screenplay/support/hover.ts`
- Modify: `apps/player-e2e/screenplay/content/elements.ts` (add `OnClick`/`OnEnter`/`OnLeave`), `apps/player-e2e/scenarios/game-html.scenario.ts`

**Interfaces — Produces:** `Hover(element)` support interaction (Serenity `Hover.over`, cross-driver); `MoveAway()` (hover a neutral element to trigger `mouseleave`).

- [ ] **Step 1: Write failing scenarios:** click → `ON CLICK RESULT`; mouseenter via `Hover(OnEnter)` → `ON ENTER RESULT`; mouseleave via `Hover(OnLeave)` then `MoveAway()` → `ON LEAVE RESULT`.
- [ ] **Step 2: Run web, confirm they fail** for lack of the `Hover` interaction.
- [ ] **Step 3: Implement** `support/hover.ts`; wire the three scenarios. Add a one-line code comment noting `qsp-on:wheel` is listed in `supportedEvents` but unmapped (latent bug, out of 2c scope).
- [ ] **Step 4: Run web green.** Run: `CHROME_BIN=/usr/bin/chromium nx run player-e2e:e2e-web`.
- [ ] **Step 5: Lint + typecheck.** Expected: PASS.
- [ ] **Step 6: Commit** — `test(e2e): qsp-on click/mouseenter/mouseleave (2c)`.

---

## Task 4: Fix `<form qsp-on:submit>` + scenario (⚠ visible behaviour)

**Files:**

- Modify: `libs/renderer/src/content/attributes.ts` (Fix B), `libs/renderer/src/theme-core/html/form.tsx` (reconcile)
- Modify: `apps/player-e2e/scenarios/game-html.scenario.ts`, `apps/player-e2e/screenplay/content/elements.ts`

**Interfaces — Consumes:** fixture `the-form`/`form-field`/`form-submit`. **Produces:** `SubmitForm()` task (`ClickWhenPresent(FormSubmit)`).

Root cause (verified): `submit` is absent from `supportedEvents` (`attributes.ts:79`), so `qsp-on:submit` is dropped and `HtmlForm`'s `attributes['qspOn:submit']` is always `undefined`. Fix: add `'submit'` to `supportedEvents` and `submit: 'onSubmit'` to `eventsMap` so the generic path wires `onSubmit` = `preventDefault()` + `execCode(code)`; then reconcile `form.tsx` so the handler fires exactly once (spread the converted attrs onto `<form>` and drop the now-dead bespoke `qspOn:submit` branch, or keep `form.tsx` as the sole owner reading the now-preserved value — implementer's call, pinned by the test). This changes player-visible behaviour (forms become submittable) — flag in the PR.

- [ ] **Step 1: Write the failing scenario:** `ClickAction(form)`, `TypeInto('hello', FormField)`, `SubmitForm()`, `SeeMainText('FORM SUBMIT RESULT')`.
- [ ] **Step 2: Run web, expect FAIL** (submit dead today).
- [ ] **Step 3: Implement Fix B** + reconcile `form.tsx`.
- [ ] **Step 4: Run web green.** Run: `CHROME_BIN=/usr/bin/chromium nx run player-e2e:e2e-web`.
- [ ] **Step 5:** `nx run player-e2e:lint` + unit tests of affected libs (`nx run renderer:test` if present). Expected: PASS.
- [ ] **Step 6: Commit** — `fix(renderer): wire <form qsp-on:submit> so submit runs code`.

---

## Task 5: Escape `qsp-bind` input + binding scenarios (⚠ visible behaviour)

**Files:**

- Modify: `libs/game-state/src/hooks/qsp-bind.ts` (Fix C)
- Modify: `apps/player-e2e/scenarios/game-html.scenario.ts`, `apps/player-e2e/screenplay/content/elements.ts`

Root cause (verified `qsp-bind.ts:20`): a string value is interpolated as `` `"${newValue}"` `` with no escaping, so a `"` in the input breaks or injects into the generated QSP (`$x = "a"b"`). Fix: escape per QSP string rules (double the quote delimiter) before interpolating; keep numeric handling. Behaviour change (input with quotes now stored literally) — flag in PR.

- [ ] **Step 1: Write failing scenarios:** (a) plain binding — `ClickAction(bind)`, `TypeInto('hello', BindField)`, `ClickAction(showBind)`, `SeeMainText('BOUND=hello')`; (b) injection — `TypeInto('a"b', BindField)`, `ClickAction(showBind)`, `SeeMainText('BOUND=a"b')`.
- [ ] **Step 2: Run web, expect (b) to FAIL** (quote breaks the generated code) and ideally (a) to pass.
- [ ] **Step 3: Implement Fix C.**
- [ ] **Step 4: Run web green** (both). Run: `CHROME_BIN=/usr/bin/chromium nx run player-e2e:e2e-web`.
- [ ] **Step 5:** `nx run player-e2e:lint`; `nx run game-state:test` (add/adjust a unit test for the escaper if that lib has unit tests). Expected: PASS.
- [ ] **Step 6: Commit** — `fix(game-state): escape qsp-bind input before writing into QSP`.

---

## Task 6: Variable-watcher scenarios + `qsp-style` marker

**Files:**

- Modify: `libs/renderer/src/theme-core/qspider/qsp-style.tsx` (marker M: add `data-qsp="style"` alongside the existing `data-qsp-from`)
- Modify: `apps/player-e2e/screenplay/content/elements.ts` (`QspVariable`/`QspStyle`/`QspRegion`/`QspLayer`/`ShowChild`), `apps/player-e2e/scenarios/game-html.scenario.ts` (likely split to `game-html-watchers.scenario.ts` to stay ≤150 lines)

**Interfaces — Consumes:** fixture `watchers` location + `change var`/`change style`/region/layer fill actions; existing renderer markers `data-qsp="variable"|"region"|"layer"`. **Produces:** nothing beyond scenarios.

- [ ] **Step 1: Write failing scenarios:** variable reactivity (`VAR ONE` → `change var` → `VAR TWO` on `[data-qsp="variable"]`); `qsp-show` child absent then present after `change var`; `qsp-style` text `.e2e{color:red}` → `change style` → `.e2e{color:blue}` on `[data-qsp="style"]`; region shows `REGION TEXT`; layer shows `LAYER TEXT`.
- [ ] **Step 2: Run web, expect the `qsp-style` assertion to fail** (no `data-qsp="style"` marker yet); others may already pass.
- [ ] **Step 3: Add marker M** to `qsp-style.tsx`; implement the scenarios.
- [ ] **Step 4: Run web green.** Run: `CHROME_BIN=/usr/bin/chromium nx run player-e2e:e2e-web`.
- [ ] **Step 5:** `nx run player-e2e:lint` + `nx run player-e2e:typecheck`. Expected: PASS.
- [ ] **Step 6: Commit** — `test(e2e): variable watchers; mark qsp-style for location (2c)`.

---

## Task 7: Targeted game-HTML hardening + negative scenarios (⚠ visible behaviour)

**Files:**

- Modify: `libs/game-state/src/attributes.ts` (Fix A), `libs/renderer/src/content/attributes.ts` (Fix D), `libs/renderer/src/transformers/base/default-transformers.tsx` (Fix E)
- Modify: `apps/player-e2e/scenarios/game-html-hardening.scenario.ts` (new), `apps/player-e2e/screenplay/content/elements.ts`

Fixes (targeted — do **not** enable the full tag allow-list; do not restrict tags honest games use):

- **Fix A** (`game-state/src/attributes.ts:65`): make the `href` scheme guard case-insensitive and whitespace-tolerant — reject `javascript:`/`vbscript:`/`livescript:`/`data:` text evaluated after `trim().toLowerCase()`, returning `'#'`.
- **Fix D** (`content/attributes.ts:136`): drop `allow-same-origin` from the iframe sandbox (keep `sandbox="allow-scripts"`), so sandboxed content can't reach the host origin / Tauri IPC.
- **Fix E** (`default-transformers.tsx` `defaultTransform`): return `null` for a `<script>` node (any case), which drops top-level and `<svg>`-nested scripts from the render tree. No other tags touched.

Observability: each hostile location injects a script/handler that, if it ran, would `append('PWNED')` to `[data-qsp="main-content"]` (or set a parent attribute). Render is synchronous, so by the time the benign marker is present any live script has already run — an exact-text assertion pins non-execution.

- [ ] **Step 1: Write the failing negative scenarios:** (a) svg `<script>` — `ClickAction(hostile svg)`, `SeeMainText('SVG BENIGN')`; (b) iframe — `ClickAction(hostile iframe)`, `SeeMainText('IFRAME BENIGN')` + assert `[data-qa-pwned]` absent (`waitUntilAbsent`); (c) mixed-case `javascript:` — `ClickAction(hostile js)`, `ClickContent(JsLink)`, `SeeMainText('JS BENIGN')`; (d) malformed — `ClickAction(hostile malformed)`, `SeeMainText` contains `MALFORMED OK` and `SeeNoErrorShown`.
- [ ] **Step 2: Run web, expect (a)(b)(c) to FAIL** (vectors execute today), (d) to pass.
- [ ] **Step 3: Implement Fixes A, D, E.**
- [ ] **Step 4: Run web green.** Run: `CHROME_BIN=/usr/bin/chromium nx run player-e2e:e2e-web`.
- [ ] **Step 5:** `nx run player-e2e:lint`; lib unit tests for the affected libs. Expected: PASS.
- [ ] **Step 6: Commit** — `fix(renderer,game-state): neutralize inline script/iframe/javascript: injection (2c)`.

---

## Final verification (after Task 7)

- [ ] Run `pnpm check` (fast subset) green.
- [ ] Run `pnpm check:full` (adds desktop E2E) green — a `specFileRetries` retry on desktop is acceptable (intrinsic relaunch flake, #167), a genuine failure is not.
- [ ] PR body flags the four ⚠ player-visible changes (form submit now works; qsp-bind escapes input; `javascript:`/iframe/script neutralized) and notes the `qsp-on:wheel` latent bug left out of scope.

---

## Self-Review

**Spec coverage:** every 2c inventory bullet maps to a task — markup/exec/numeric/area (T2), qsp-on (T3), form submit ⚠ (T4), qsp-bind ⚠ (T5), qsp-variable/show/style/region/layer (T6), hardening ⚠ (T7). The design doc's two named 2c ⚠ fixes (`<form qsp-on:submit>`, `qsp-bind` escaped) are T4/T5; the maintainer-approved targeted-neutralization scope is T7.

**Step scan:** each step yields one checkable action (author/write test → run red → implement → run green → lint → commit). No "handle edge cases" placeholders.

**Type/name consistency:** `content/` area locators and the `GAME_HTML` marker/outcome names are defined once in Task 1's interface table and consumed verbatim by Tasks 2–7. `data-qa` marks are game-authored (verified pass-through at `content/attributes.ts:104-128`); `[data-qsp="variable"]` and `[data-qsp="style"]` are added renderer markers (Task 6, `qsp-variable.tsx` / `qsp-style`) and only `[data-qsp="region"|"layer"|"main-content"]` are pre-existing.

**Review Focus:** each of the five lines has an owning task (quote-in-bind → T5; malformed → T7; mixed-case scheme → T7; wheel note → T3; both-target/hover parity → T2/T3).

**Proportion:** the plan is shorter than the touch-point surface it covers; step bodies carry names/assertions/commands, not full code, and the fixture QSP is left to the implementer against the explicit marker/outcome contract.
