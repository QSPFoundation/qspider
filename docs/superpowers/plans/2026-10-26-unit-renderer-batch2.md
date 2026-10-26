# Unit tests for pure functions, batch 2 (html-renderer + renderer) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every live pure function in `libs/html-renderer` and `libs/renderer` has a unit test that runs in Vitest browser mode (Chromium) without mocks. `libs/desktop` `e2e-marks.spec.ts`, the last mock spec, is rewritten. Three changes the maintainer decided on 2026-10-26 also land here: removing the unreachable HtmlParser sanitiser, fixing `<font face>`, and dropping risky tags from game text.

**Architecture:** Browser mode comes in through one shared helper (`vitest.browser.mts` at the repo root). It returns the Playwright Chromium provider and honours `CHROME_BIN` locally, as the web E2E config does. `html-renderer` and `renderer` run all their specs in the browser. `desktop` gets two Vitest projects: `node` for `*.spec.ts` and `browser` for `*.browser.spec.ts`. Pure logic that sits inside components, hooks or files that import `@qspider/game-state` (heavy, with load-time side effects) moves into small files that import only types (`import type`) and `@qspider/utils`. The components then call those files.

**Tech Stack:** Vitest 5.0.5 browser mode (Playwright provider), React 19.3 (`react-dom/server` `renderToStaticMarkup` as the observation tool for parser output), NX 23 `@nx/vitest`, TypeScript.

**Spec:** `docs/superpowers/specs/2026-10-25-unit-tests-phase4-design.md`. The maintainer's 2026-10-26 decisions are recorded under "Decided" below.

## Decided by the maintainer (2026-10-26)

1. **HtmlParser's sanitiser branch is dead code, so remove it.** The only parser is `templateParser` (`libs/renderer/src/render-state.ts:36`). It has a `transform` that never returns `undefined`. So the ban/allow lists, `canRenderChild`, `getTagConfig`, `HtmlParser.extractAttributes`, `isSafe` and `extractStyleAttribute` never run. Remove them and test only the live path.
2. **Fix `<font face>`.** `attributesToStyle` maps `face` to `fontFace`, which isn't a CSS property. Map it to `fontFamily`, with a red test first.
3. **`defaultTransform` drops** `base`, `meta`, `embed`, `object`, `applet`, `frame`, `frameset` and `command`, the same way it already drops `script`. `style`, `link` and `title` stay, because games style themselves. This is player-visible, so it gets a red E2E first.

## Global Constraints

- **No `vi.mock`, `vi.fn`, `vi.spyOn` or `vi.stubGlobal`.** Fake timers are the only double allowed. A plain callback written in the test (for example a parser `transform`) is an input, not a double.
- **Unit tests cover pure logic only.** Rendering, engine and DOM-in-the-player behaviour stay E2E.
- **Refactors are pure moves or extractions** in their own `refactor(<project>): …` commit, before the `test(<project>): …` commit. No player-visible change. Decision 1 is a deletion of unreachable code and also goes in a `refactor` commit.
- **Tests describe behaviour.** Use real QSP-style HTML and exact expected values, with no snapshots. Name each `it` as a behaviour sentence.
- **Defect rule:** if output looks wrong for input a real game could produce, write a red `test(...)` commit, then stop that function and report DONE_WITH_CONCERNS. The controller asks the maintainer. Only crashes on impossible input, dead code and internal-only fixes go ahead in a `fix(...)` commit. Two known open questions are listed under Review Focus (`qsp-on:wheel` and `$` patterns). Their red tests are expected.
- **Data tables are not tested** (`TAGS_MAP`, `fontSizeMap`, `AERO_EFFECTS`, `deviceChecks`, the dropped-tag list). The functions that read them are.
- **NX only:** `pnpm nx test <project>`, `pnpm nx typecheck <project>`, `pnpm nx lint <project>`, `pnpm format:check`. Never call vitest directly.
- **Spec files are typechecked:** each touched project gets `tsconfig.spec.json`, and its `typecheck` runs both tsconfigs, as `libs/utils/project.json` does.
- **Git:** branch `test/unit-renderer-batch2` off `test/e2e-gaps-batch1` (#186, which moved the toasts into renderer). Rebase onto `main` once #186 merges. Stage only the task's files and never bypass hooks. Don't push until Task 7. Don't run desktop E2E or `check:full`. Never touch `public/game/`.
- **Local Chromium:** `CHROME_BIN=/usr/bin/chromium`. CI uses Playwright's own (`pnpm exec playwright install --with-deps chromium`).

## Review Focus

1. **Text that mixes raw newlines with `<br>` or other void-only markup** (`'a<br>\nb'`, `'<img src="x.png">\nnext'`). `convertLineBreaks` only skips conversion when it sees a closing tag or `/>`, so these get extra `<br/>`s. Task 1 pins the current output only for the cases it lists. Any other case that looks wrong falls under the defect rule.
2. **A list item name containing `$&`, `$$` or `$1`** (`'Price: $$5'`). `String.replace` with a string pattern expands these. `fillFormat` must insert the name verbatim. This is pinned red in Task 3 and is an open question for the maintainer.
3. **`qsp-on:wheel`**, which is in `supportedEvents` but missing from `eventsMap`. Today it becomes a prop named `undefined` and does nothing. `convertAttributes` must map it to `onWheel`. This is pinned red in Task 2 and is an open question for the maintainer.
4. **A dock with `visibility=""`** written by a theme author. `QspCLLayer` (`?? true`, so `''` means hidden) and `QspCLDock` (`!visibility` means shown) disagree today. Both must use one `isDockVisible`. Pinned in Task 4. Whichever reading wins is player-visible, so the defect rule applies.
5. **A numeric `qsp-bind` input given non-numeric text** (`abc`). `bindAssignment` emits `x = abc`, which runs as QSP code. Task 3 pins the current output for `''` → `x = 0` only. For `abc`, write the red test the rule asks for, then report.

---

### Task 1: Browser mode, the html-renderer dead-code removal and HtmlParser tests

**Files:**

- Create: `vitest.browser.mts` (repo root), `libs/html-renderer/vite.config.mts`, `libs/html-renderer/tsconfig.spec.json`, `libs/html-renderer/src/lib/html-parser.spec.ts`
- Modify: `libs/html-renderer/project.json` (typecheck runs both tsconfigs), `libs/html-renderer/src/lib/html-parser.ts`, `html-renderer.types.ts`, `src/index.ts`, `libs/renderer/src/template-transformers.tsx` (two-argument transform), `.github/workflows/checks.yml` (job `frame`), `package.json` and `pnpm-lock.yaml` (browser-mode packages)
- Delete: `libs/html-renderer/src/lib/constants.ts`, `libs/html-renderer/src/lib/Element.tsx`

**Interfaces:**

- Produces: `browserTest(name: string): UserConfig['test']` from `vitest.browser.mts`. It returns `{ name, include: ['src/**/*.spec.{ts,tsx}'], browser: { enabled: true, headless: true, provider: playwright({ launchOptions: { executablePath: process.env.CHROME_BIN } }), instances: [{ browser: 'chromium' }] } }`. Use the provider package and import that match `vitest@5.0.5`, at the exact version `5.0.5`. Allow the `include` to be overridden.
- Produces: `new HtmlParser({ transform })`. `ParserProps = { transform: TransformCallback }` (required). `TransformCallback = (node: HTMLElement, children: RenderNode[]) => RenderNode`. `parse(markup: string, convertLineBreaks = true): RenderNode[]`. `convertLineBreaks(markup: string): string` stays a method. `RenderNode`, `MarkupProps` and `Markup` are still exported. `NodeConfig`, `ConfigMap`, `FilterMap`, `Attributes`, `AttributeValue`, `ElementProps` and `Element` are removed.

- [ ] **Step 1: Add browser-mode packages and the shared helper.** Add the provider package (and `playwright` if it's a peer) at versions matching `vitest@5.0.5`. Write `vitest.browser.mts`, then write `libs/html-renderer/vite.config.mts` from the `libs/utils` one with `test: browserTest('html-renderer')`. Add `tsconfig.spec.json` like `libs/utils`, with `"types": ["vitest/browser"]` if the provider needs them. Update the `typecheck` commands.

- [ ] **Step 2: Write `html-parser.spec.ts` against the current code.** The test transform is `(node, children) => createElement(node.tagName.toLowerCase(), null, ...children)`. Observe through `renderToStaticMarkup(createElement(Fragment, null, ...nodes))`. Cases:
  - `parse('')` → `[]`
  - `'a\nb'` → `a<br/>b`; `'a\r\nb'` → `a<br/>b`; `'a\n\n\n\n\nb'` → `a<br/><br/><br/>b`
  - `parse('a\nb', false)` → `a\nb` (one text node)
  - `'<b>x</b>\ny'` → `<b>x</b>\ny` (closing tag present, so no conversion); `'x<br/>\ny'` → `x<br/>\ny`
  - `'&lt;b&gt; &amp;'` → returns the single string `'<b> &'`
  - `'a<!-- c -->b'` → returns the single string `'ab'` (comments skipped, text merged)
  - `'<b><i>MALFORMED OK'` → `<b><i>MALFORMED OK</i></b>`
  - a transform that returns `null` for `span`: `'a<span>gone</span>b'` → `'ab'`, i.e. the element and its children are dropped and the text merges
  - keys: `parse('<i>1</i>t<i>2</i>')` → the elements' `key`s are `'1'` and `'2'`, and the string sits between them

- [ ] **Step 3: Run it and check it passes on the current code.** Run: `CHROME_BIN=/usr/bin/chromium pnpm nx test html-renderer`. Expected: PASS, with Chromium launched (the log names the browser project). A case that fails here is a finding, so apply the defect rule.

- [ ] **Step 4: Remove the dead branch (decision 1).** In `parseNode`, call `transform` for every element, skip on `null`, otherwise push the clone with `key`. Remove `getTagConfig`, `canRenderChild`, `extractAttributes`, `extractStyleAttribute`, `isSafe`, `isTagAllowed`, the `allowed`/`banned`/`blocked` fields, `constants.ts` and `Element.tsx`, along with their types. Update `libs/renderer/src/template-transformers.tsx` to `(node, children)`.

- [ ] **Step 5: Verify.** Run `pnpm nx test html-renderer` (same results as Step 3), then `pnpm nx run-many -t typecheck lint -p html-renderer renderer game-shelf`. Expected: all pass.

- [ ] **Step 6: CI Chromium.** In `.github/workflows/checks.yml` job `frame`, add `- run: pnpm exec playwright install --with-deps chromium` between `pnpm install` and `pnpm nx run-many -t lint typecheck test build`.

- [ ] **Step 7: Commit in two parts.** `test(html-renderer): HtmlParser parse, line breaks, text merge and keys in browser mode` (helper, config, packages, CI, spec); `refactor(html-renderer): drop the sanitiser branch no transform-backed parser reaches` (Step 4).

---

### Task 2: renderer attribute conversion, save context and font face

**Files:**

- Create: `libs/renderer/vite.config.mts`, `libs/renderer/tsconfig.spec.json`, `libs/renderer/src/content/convert-attributes.ts` (+ `.spec.ts`), `libs/renderer/src/content/save-context.ts` (+ `.spec.ts`), `libs/renderer/src/content/font-sizes.ts`
- Modify: `libs/renderer/project.json`, `libs/renderer/src/content/attributes.ts`, `libs/renderer/src/transformers/classic/font.tsx`

**Interfaces:**

- Consumes: `browserTest` (Task 1).
- Produces:
  - `fontSizeMap` (moved verbatim) in `content/font-sizes.ts`.
  - `attributesToStyle(attributes: Attributes, tag: string): Record<string, string>` in `content/convert-attributes.ts`.
  - `convertAttributes(attributes: Attributes, tagName: string, dataName?: string): ConvertedAttributes`, where:
    ```ts
    interface ConvertedAttributes {
      tag: string;
      style: React.CSSProperties;
      props: Record<string, unknown>; // everything useAttributes returns except handlers, incl. data-qsp, data-qsp-command, data-qsp-save-command, sandbox
      events: { prop: keyof EventAttributes; code: string }[]; // from qsp-on:<event>, code with the 5-char "exec:" prefix cut
      command: { kind: 'game' | 'save'; value: string } | null;
    }
    ```
  - `getSaveContext(target: HTMLElement): SaveContext | null` in `content/save-context.ts`.
  - `useAttributes` keeps its signature and only wires the handlers from `events` and `command`. Use only `import type` from `@qspider/game-state` in the new files.

- [ ] **Step 1: Refactor.** Move the code into the new files. `useAttributes` and `font.tsx` now import from them. Commit `refactor(renderer): attribute conversion and save context leave the hook`.

- [ ] **Step 2: Write the specs.**
  - `attributesToStyle`:
    - `{ width: '100', height: '50%' }` → `{ width: '100px', height: '50%' }`
    - `{ size: '+1' }` → `{ fontSize: 'large' }`; `{ size: '3' }` → `{ fontSize: 'medium' }`
    - `{ bgcolor: 'red', valign: 'top', color: '#fff' }` → `{ backgroundColor: 'red', verticalAlign: 'top', color: '#fff' }`
    - `{ color: '' }` → `{}`
    - `img` with `align: 'AbsCenter'` → `verticalAlign: 'middle'`; `align` on `div` → `{}`
    - **`{ face: 'Arial' }` → `{ fontFamily: 'Arial' }` (red until Step 4)**
  - `convertAttributes`:
    - `class` → `className`; `colspan` → `colSpan`; `stroke-width` → `strokeWidth`; `aria-label`, `data-x` and `mask-type` are kept
    - `onclick` is dropped
    - `qsp-on:click="exec:gt 'x'"` → `events: [{ prop: 'onClick', code: "gt 'x'" }]`; `qsp-on:foo` → no event
    - **`qsp-on:wheel` → `{ prop: 'onWheel', … }` (red, Review Focus 3: report it)**
    - `dataName` `qsp-main` → `props['data-qsp'] === 'main'`
    - custom tag `qsp-x` keeps `class`, not `className`
    - `iframe` → `sandbox: 'allow-scripts'`, even when the game set `sandbox=""`
    - a `tag` attribute overrides the tag
    - `style: { color: 'red' }` plus `color: 'blue'` → the attribute style wins (`blue`)
    - `qsp-command` → `command: { kind: 'game', … }` and `props['data-qsp-command']`; `qsp-save-command` → `kind: 'save'`
  - `getSaveContext` (build a real DOM with `document.createElement`):
    - inside `[data-qsp-save][data-qsp-save-index="3"][data-qsp-save-path="p"]` → `{ slot_index: 3, save_path: 'p' }`
    - no index → `slot_index: -1`
    - outside any save root → `null`

- [ ] **Step 3: Run.** Run: `pnpm nx test renderer`. Expected: FAIL only on `face` and `wheel`. Commit the red specs: `test(renderer): attribute conversion and save context`.

- [ ] **Step 4: Fix face.** Map `face` to `fontFamily`. Commit `fix(renderer): <font face> sets font-family`. Run it again: only `wheel` stays red. Report it for the maintainer's decision.

---

### Task 3: renderer helpers in hooks, theme-core and render-state

**Files:**

- Create: `libs/renderer/src/hooks/qsp-bind-code.ts`, `libs/renderer/src/theme-core/css-variable-rules.ts`, `libs/renderer/src/theme-core/scroll-type.ts`, `libs/renderer/src/fill-format.ts`, `libs/renderer/src/pick-transformers.ts`, each with a `.spec.ts`
- Modify: `hooks/qsp-bind.ts`, `theme-core/css-variables.tsx`, `theme-core/scrollable.tsx`, `render-state.ts`, `template-transformers.tsx`

**Interfaces (all pure, `import type` only from game-state):**

- `toQspString(value: string): string` (moved); `boundInputValue(input: { type: string; checked: boolean; value: string }): string`; `bindAssignment(bind: string, bindKey: string, bindIndex: number, value: string): string`
- `cssVariableRules(definition: CssVarDefinition, value: string): string[]` (types `color`, `unit` and `null`; `[]` for `resource`); `resolveThemeUrl(url: string, baseUrl: string, initialBaseUrl: string): string`; `resourceVariableCss(name: string, url: string, size: { width: number; height: number } | null): string` (`null` means without `-w`/`-h`)
- `isScrollType(t: unknown): t is ScrollType` (moved, together with `ScrollType`)
- `fillFormat(format: string, values: Record<string, string>): string`. `render-state.ts` passes `{ [TEXT_PLACEHOLDER]: …, [IMAGE_PLACEHOLDER]: … }`, in that order.
- `pickTransformers<T>(mode: string, sets: { base: T; classic: T; aero: T }): T`. `qspider` and unknown modes give base; `classic` gives base+classic; `aero` gives base+classic+aero, with later sets winning.

- [ ] **Step 1: Refactor** (moves only). Commit `refactor(renderer): bind code, css variable rules, list format and transformer choice as pure functions`.

- [ ] **Step 2: Write the specs.**
  - `toQspString`:
    - `'a"b'` → `'"a""b"'`
    - `'<<x>>'` → `'"<" + "<x>>"'`
    - `'l1\nl2'` and `'l1\r\nl2'` → `'"l1" + chr(10) + "l2"'`
  - `boundInputValue`: an unchecked checkbox → `''`; a checked one → its `value`; text → `value`.
  - `bindAssignment`:
    - `('$name', '', 0, 'Bob')` → `'$name = "Bob"'`
    - `('arr', 'k', 0, '5')` → `'arr["k"] = 5'`
    - `('arr', '', 2, '5')` → `'arr[2] = 5'`
    - `('n', '', 0, '')` → `'n = 0'`
    - `('n', '', 0, 'abc')` → Review Focus 5: write the red test the defect rule asks for, then report.
  - `cssVariableRules`:
    - colour `0xff0000ff` with contrast and inverted → the four rules, with exact values from `@qspider/utils`
    - empty value → the default
    - no value and no default → `[]`
    - unit `'10'` with unit `px` → `['--x: 10px']`
    - type `null` with a value → `['--x: v']`
  - `resolveThemeUrl`:
    - `'qspider:img/a.png'` → initial base + path
    - `'https://x/y.png'` → unchanged
    - `'img/../b.png'` with base `'https://g/'` → `'https://g/b.png'`
  - `resourceVariableCss`:
    - `('--bg', '', null)` → `'qsp-game-root, #portal-container {--bg: none;}'`
    - with size `{ width: 2, height: 3 }` → it ends `--bg-w: 2px; --bg-h: 3px}`
  - `isScrollType`: `'both'`, `'horizontal'` and `'vertical'` → true; `'x'` and `1` → false.
  - `fillFormat`:
    - `('<b>%TEXT%</b>', { '%TEXT%': 'Go' })` → `'<b>Go</b>'`
    - a missing placeholder leaves the format unchanged
    - **`{ '%TEXT%': 'Price: $$5 $&' }` → the text inserted verbatim (red, Review Focus 2: report it)**
  - `pickTransformers` with `{ base: { a: 1, x: 1 }, classic: { b: 2, x: 2 }, aero: { c: 3, x: 3 } }`:
    - `aero` → `{ a: 1, b: 2, c: 3, x: 3 }`
    - `classic` → `x: 2`, no `c`
    - `'qspider'` and `'weird'` → base

- [ ] **Step 3: Run.** Run: `pnpm nx test renderer`. Expected: red only on the Review Focus cases. Commit `test(renderer): bind code, css variable rules, list format and transformer choice`, and report the red ones.

---

### Task 4: renderer classic-layout and legacy tag styles

**Files:**

- Create: `libs/renderer/src/transformers/classic/classic-layout-style.ts` (+ `.spec.ts`), `libs/renderer/src/transformers/classic/legacy-styles.ts` (+ `.spec.ts`)
- Modify: `classic-layout.tsx`, `hr.tsx`, `table.tsx`, `font.tsx`

**Interfaces:**

- `isDockVisible(visibility: string | null, isPanelVisible: (panel: string) => boolean): boolean`, used by both `QspCLLayer` and `QspCLDock`. `isPaneVisible(visibility: string | null, isPanelVisible): boolean` keeps the pane's single-name lookup.
- `layerGridStyle(docks: Partial<Record<DockPlace, { size: number }>>): { gridTemplateColumns: string; gridTemplateRows: string; gridTemplateAreas: string }`
- `classicDefaultRules(config: Pick<CfgData, 'BackColor' | 'FontColor' | 'LinkColor' | 'FontSize' | 'FontName'>): string[]`
- `hrStyle(width: string | null, size: string | null, noshade: boolean): React.CSSProperties`; `tableStyle(o: { border: number; cellspacing: number; cellpadding: number; align?: string; valign?: string }): React.CSSProperties`; `tableClassName(className?: string): string`; `fontSizeStyle(size: string | null): string`

- [ ] **Step 1: Refactor.** Write `isDockVisible` with the dock's current reading (`!visibility` means visible) and record the layer's `''` divergence in the commit body. Commit `refactor(renderer): classic layout and legacy tag styles as pure functions`.

- [ ] **Step 2: Write the specs.**
  - `layerGridStyle`:
    - `{}` → `1fr`, `1fr`, `'"center"'`
    - left 100 + right 50 → columns `'100px 1fr 50px'`, areas `'"left center right"'`
    - all four (top 20, bottom 30) → rows `'20px 1fr 30px'`, areas `'"top top top" "left center right" "bottom bottom bottom"'`
    - top only → areas `'"top" "center"'`
  - `isDockVisible`:
    - `null` → true
    - `'objs|acts'` when only `acts` is visible → true
    - `'nope'` → false
    - `''` → true. If you think the layer's reading is the right one, Review Focus 4 applies: report it.
  - `isPaneVisible`: `''` → true; `'objs'` follows the panel.
  - `classicDefaultRules`:
    - `{ BackColor: 0, … }` → no background rules
    - a real BackColor → its four rules
    - `FontSize: 12` → `'--cl-font-size: 12pt'`
    - `FontName` → `'--cl-font-name: X'`
  - `hrStyle`:
    - `(null, null, false)` → `borderWidth '1px 0 0 0'`, `inset`, `height '0px'`, `width '100%'`, transparent
    - `('50%', '3', true)` → `borderWidth '1px'`, `solid`, `height '3px'`, grey background
  - `tableStyle`: defaults `left`/`top` and `0px` vars; `border: 2` → `'--table-border-width': '2px'`.
  - `tableClassName`: `undefined` → `'classic-table'`; `'x'` → `'x classic-table'`.
  - `fontSizeStyle`: `null` → `'inherit'`; `'+2'` → `'x-large'`; `'9'` → `'medium'`.

- [ ] **Step 3: Run** `pnpm nx test renderer` (PASS apart from what's reported) and commit `test(renderer): classic layout and legacy tag styles`.

---

### Task 5: Risky tags dropped from game text (decision 3)

**Files:**

- Modify: `apps/player-e2e/fixtures/game-html/game-html.qsps` (new location `hostile_tags`, plus its action on the `hostile` menu), `apps/player-e2e/fixtures/game-html-game.ts` (action, marks and text constants), `apps/player-e2e/scenarios/game-html-hardening.scenario.ts`, `libs/renderer/src/transformers/default-transformers.tsx`

Follow `apps/player-e2e/README.md` Rules.

- [ ] **Step 1: Write the red E2E.** The location prints `<base data-qa="hostile-base" href="https://example.invalid/">`, `<meta data-qa="hostile-meta" http-equiv="refresh" content="600;url=about:blank">`, `<embed data-qa="hostile-embed" src="x.svg">`, `<object data-qa="hostile-object" data="x.svg"></object>`, then `'TAGS BENIGN'`. Add scenario `'tags that redirect or embed are dropped from game text'`. It opens the location, checks `SeeMainText(TEXT.tagsBenign)`, then checks each mark is absent from the whole document (React 19 hoists `meta` into `<head>`). Add a check alongside the existing presence helpers if needed.

- [ ] **Step 2: Run red.** Run: `CHROME_BIN=/usr/bin/chromium pnpm e2e:web -- -g "tags that redirect"`. Expected: FAIL, with the marks present. Commit `test(e2e): risky tags in game text`.

- [ ] **Step 3: Fix.** In `defaultTransform`, a module-level `Set` of `script`, `base`, `meta`, `embed`, `object`, `applet`, `frame`, `frameset` and `command` returns `null`. Update the comment next to it. Commit `fix(renderer): drop tags that redirect or embed from game text`.

- [ ] **Step 4: Verify** the scenario passes, then run the full `game-html-hardening` and `game-html` scenarios on web and standalone web: `pnpm e2e:web -- -g "game text|qsp-on"` and `pnpm e2e:standalone-web` (whole suite, since it's short). Expected: PASS. Desktop runs in CI.

---

### Task 6: desktop `e2e-marks` without mocks

**Files:**

- Create: `libs/desktop/src/lib/e2e-mark-steps.ts`, `libs/desktop/src/lib/e2e-mark-steps.browser.spec.ts`
- Modify: `libs/desktop/src/lib/e2e-marks.ts`, `libs/desktop/vite.config.mts` (two projects: `node` with `include src/**/*.spec.ts` and `exclude **/*.browser.spec.ts`; `browserTest('desktop-browser')` with `include src/**/*.browser.spec.ts`)
- Delete: `libs/desktop/src/lib/e2e-marks.spec.ts`

**Interfaces:**

- `plainText(html: string): string` (moved)
- `dueE2eMarks(stage: number, state: { startupFinished: boolean; gameId: string | null; mainHtml: string }): { stage: number; marks: [string, string][] }`. This returns every mark that is due in order: several in one call when the state allows. `startE2eMarks` keeps its signature and sends what `dueE2eMarks` returns.

- [ ] **Step 1: Refactor** and commit `refactor(desktop): e2e mark sequencing as a pure function`.

- [ ] **Step 2: Write the spec.** Replay the three old cases as state sequences fed through `dueE2eMarks`, carrying `stage` along:
  - the order `startup-finished`, `game-running g1`, `main-text 'E2E START'`, once each, with no repeats on later states
  - whitespace-only, `'<p>   </p>'` and `''` emit no `main-text`
  - nothing is sent before startup; then one call emits all three, with `'line one line two'` from `'<div>line one<br>\n  line two</div>'`
  - add: `plainText('<p>a</p>\r\n<p>b</p>')` → `'a b'`

  The old spec's mocked assertions are fully re-expressed. Real marker output stays covered by `pnpm smoke:desktop` in CI.

- [ ] **Step 3: Run** `pnpm nx test desktop` (both projects PASS, and the log shows `desktop` and `desktop-browser`). Commit `test(desktop): e2e mark sequencing without mocks`, including the deletion of the old spec.

---

### Task 7: Completeness review, local gate, PR

- [ ] **Step 1: Completeness.** List every function and inline logic block in `libs/html-renderer/src` and `libs/renderer/src`, and mark each one tested, skipped (with the reason) or not pure. Expected skips: components and hooks that only wire atoms; `createVariableAtom` and the key counters in `render-state.ts` (engine watchers); `game-runner` `handler`; `QspDevice` (table lookup inside `useMediaQuery`); the transformer callbacks (they render React, so E2E covers them); `AERO_EFFECTS`, `TAGS_MAP` and `fontSizeMap` (tables). Put the list in the PR body.
- [ ] **Step 2: Local gate.** Run `pnpm format:check`, then `pnpm nx run-many -t lint typecheck test -p html-renderer renderer desktop game-shelf`, then the Task 5 E2E. All must pass, and you report the output.
- [ ] **Step 3: PR.** Only after #186 has merged and the branch is rebased onto `main`, push and open a PR against `main`. The body covers the decisions, the completeness list, any defects still open for the maintainer, and the follow-up the HtmlParser removal leaves behind: nothing in the parser sanitises any more, and the sanitising points are `game-state` `extractAttributes`, `convertAttributes` and `defaultTransform`.
