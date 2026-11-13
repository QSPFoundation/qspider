# Watched Regions and Layers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `<qsp-region>` and `<qsp-layer>` read their game variables through the shared variable layer. The
pull model (`regions$`, `layers$`, the refresh commands, `onRestore`) is removed. The engine atoms move to a leaf
module, so the variable layer installs at import and ignores callbacks from retired engines.

**Architecture:** `QspRegion` and `QspLayer` call `useQspVariable` on `$qspider_region` and `#qspider_layers`,
keyed by the element's `name`. A new leaf module `qsp-engine.ts` owns `qspApi$`, `gameOpenEpoch$` and the
retired-engine set. `qsp-api.ts` re-exports them, so the public surface doesn't change.

**Tech Stack:** TypeScript, React 19, xoid, @qsp/wasm-engine 2.0.0, NX, Vitest, Serenity/JS E2E (Playwright web).

**Spec:** `docs/superpowers/specs/2026-11-13-watched-regions-layers-design.md`

## Global Constraints

- Engine behaviour is proved by E2E only. Unit tests cover pure functions only, with no mocks of the engine.
- E2E follows the Rules in `apps/player-e2e/README.md`: locate by `data-qsp`, role or `data-qa`; use
  `seeEventually`; use `OperatePlayer` tasks.
- Run tasks through nx (`pnpm nx test game-state`, `pnpm nx typecheck <project>`, `pnpm nx lint <project>`). Never call
  vitest directly.
- Web E2E for one spec: `pnpm nx build player`, then
  `CHROME_BIN=/usr/bin/chromium pnpm exec playwright test -c apps/player-e2e/targets/web/playwright.config.ts <name>.scenario`.
  Afterwards run `fuser -k 4300/tcp` (never `pkill -f "vite preview"`). After a failed run, delete
  `apps/player-e2e/artifacts/web-report` before linting.
- No desktop E2E locally.
- The leaf module `libs/game-state/src/qsp-engine.ts` imports nothing from game-state: only `xoid` and
  `type { QspAPI }`.
- The public exports of `@qspider/game-state` keep `qspApi$` and `gameOpenEpoch$`. `regions$`, `layers$`,
  `readRegion`, `reloadRegions`, `readLayerState`, `registerLayer`, `reloadLayers` and `onRestore` are removed.
- `regionsScroll$` and `scroll_region:` stay unchanged.
- The `qspider.qsps` procedure names and arguments stay unchanged. Only their `exec('qspider.update_…')` lines go.
- Conventional commits.

## Review Focus

1. `qspider_show_only_layer` runs `killvar 'qspider_layers'`, which must hide every other shown layer. Watchers
   on other keys re-read 0. Pinned in Task 1 (themed game, "Show only other").
2. A theme-level layer stays mounted while the game stops and a new engine starts, and it must follow the new
   engine. Pinned by the existing themes "restart hides a theme-layout layer" scenario, which must stay green in
   Task 3.
3. A region's text with markup must still go through `templateParser.parse`, not show raw. The existing region
   scenarios use plain text, so the reviewer checks the parse call in Task 3.
4. A layer shown before a restart must disappear after it, even though nothing sends `update_layers` any more.
   Pinned by the lifecycle "restart resets regions and layers" scenario, which must stay green in Task 3.
5. A region with the same name in the theme and in the main text must show the same value in both: one shared
   entry. This is covered by the layer's design and needs no new test.

---

### Task 1: E2E scenarios that pin the new behaviour (red on main)

**Files:**

- Modify: `apps/player-e2e/fixtures/game-html/game-html.qsps`: the `watchers` location's `fill region` and
  `fill layer` actions.
- Modify: `apps/player-e2e/fixtures/game-html-game.ts`: doc comments on `fillRegion` and `fillLayer`.
- Modify: `apps/player-e2e/fixtures/themed-game/themed-game.qsps`, `fixtures/themed-game/e2e-theme.html`,
  `fixtures/themes-game.ts`.
- Modify: `apps/player-e2e/scenarios/lifecycle.scenario.ts`, `apps/player-e2e/scenarios/themes.scenario.ts`.

**Interfaces:**

- Consumes the existing tasks `OpenPanelsFixture`, `ClickAction`, `PressQuickSave`, `PressQuickLoad`,
  `OpenSavesPanel`, `SeeQuickSaveFilled`, `CancelSavesPanel`, `ReturnToShelf`, `OpenFromShelf(title)`,
  `SeeElementText`, `waitUntilPresent`, `waitUntilAbsent`, and the elements `QspRegion` and `QspLayer`.
- Produces `THEMED_GAME.action.showOnlyOther = 'Show only other'`.

- [ ] **Step 1: Make the watchers actions assign directly.** In `game-html.qsps` `# watchers`, `fill region`
      becomes only `$qspider_region['reg'] = 'REGION TEXT'`, and `fill layer` becomes only `qspider_layers['lay'] = 1`.
      Delete the two `exec 'qspider.update_…'` lines. Update the comments in `game-html-game.ts` to say these
      are plain assignments with no command. The existing scenarios "qsp-region shows the text put into its
      region" and "qsp-layer is rendered only once shown" now prove direct assignment.
- [ ] **Step 2: Add a restore scenario** to `lifecycle.scenario.ts`, after "restart resets regions and layers":

```ts
// The region and the layer live in the save. Returning to the shelf drops what the player knew of them, so
// after quickload they must come from the loaded game's variables.
scenario('a quickload in a reopened game brings back its region and layer', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.lifecycle),
    ClickAction(ACTION.life.fill),
    SeeElementText(QspRegion, TEXT.lifeRegion, 'region'),
    SeeElementText(QspLayer, TEXT.lifeLayer, 'layer'),
    PressQuickSave(),
    OpenSavesPanel(),
    SeeQuickSaveFilled(), // F5 is async and silent: settle on the filled slot
    CancelSavesPanel(),
    ReturnToShelf(),
    OpenFromShelf(PANELS_GAME.title),
    SeeMainText(TEXT.start),
    PressQuickLoad(),
    SeeMainTextContaining(TEXT.lifeRoom),
    SeeElementText(QspRegion, TEXT.lifeRegion, 'region'),
    SeeElementText(QspLayer, TEXT.lifeLayer, 'layer'),
  );
});
```

If `OpenFromShelf(PANELS_GAME.title)` doesn't find the game (it was opened from a file), use
`LoadGame(PANELS_GAME.path)` + `SeeGameStarted(TEXT.start)`, after checking that quick saves are keyed so that the
reopened game sees them. Record which one you used in the report.

- [ ] **Step 3: Add a show-only-layer guard.** In `themed-game.qsps` `# start`, add
      `act 'Show only other': gs 'qspider_show_only_layer', 'otherlay'`. In `e2e-theme.html`, next to `themelay`, add
      `<qsp-layer name="otherlay" index="6">OTHER LAYER</qsp-layer>`. In `themes-game.ts`, add
      `action.showOnlyOther: 'Show only other'`. Add a scenario to `themes.scenario.ts`: open the themed game,
      `Show layer`, see `THEME LAYER`, then `Show only other`, then `waitUntilPresent` the layer with
      `data-layer-name="otherlay"` and `waitUntilAbsent` the one with `data-layer-name="themelay"`. Add those two
      locators in `screenplay/content/elements.ts` if no locator by layer name exists.
- [ ] **Step 4: Run them on the unchanged product code.** Run `pnpm nx build player`, then the web E2E for
      `game-html-watchers`, `lifecycle` and `themes`. Expected: "qsp-region shows the text…" and "qsp-layer is
      rendered only once shown" FAIL. The new quickload scenario FAILS at least on the region. The show-only scenario
      PASSES (it's a guard). Copy each failure's message into the report. If something expected red is green,
      say so. Don't change the scenario to make it red.
- [ ] **Step 5: Commit** with `test(player-e2e): pin watched regions and layers`.

### Task 2: Leaf engine module, eager re-attach, retired-engine guard

**Files:**

- Create: `libs/game-state/src/qsp-engine.ts`
- Modify: `libs/game-state/src/qsp-api.ts`, `libs/game-state/src/variables.ts`
- Optional: point internal importers (`counter.ts`, `hotkeys.ts`, `save.ts`, `panels.ts`, `current-game.ts`) at
  the leaf when they only need `qspApi$`.

**Interfaces:**

- Produces (`qsp-engine.ts`):
  - `export const qspApi$: Atom<QspAPI | undefined>`
  - `export const gameOpenEpoch$: Atom<number>`
  - `export function retireEngine(api: QspAPI): void`
  - `export function isRetiredEngine(api: QspAPI): boolean` (backed by a module-private `WeakSet<QspAPI>`)
- `qsp-api.ts` does `export { qspApi$, gameOpenEpoch$ } from './qsp-engine'`. Its `replaceQspEngine`, its event
  logger and its listener guard use `retireEngine` and `isRetiredEngine` instead of the local `retiredApis`. Move
  the doc comments with the code: the `gameOpenEpoch$` comment and the retired-engines rationale.

- [ ] **Step 1: Create `qsp-engine.ts`** and move the atoms and the retired set out of `qsp-api.ts`. Behaviour is
      unchanged.
- [ ] **Step 2: Install the variable layer eagerly.** In `variables.ts`, import from `./qsp-engine`. Delete
      `installed`, `reattachOnEngineChange` and its call in `acquireVariable`. Call `qspApi$.subscribe(reattachAll)`
      and `gameOpenEpoch$.subscribe(reattachAll)` at module level, with a one-line comment saying the leaf module
      makes this safe at import.
- [ ] **Step 3: Add the retired-engine guard.** In `attach`, `onValue` returns early when `isRetiredEngine(api)` is
      true for the `api` it was registered on.
- [ ] **Step 4: Check.** Run `pnpm nx test game-state`, `pnpm nx typecheck game-state` and
      `pnpm nx typecheck renderer`; all must PASS. Then `pnpm nx build player` and the web E2E for `variables`,
      `look-vars` and `core-flow`; all must PASS. This proves startup is fine with the eager install, which broke
      startup when tried inside the cycle before.
- [ ] **Step 5: Commit** with `refactor(game-state): engine atoms in a leaf module; variable layer installs at import`.

### Task 3: Regions and layers through the variable layer; remove the pull model

**Files:**

- Modify: `libs/renderer/src/theme-core/qspider/qsp-region.tsx`, `qsp-layer.tsx`
- Modify: `libs/game-state/src/panels.ts`, `panel-logic.ts`, `panel-logic.spec.ts`, `qspider-commands.ts`,
  `qspider-command-parsers.spec.ts`, `current-game.ts`, `save.ts`, `modules/qspider.qsps`
- Modify: the comments in `apps/player-e2e/scenarios/lifecycle.scenario.ts` (above "restart resets regions and
  layers") and `themes.scenario.ts` (above "restart hides a theme-layout layer"), which explain the old
  `reloadRegions` and `registerLayer` mechanics.

**Interfaces:**

- Consumes `useQspVariable(name, key, index, defaultValue)` from `@qspider/game-state`, where the key wins over
  the index.

- [ ] **Step 1: Switch the components.**
  - `QspRegion`: `const text = useQspVariable('$qspider_region', props.name, 0, '')`, with content
    `templateParser.parse(text)`, memoised on `text`. The scroll atom and both render branches stay as they are.
  - `QspLayer`: `const isVisible = Boolean(useQspVariable('#qspider_layers', props.name, 0, 0))`. Delete the
    `registerLayer` effect.
- [ ] **Step 2: Remove the pull model.**
  - Delete from `panels.ts`: `regions$`, `readRegion`, `reloadRegions`, `layers$`, `readLayerState`,
    `registerLayer`, `reloadLayers`.
  - Delete from `panel-logic.ts`: `layerFlag`, `regionText`, `readAll`, `withLayer`, with their `describe` blocks
    in `panel-logic.spec.ts`, and fix its header comment.
  - Delete from `qspider-commands.ts`: the `update_region:`, `update_layer:` and `update_layers` handlers.
  - Delete the `onRestore` export, its doc comment and its calls in `current-game.ts` (restart) and `save.ts`
    (quickLoad, the `load` save command).
  - Delete the `regions$`/`layers$` resets in `stopCurrentGame`.
  - Delete the 7 `exec('qspider.update_…')` lines in `modules/qspider.qsps`.
  - Delete the 3 `update_region`/`update_layer`/`update_layers` expectations in `qspider-command-parsers.spec.ts`.
- [ ] **Step 3: Check the units.** Run `pnpm nx test game-state`, `pnpm nx typecheck game-state`,
      `pnpm nx typecheck renderer`, and `pnpm nx lint game-state renderer`. Expected: all PASS, and no references to
      the deleted names remain (`grep -rn "regions\$\|layers\$\|onRestore\|registerLayer" libs` shows only
      `regionsScroll$`).
- [ ] **Step 4: Check the E2E.** Run `pnpm nx build player`, then the web E2E for `game-html-watchers`, `lifecycle`,
      `themes`, `system-commands` and `variables`. Expected: all PASS, including the scenarios that were red in
      Task 1.
- [ ] **Step 5: Update the stale scenario comments** in `lifecycle.scenario.ts` and `themes.scenario.ts`. Both
      the region and the layer now follow the game's variables, so restart proves the values reset, with no reload
      step.
- [ ] **Step 6: Commit** with `feat(renderer): regions and layers follow their game variables`.
