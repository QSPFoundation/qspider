# libs/game-state inventory (2026-10-26)

A read-only sweep of `libs/game-state/src` for batch 3 of Phase 4.

Classes:

- **PURE**: testable as is.
- **LIFT**: pure logic welded to I/O or to a heavy-import file. Lift it into a light file, test it there, and leave the I/O where it is.
- **NOT**: not pure.
- **TABLE**: a data table, skipped.

The heavy chain:

- `qsp-api`: `@qsp/wasm-engine`, `wasm?url`, and `qspider.qsps?raw`, which is converted at import.
- `@qspider/env`: Dexie, and `detectPlatform()` runs at import.
- Howler, `history/browser` and mousetrap.

Only these files are light enough to test as they are: `attributes`, `qsp-gui-cfg`, `conditions`, `utils`, `debug`, `init`, `toasts`, `components`, `player-theme`, `resources`.

DOM-dependent code, which needs browser mode:

- attributes;
- the theme parsers;
- resources;
- player-theme;
- the config.xml parse in current-game;
- the hotkey lookup tables, once they are lifted.

## attributes.ts (light)

- PURE: `schemeView`, `startsWithAny`, `blockSchemes`, `neutraliseLink`, `isPictureTag`, `neutraliseSvgLink` (DOM), `processorKey`/`processValue`, `extractAttributes` (DOM), and `processStyles` (not exported; export it).
- TABLE: `BOOLEAN_ATTRIBUTES`, the scheme lists, `PICTURE_TAGS`, `valueProcessors`.
- Defects in `processStyles` (D1–D5):
  - **D1:** it splits on `;`, then `:`. That breaks URLs: `url(data:image/png;base64,AA)` becomes `url(data`.
  - **D2:** `--accent:red` becomes the key `-accent`.
  - **D3:** `style="background-image"` (no colon) throws.
  - **D4:** `background-image: linear-gradient(…)` or `none` gets wrapped in `url("…")`.
  - **D5:** values are not trimmed, so `width: 10` stays `" 10"`.

## qsp-gui-cfg.ts (light, node)

- PURE: `buildLayoutTree`, `cleanEmptyLayers`, `convertLayer`, `convertDock`, `convertPane`, `getMaxLayer`/`getLayerPanels`, `extractFromDefaultTheme`, `asNumber`/`asString`, `processData`/`extractLineData`, `parsePanels`, `parseCfg`.
- Defects:
  - **D6:** a cfg with no `Panels=` line makes `buildLayoutTree(undefined)` throw (current-game L89, render-state L58).
  - **D7:** `dir=0`, `dir=6` or a missing dir make `currentLayer[undefined].push` throw. A panel with no `layer` turns the whole layout null.
  - **D8:** names and props go into the HTML unescaped.
  - Minor: `extractFromDefaultTheme`'s `<qsp-main` also matches the `<qsp-main-content>` prefix.
- render-state `qspGuiLayout$` (libs/renderer/src/render-state.ts L54-65): lift the composition as `buildGuiLayoutTemplate(cfg, defaultTemplate): string` into game-state and test it here. This is gap 12 from batch 2.

## conditions.ts, utils.ts (light)

- PURE: `checkCondition`.
  - **D15:** `contains`/`not-contains` on a number always return false; compare against `String(value)`.
  - **D15:** ordering on numeric strings is by character (`'10' greater '9'` is false); compare numerically when both sides are numeric.
- PURE: `convertQsps`, `prepareContent`, `prepareList`, `prepareObjectList`, `clamp`, `isHashPath`.
  - `prepareContent`'s `&gt` to `& gt ` rewrite is **intended**: it keeps QSP `& gt 'loc'` intact inside exec links. Pin it as intended. (D16 is not a defect.)

## debug.ts (light), code-inspector.ts (heavy)

- debug, all PURE (fake timers for `executeResume`; the ids use `Date.now` and `Math.random`, so assert their format):
  - state: `canStep$`, the `debuggerUIState$` init (localStorage in try/catch), the persist subscriptions;
  - execution: `executeResume`, `enable`/`disableDebug`, `pause`/`resume`/`stepExecution`;
  - records: `setCurrentRecord` (history cap 100; the inline breakpoint match becomes `matchesBreakpoint`), `setLinkExecution`;
  - locations: `setLocations`, `selectLocation`, `selectLocationWithLine`;
  - breakpoints: `add`/`remove`/`toggleBreakpoint`, `clearAllBreakpoints`;
  - history and events: `clearExecutionHistory`, `logEvent` (drops function args, cap 200), `clearEventLog`, `toggleAutoPauseOnLinks`;
  - panel: `open`/`close`/`toggleDebugPanel`, `setDockPosition`, `setPanelSize`.
  - **D19:** the localStorage values are not validated (`'null'` gives `size: null`, and any dock string is accepted).
- code-inspector LIFT:
  - `getLocationInfo` assembly and error mapping;
  - `searchInCode`, which becomes `searchLocations(cache, term)`;
  - the `refreshLocations` state transitions;
  - `clearCache`.
  - **D21:** action match lines share the `line` field with location lines, so jumps go to the wrong line.
  - An empty term matches every line.

## counter.ts (heavy, through qsp-api); input.ts, msg.ts, menu.ts, wait.ts (heavy only through counter)

- LIFT: move `pauseReasons$` and `addReason`/`removeReason`/`pauseCounter`/`resumeCounter`/`resetCounterPauses`/`withCounterPaused`/`isPaused$` into a light `counter-pauses.ts`. `scheduleCounter` and the delay watcher use fake timers; the engine tick stays where it is.
- After that lift these are PURE:
  - `input$`: `open`, `enter`, `finish`, `close`, `clear`;
  - `msg$`: `open`, `close`, `clear`;
  - `menu$`: `open`, `select`, `close`, `clear`;
  - wait: `finishWait` and its subscription.
- **D18:** `onselect = null` runs after the callback, so a nested menu opened synchronously from the callback loses its handler. `clear()` has the same problem: it calls the callback before resetting state (input/msg/menu). Confirm with an E2E.

## panels.ts (heavy)

LIFT:

- `canSelectAction`;
- the `selectedAction$` transitions;
- `view$` `open`/`setIsModal`/`close`/`clear` (`open` keeps the previous `isModal`);
- `reloadRegions` (map keys through a reader function);
- `readLayerState` (`Boolean(v ?? 0)`);
- `registerLayer`/`reloadLayers`.

## themes.ts (heavy; a top-level `new DOMParser()`)

- LIFT into `theme-parser.ts` (DOM): `parseTheme`, `extractTagData`, `extractCssVariables`, `extractTranslations`, `extractLinks`.
- LIFT: the `themeRegistry$` add/reset reducers and the derived selectors.
- Defects:
  - **D9:** the template whitespace collapse `/[ \t]*\r?\n[ \t]*/` → `''` glues words together (`Hello\n  world` becomes `Helloworld`). Fix: a newline run between `>` and `<` is removed; anywhere else it becomes one space.
  - **D10:** a game theme named `qspider:classic` replaces the built-in one, and `reset()` then deletes it, so `defaultClassicTheme$` is undefined and render-state crashes. Fix: built-in aliases can't be overwritten, or `reset` restores the built-ins.
  - The `type` attribute is not validated.

## qspider-commands.ts, qsp-api.ts (heavy)

- LIFT into `qspider-command-parsers.ts`:
  - `parseArgs`/`pushNumber`;
  - `parseEvent(s) → {name, args?}`;
  - `parseSystemCmd`;
  - the `scroll_region` split and the shared scroll reducer.
- LIFT into `engine-event-logic.ts`:
  - `shouldPauseOnLink(debugState)`;
  - `isExecHref`/`stripExec` (case-insensitive `exec:`);
  - the `version` answer;
  - `isQsps` plus the base URL/directory join;
  - `isNewLoc(prev, next)` and the NEWLOC effect coercion;
  - `panelVisibility(bitmask)`;
  - `saveTarget` (load_save/save_game: no game means call back now; a path means direct; otherwise request `pause:saves`).
- Defects:
  - **D11:** `system_cmd` uses `split('.')[1]`, which truncates arguments containing a dot (`qspider.event:x[1.5]`, `change_theme:my.theme`), and a bare `qspider` throws. Fix: take everything after the first `.`, and ignore a bare `qspider`.
  - **D13:** the event regex `[(.*?)]` stops at the first `]`, so `[~a]b~]` comes out wrong. An unclosed `~` becomes a number (`[~12]` gives 12, `[~abc]` gives NaN). `[~a~x]` gives `['a', NaN]`.
  - Minor: a region name containing `:` is split wrongly (L89).
- `useQspVariable` `value || default` stays as is: 0 and `''` mean unset in QSP. **Not a defect (D12).**

## hotkeys.ts (heavy: mousetrap, audio, …)

- LIFT into `hotkey-format.ts`:
  - `prettifyHotkeys(keys, platform)` with its symbol tables (used by renderer GlobalHotkeys/GameHotkeys);
  - `isBlockingDialogOpen({msg, input, menu, wait, view})`;
  - `resolveHotkey(…)` for the space/action/restart/save decisions.
- **D17:** with NOSAVE set, Ctrl+S returns `undefined`, so the browser's "Save page" dialog opens. It should return `false`.
- Minor: an `in` lookup matches prototype keys.

## audio.ts, sound.ts (heavy: Howler)

- LIFT: `volume$` `increase`/`decrease` (step 10, clamp 0..100), the `Howler.volume` mapping, `getFileKey`, `normalizeVolume`.
- **D14:** `normalizeVolume(1)` returns 1.0, so `PLAY 'x', 1` plays at 100%, and a player volume of 1% plays at full volume. The volume is always 0..100, so normalise as `v / 100`.

## current-game.ts, save.ts, pause-screen.ts, loaders.ts, others

- current-game LIFT into `game-config.ts`:
  - the descriptor pick;
  - the aero window merge;
  - the config.xml width/height parse (DOM; defaults 800/600; `auto` gives NaN);
  - the theme choice;
  - the `applyWindowSettings` decision;
  - `onGameCommand` parsing (`pause:<panel>`, `scroll:<panel>:<dir>`);
  - the defaults derived from `currentGameMode$` (aero width/height, slots).
- save LIFT:
  - the `onSaveCommand` routing;
  - `finishSave`;
  - the `resumeAfterLoad` handshake.
  - **D20:** `clearSlot`/`clearPath` are not awaited.
- pause-screen LIFT: the URL builders and the open/close/reset decisions.
- loaders LIFT: the config-directory join.
- PURE (browser mode): player-theme `markTheme`/`initTheme`/`toggleTheme`; resources `whenLoaded` (fake timers) and `clearAdditionalResources`; toasts `showError`/`showNotice` (fake timers); components registry/`useComponent`; init `playerUrl`.
- NOT:
  - the engine wiring;
  - fetch, Dexie, Howl and Mousetrap binding;
  - `usePrevious`;
  - browser-translation (the observers run at import).

## Duplicated logic (each copy calls one function)

1. The scroll reducer: current-game L282/L285 and qspider-commands L91-95.
2. `reloadLayers` is the same as `qspiderCommands.update_layers`.
3. `onRestart` is the same as `onRestore`.
4. The save/restore/clear slot and path pairs.
5. The region read `readVariableByKey('$qspider_region', name) ?? ''`.
6. The `.qsps` check plus `convertQsps`: qsp-api L226 and current-game L170.
7. The `requestedAction$.set(x); onGameCommand('pause:saves')` request: qsp-api and hotkeys.
8. The `selectAction` + `execSelectedAction` pairs: hotkeys L64-65 and L144-145.
9. The directory-of-path join: loaders L8 and qsp-api L229.
