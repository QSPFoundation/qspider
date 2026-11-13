# Regions and layers as watched variables

Date: 2026-11-13. Follows `2026-11-13-variable-watching-design.md` (research item A2 plus that work's two
follow-ups).

## Intent

`<qsp-region>` and `<qsp-layer>` show `$qspider_region[name]` and `qspider_layers[name]`. Today qspider pulls these
values. The `qspider.qsps` library assigns the variable and then sends a command (`qspider.update_region:name`,
`update_layer:name`, `update_layers`), and qspider reads the value into `regions$` or `layers$`. After a restart or a
load, `onRestore` re-reads only the names those maps already hold. `<qsp-region>` never registers its name. So
after the game is stopped (or the page reloads), a loaded save shows an empty region until the game updates it
again. This is likely, but unconfirmed until the E2E below fails on main.

The why: the maintainer wants one owner for reading game variables (the variable layer from PR #210), with no second
store of the same values.

## Goals

- `<qsp-region name>` reads `$qspider_region` by key `name`, and `<qsp-layer name>` reads `#qspider_layers` by key
  `name`, both through the shared variable layer. Their values follow the game after every refresh, restart, load,
  OPENQST and engine replacement.
- `qspApi$`, `gameOpenEpoch$` and the record of retired engines move into one leaf module that imports nothing
  from game-state. `variables.ts` installs its re-attach subscriptions at import, not lazily.
- A watcher callback from a retired engine is ignored.

## Non-goals

- `regionsScroll$` and the `scroll_region` command stay as they are, because scrolling is UI state, not a game
  variable.
- No change to the command parser or to the `qspider.qsps` procedures' names and arguments.

## Behaviour change (accepted)

A game that assigns `$qspider_region[...]` or `qspider_layers[...]` directly, without sending the command, now updates
the screen. Nothing that works today stops working.

## Design

- **Components.** `QspRegion` takes its content from `templateParser.parse(regionText(useQspVariableRaw('$qspider_region', name, 0)))`,
  or the equivalent through `useQspVariable` with default `''`. `QspLayer` is visible when
  `useQspVariable('#qspider_layers', name, 0, 0)` is non-zero. `registerLayer` and its effect go away.
- **Removed from game-state.** `regions$`, `readRegion`, `reloadRegions`, `layers$`, `readLayerState`,
  `registerLayer`, `reloadLayers`, `onRestore`, the resets in `stopCurrentGame`, and any `panel-logic` helpers that
  lose their last caller (together with their unit tests).
- **Commands removed.** `update_region:`, `update_layer:` and `update_layers` are deleted from `qspiderCommands`
  (with their parser tests), and the `exec('qspider.update_region:…')` / `update_layer(s)` lines are deleted from
  `qspider.qsps`. Games are expected to use the library procedures (maintainer's call). A game that still sends
  one directly is unaffected: an unknown `qspider.` command is silently ignored (`qsp-api.ts` `system_cmd`
  handler). The E2E fixtures that send them directly (`game-html.qsps` `fill region` / `fill layer`) switch to the
  library procedures or to plain assignment.
- **Leaf module** (`libs/game-state/src/qsp-engine-ref.ts`, name left to the builder). It holds `qspApi$`,
  `gameOpenEpoch$`, and the retired-engine set with `retireEngine(api)` / `isRetiredEngine(api)`. `qsp-api.ts`
  imports and re-exports what it used to export, so the public `index.ts` surface is unchanged. Internal importers
  (variables, panels, save, hotkeys, counter, current-game) may import from the leaf directly. In `variables.ts`,
  the `installed` flag and the lazy install go away, and it subscribes at module load.
- **Retired engines.** The watcher callback in `attach` drops a value when `isRetiredEngine(api)` is true for the
  engine it was registered on. Being honest about the value: a retired engine runs code again only if a `wait`
  timer finishes in the few milliseconds before the new engine is ready, and `reattachAll` unwatches the old engine
  as soon as the new one is set. So this is a one-line guard with no behaviour an E2E can observe, and it gets no
  dedicated test.

## Tests

E2E only (an engine integration). Follow the Rules in `apps/player-e2e/README.md`.

1. **A region and a layer come back from a save in a fresh session.** In the panels fixture's life room: fill
   the region and show the layer, quick-save, return to the shelf, open the game again, quick-load, and see the
   region text and the layer. This must fail on main before the fix, and the PR records what was red. If only the
   region fails, say so. If it is green on main, keep it as a regression guard and say so in the PR.
2. **A direct assignment updates the region and the layer.** Add actions to the `watchers` location of
   `game-html.qsps` that assign `$qspider_region['reg']` and `qspider_layers['lay']` with no command, and see both.
   This fails on main.
3. The existing region and layer scenarios stay green: `game-html-watchers`, `lifecycle` ("restart resets regions
   and layers"), `themes` (theme layer, restart hides a theme-layout layer), and `system-commands`. Comments in
   those scenarios that name `reloadRegions` and `registerLayer` are updated.

## Approaches

|                       | (a) Components read through the variable layer (picked) | (b) Keep `regions$`/`layers$`, fed by watchers |
| --------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| Stores of the value   | one                                                     | two (atom map + variable layer)                |
| Restore after load    | automatic                                               | needs every name registered up front           |
| Code removed or added | removes ~40 lines                                       | adds watch bookkeeping                         |

The maintainer approved (a). (b) keeps the duplicate store that the variable layer exists to remove.

## Left to the builder

- The leaf module's name. Whether every internal importer moves to it, or only the ones that need to.
- Whether `regionText`/`layerFlag` survive as the conversion at the component, or are replaced by
  `useQspVariable` defaults.
