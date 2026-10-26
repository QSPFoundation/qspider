# Follow-ups after the automated-checks work

As of 2026-10-26. Phases 1–4 of `specs/2026-10-20-automated-checks-design.md` are done (the last merged PR is #188). The fix for the Windows slow exit is #189.

The items below are product defects and hardening gaps that the test work uncovered, plus a few parked test-infrastructure ideas. Each item names its source. Remove an item when the PR that closes it merges.

Suggested order: 1, 2, 3, 4. Section 5 stays parked until the maintainer picks it up.

## 1. The engine is never stopped when a game stops

**Where:** `stopCurrentGame` (`libs/game-state/src/current-game.ts`) resets the player state but never stops or disposes the QSP engine. The old game stays suspended mid-statement, and the next game's `openGameSource` runs on the same engine.

**How the old game gets resumed:** stopping a game answers each pending engine call as cancelled. The engine resumes synchronously inside that answer.

- `onClosePauseScreen` → `cancelPendingSaveCallbacks` (`save-routing.ts`) answers a waiting SAVEGAME/OPENGAME.
- `clearDialogs` (`dialogs.ts`) answers an open msg, input or menu with a cancel (-1, `''`, closed).

**Workarounds that exist only because of this:**

1. **The silent reset pass in `clearDialogs`** (`dialogs.ts`, #188). Each `clear()` resets, calls back, then resets again silently, and the three silent resets run at the end. This discards any dialog the resumed old code reopens, across all kinds. With a stopped engine a single reset is enough.
2. **`resetCounterPauses('no-game')`** after the dialog clears (`current-game.ts`). It wipes counter pause reasons that the resumed code may leave behind.
3. **Ordering, not a fix:** the save callbacks are answered before `clearDialogs` runs. Anything the resumed code opens from there is discarded only because of that order.

**Gaps nothing covers:**

- **`wait`:** `stopCurrentGame` doesn't touch `wait$`, so a running `WAIT` timer still calls `finish()` into the old engine after the next game has loaded (`wait.ts`).
- **The delayed `qspider.action` command:** its `setTimeout` plus `onGameCommand` is never cancelled (`qspider-commands.ts`).
- **Engine callbacks still in flight:** for example `play_file`'s `ready`, or a pending file open, are never cancelled.

**What a real fix needs:**

- An engine-level stop or reset: dispose of the engine, or cancel its pending calls, so pending callbacks are dropped rather than answered. First check what `@qsp/wasm-engine` offers (a dispose, abort or re-init call); if it offers none, the engine package needs a change.
- Then shrink workaround 1 to a plain reset, and clear the `wait` timer and the pending `action` timers at stop.
- Covering E2E already exists: "a dialog does not outlive its game" in the dialogs scenario, using `GoBackToShelf`. Add one for a `WAIT` running while the game stops.

## 2. Security hardening (game text is untrusted)

Source: #187 and #188.

- **SMIL attributes:** `<animate>`/`<set attributeName="href" to="javascript:…">` gets past the URL guard (`libs/game-state/src/attributes.ts`).
- **Unfiltered URL attributes:** `poster`, `srcset`, `ping`, `background` and `cite`.
- **Custom elements:** React does no URL sanitising on them, and the player's own guard covers only the guarded attribute names.
- **`data-qsp` spoofing:** a game can set its own `data-qsp`, which overrides the renderer's marker. It can't run script, but it can confuse themes and E2E locators.
- **No `url()` guard in styles:** this is a deliberate ruling (#188). `javascript:` in a CSS `url()` doesn't run in any engine we ship, and a regex can't cover CSS escapes. Revisit only if an engine changes that.

## 3. Product defects found in phase 3 (inventory 59–61)

- **59:** the page scrolls by 58 px.
- **60:** the actions list jumps a row.
- **61:** `http:` resources are blocked as mixed content on Windows (the app runs on https there).

## 4. Smaller follow-ups

**From #186:**

- Is the Linux XHR shim still needed?
- `archive-importer`'s `Object.assign` can rewrite `game.id` after the game has been stored.
- `loaders.ts` is dead code.

**From #187 (renderer):**

- Theme or game markup can crash the content tree: `tag=""`, an invalid tag name, or a void `tag=` with children (for example `<qsp-main tag="br">`).
- A dock with `visibility=""` is hidden by the layer (`isLayerDockVisible`) but shown by the dock (`isDockVisible`). The maintainer kept this divergence; it needs a decision.
- `convertLineBreaks`: `a<br>\nb` gets a double break, and `<h1>…</h1>\n` is converted. Decide what classic QSP does here.
- `qsp-on:wheel` calls `preventDefault` inside React's passive listener, which logs a console warning.
- `bindKey` is not escaped when the bind name is built. Only the game or theme author controls it.

**From #188 (game-state):**

- `style=`:
  - `!important` is dropped (React can't express it);
  - backslashes inside an explicit `url(img\a.png)` are still read as CSS escapes;
  - an unmatched `"` swallows the following declarations.
- An absolute OPENGAME path keeps a doubled slash. The fetch joins the same way, so both joins must change together. `gameFileUrl` for an external URL or a Windows path is untested.
- The `system_cmd` prefix loop runs every matching prefix (with an untrimmed `replace`).
- A game theme that reuses a built-in `qspider:*` alias is dropped silently, with no warning. The theme `type` attribute is not validated.
- `searchInCode` (`code-inspector.ts`) has no consumer.
- A newline between inline tags in a theme template still glues the words together (`<b>a</b>\n<i>b</i>`).

**Build:** the player and player-desktop Vite builds don't empty their output folder.

**CI:** confirm that a PR touching no desktop paths shows `smoke-macos / smoke` as skipped, not waiting.

## 5. Test infrastructure (parked)

- **A lived-in profile:** a realistic, non-empty player state for E2E instead of a fresh app every time. It's about realism and needs a brainstorm.
- **Speed:** `e2e-web` (~9 min, one worker) is now the slowest check. Desktop runs in shards: Linux about 5 min, Windows about 8 min.
