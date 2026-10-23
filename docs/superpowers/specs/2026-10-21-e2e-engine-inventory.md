# E2E inventory: where the player meets the QSP engine

Draft input for the Phase 2 scenario list (2026-10-21). Built from a read of the code, not from runs.
Coverage refers to `apps/player-e2e/scenarios/core-flow.scenario.ts` (5 scenarios: pack load, open file, actions update text, save/load slot, reopen from shelf), run on web and desktop.

`GS` = `libs/game-state/src`, `R` = `libs/renderer/src`. Coverage: ✅ covered, ◐ partly, — none.

## A. Opening and loading

| Touch point                                                                                | Where                                            | E2E                      |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------ | ------------------------ |
| Engine init, version                                                                       | GS/qsp-api.ts:60-63; apps/*/init.ts              | ✅ implicit              |
| `game.cfg` with several games, `.qsps` entry                                               | GS/current-game.ts:58-179                        | ✅                       |
| `.qsp` / `.gam` entry files                                                                | importers                                        | —                        |
| Web: zip import (with `game.cfg`, subfolders)                                              | libs/importers archive-importer.ts               | ✅ web                   |
| Web: rar / 7z import                                                                       | importers utils.ts (7z-wasm)                     | —                        |
| Multi-game zip shelved, not started                                                        | archive-importer                                 | —                        |
| Web: URL import, `?game=`                                                                  | importers url-importer.ts                        | —                        |
| Web: single file upload                                                                    | file-importer.ts                                 | ✅                       |
| Drag-and-drop (web, desktop)                                                               | —                                                | —                        |
| Desktop: launch with `game.cfg` argument; open dialog                                      | libs/desktop desktop-importer.ts                 | ✅                       |
| Desktop: `qsp://` / `https://qsp.localhost` protocol, percent-decoding, lowercase fallback | src-tauri main.rs:51-99, game_uri.rs             | — (Rust unit tests only) |
| Standalone build (deferred to Phase 3)                                                     | apps/player-standalone init.ts, config-runner.ts | —                        |
| Engine-driven `open_game` (`inclib`, `addqst`, `opengame "file"`), new base URL            | GS/qsp-api.ts:201-221                            | —                        |
| Built-in `qspider` module                                                                  | GS/qsp-api.ts:51,202; modules/qspider.qsps       | —                        |
| Non-ASCII / Cyrillic game and file names; zip with CP866 names                             | service-worker.ts, game_uri.rs, importers        | —                        |
| Mixed-case references to files (case-insensitive lookup)                                   | service-worker (lowercased IDB), game_uri.rs:17  | —                        |
| Shelf: game description rendered as HTML, icon                                             | R/render-state.ts:39-43; current-game.ts:142     | —                        |

## B. Panels: main, stats, actions, objects, command line

| Touch point                                                             | Where                                      | E2E                                           |
| ----------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------- |
| `main_changed` → main text; new-location detection (`isNewLoc$`)        | GS/qsp-api.ts:231                          | ✅ text; new-loc —                            |
| `&gt` / `\"` rewriting before parsing                                   | GS/utils.ts:13-22                          | —                                             |
| `stats_changed` → stats panel                                           | :243                                       | ✅                                            |
| `actions_changed` → actions; click                                      | :246; panels.ts:23-30                      | ✅ click                                      |
| Action hover selection, `act:`-style numeric links, hotkeys 1-9 / space | actions.tsx; link.tsx:18; hotkeys.ts:47-69 | ◐ hover, hotkeys 1-9 / space; numeric links — |
| Action images                                                           | actions.tsx                                | —                                             |
| `objects_changed` → objects; `selectObject`; images                     | :249; panels.ts:36                         | ✅                                            |
| `panel_visibility` (show/hide VARS/ACTS/OBJS/INPUT)                     | :262                                       | ✅                                            |
| Command line: `user_input`, `updateUserInput`                           | :252; panels.ts:42; cmd.tsx                | ✅                                            |
| `DISABLESCROLL`                                                         | main.tsx:21, stats.tsx:21                  | —                                             |

## C. Dialogs and blocking calls

| Touch point                                                         | Where                 | E2E                                                        |
| ------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------- |
| `msg` (pauses counter; several in a row)                            | :228; msg.tsx         | —                                                          |
| `input` (enter / cancel returns ''; several in a row)               | :222; input.tsx       | —                                                          |
| `menu` (select / close returns -1; separators; images; positioning) | :225; menu.tsx        | —                                                          |
| `view` open / close                                                 | :255; view.tsx        | —                                                          |
| `wait` (counter paused; click on wait lock ends it early)           | :302; wait-lock.tsx   | —                                                          |
| Esc ignored while msg / input / menu / wait / view open             | game-runner.tsx:27-33 | —                                                          |
| Hotkey pressed during msg / input (historic crash)                  | hotkeys.ts            | ◐ (covered by "Ctrl+R is ignored while a message is open") |

## D. Game HTML and what it sends back

| Touch point                                                                                  | Where                            | E2E                          |
| -------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------- |
| `exec:` links                                                                                | link.tsx:16 → execCode           | —                            |
| Numeric links (`href="N"`), `#hash`, external links                                          | link.tsx:18-55                   | —                            |
| `<area href>` (exec / navigation)                                                            | classic/area.tsx:13              | —                            |
| `qsp-on:click/mouseenter/mouseleave/contextmenu/dblclick`                                    | R/content/attributes.ts:106-116  | —                            |
| `<form qsp-on:submit>`                                                                       | form.tsx:7-12                    | — (likely broken, see below) |
| `qsp-bind` inputs / select / textarea (two-way variable binding)                             | hooks/qsp-bind.ts                | —                            |
| `qsp-variable`, `qsp-show`, `qsp-style`, `qsp-region`, `qsp-layer` (watch engine variables)  | default-transformers.tsx:269-312 | —                            |
| Engine text with markup reaches the main panel rendered (one boundary case, not one per tag) | R/render-state.ts:66-70          | —                            |

### D′. Pure HTML conversion → Phase 4 (unit tests), not E2E

No engine involved, so these go to unit tests in `libs/html-renderer` / `libs/renderer` (Phase 4 of the automated-checks design; those libs have no unit tests yet).

| Touch point                                                                                                          | Where                                     |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Classic tags: `font`, `big`, `tt`, `strike`, `hr`, `table` (align/valign/cellpadding), `center`, `video`             | classic-transformers.tsx                  |
| SVG (camelCase tags/attrs)                                                                                           | content/element.tsx                       |
| Attribute handling: `on*` dropped, `javascript:` href, inline style parsing, `size`/`color`/`face`/`bgcolor` → style | GS/attributes.ts; R/content/attributes.ts |
| Sanitizer: banned tags, attribute allow-list, `isSafe()`                                                             | html-parser.ts                            |
| `qsp-t`, `qsp-device`, `qsp-orientation`, volume / mute widgets (no engine state)                                    | default-transformers.tsx                  |

## E. Layout driven by engine variables

| Touch point                                                                                                                  | Where                                         | E2E                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Classic CSS vars: `FSIZE`, `$FNAME`, `FCOLOR`, `LCOLOR`, `BCOLOR`, `$BACKIMAGE`, `$TOPIMAGE`                                 | public/themes/classic.html; css-variables.tsx | ✅ `the classic theme maps every look variable` (`look-vars.scenario.ts`)                                                                                                                                                                                                                                                                |
| Aero vars: `*_BACKIMAGE`, X/Y/W/H, `MSG_X/Y`, `INPUT_X/Y`, `MENU_X/Y`, `FIXED_SIZE_MENU`, `DISABLESHADE`, `ALWAYS_SHOW_VIEW` | aero.html; aero transformers                  | ✅ `the Aero theme maps every look variable` (`look-vars.scenario.ts`; includes that the look variables reach the dialog portal); `DISABLESHADE removes the dialog shade`, `MSG, INPUT and MENU positions place the dialogs`, `FIXED_SIZE_MENU fixes the menu size`, `ALWAYS_SHOW_VIEW keeps the view open` (`look-dialogs.scenario.ts`) |
| Aero `*_FORMAT` (`$MAIN_FORMAT`, `$ACTION_FORMAT`, …)                                                                        | R/render-state.ts:124-235                     | ✅ `Aero format variables wrap the panels` (`look-vars.scenario.ts`; the in-game `open_game` re-subscription path is not covered, defect 33)                                                                                                                                                                                             |
| Aero new-location effects (`$NEWLOC_EFFECT`, …)                                                                              | aero-newloc-effect.tsx                        | ✅ `a new-location effect animates the change`, `fast and sequential effects still deliver the new location` (`look-effects.scenario.ts`)                                                                                                                                                                                                |
| `qspgui.cfg` classic layout (docks, panes, colours, font)                                                                    | GS/qsp-gui-cfg.ts; classic-layout.tsx         | ✅ docks (`themes.scenario.ts`); panes — not covered (parked, not in 2f′); colours and font: `qspgui.cfg colours and font apply to the classic layout`, `a classic game without qspgui.cfg keeps the default look` (`look-vars.scenario.ts`); `UseFontSize` is not supported (defect 32)                                                 |
| Aero window size (`config.xml` UTF-16 / `game.cfg aero`)                                                                     | current-game.ts:94-134                        | — (see defect 28)                                                                                                                                                                                                                                                                                                                        |

## F. Themes

| Touch point                                                  | Where                                      | E2E                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Built-in classic theme                                       | GS/themes.ts                               | ✅ implicit                                                                                                                                                                                                                                                       |
| Aero mode (`game.cfg mode`)                                  | current-game.ts:51,83-134                  | ✅ (an Aero game plays: msg, next location; `themes.scenario.ts`)                                                                                                                                                                                                 |
| Game-provided themes, `defaultTheme`, missing theme → notice | current-game.ts:145-161                    | ✅ (theme html / css / js loaded and run; missing `defaultTheme` falls back to Aero or classic with a notice; core flows under aero and custom, web only)                                                                                                         |
| `qspider.change_theme:` at runtime, unknown name             | qspider-commands.ts:75-83                  | ✅ (switch to classic and back keeps the game playing; unknown name shows the error and keeps the theme)                                                                                                                                                          |
| Theme `css-link` / `script-link`, translations               | themes.ts; css-links.tsx; script-links.tsx | ✅ script-link runs (the theme's js writes its marker); css-link takes effect (its rule sets `--e2e-theme-css` on the chrome); look variables: section E; translations: —; `data-qsp-theme` on `qsp-game-root` (game-runner.tsx:43-47) is the active-theme marker |

## G. Resources and paths

| Touch point                                                        | Where                                               | E2E                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<img src>` in game HTML                                           | html/img.tsx                                        | ✅ `game images load from every kind of path (archive)`, `resources.scenario.ts` (plain, backslash, spaces, Cyrillic, wrong case (not asserted on the web plain-URL route, see the backslash row below), `?query`, absolute and `data:` URLs; the probe is the picture's natural width)          |
| Images via CSS vars (`$BACKIMAGE`, aero images), natural-size vars | css-variables.tsx:28-63                             | ✅ resource suffixes and `-w` / `-h` in the look tables (`look-vars.scenario.ts`); backslash, absolute and `data:` paths in the same resources scenario                                                                                                                                          |
| Action / object / menu images                                      | GS/utils.ts:24-37                                   | ✅ action image (`look-vars.scenario.ts`); object and menu images in the resources scenario                                                                                                                                                                                                      |
| View image                                                         | view.tsx                                            | ✅ resources scenario (backslash path)                                                                                                                                                                                                                                                           |
| `game.cfg` resources: fonts, styles, scripts (removed on stop)     | GS/resources.ts                                     | ✅ `game.cfg resources load before the game starts, in order` (plus a web-only variant from a plain URL with script one delayed), `game.cfg resources are removed when the game stops`, `a missing game.cfg resource shows a notice and the game still starts`; the font-failure path has no row |
| Backslash paths (`img\a.png`), spaces, Cyrillic, wrong case        | img.tsx:7; css-variables.tsx:63; game_uri.rs        | ✅ `game images load from every kind of path (archive)` and, on desktop, `game images load from a plain folder` (wrong case on the web plain-URL route is a case-sensitive server and is not asserted)                                                                                           |
| Resources from inside an archive                                   | service-worker.ts; desktop XHR shim setup.ts:69-104 | ✅ the archive scenarios above (web: service worker; desktop: protocol); a game script's XHR to an absolute URL, in the same game                                                                                                                                                                |
| Web CORS proxy fallback                                            | libs/browser data-fetcher.ts                        | ✅ web only: `a game URL the browser cannot fetch loads through the CORS proxy`, `open-routes.scenario.ts` (text/binary fetches only; DOM resources do not use the proxy, defect 43)                                                                                                             |

## H. Sound

| Touch point                                               | Where                                     | E2E                                                                                                                                            |
| --------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `play_file` (volume), `is_play`, `close_file` (one / all) | GS/qsp-api.ts:183-197; audio.ts; sound.ts | ✅ `PLAY, replay, ISPLAY and CLOSE`, `sound.scenario.ts` (ISPLAY text in the same action plus the Howl probe; `a sound path with backslashes`) |
| Replaying a sound already playing                         | audio.ts                                  | ✅ same scenario                                                                                                                               |
| Global mute / volume (hotkeys, widgets)                   | audio.ts:45-62; hotkeys.ts:105-124        | ✅ `mute and volume from the pause screen hotkeys` (master state probe; the volume slider follows the volume)                                  |
| Sound from archive; desktop via XHR shim                  | setup.ts                                  | ✅ every sound scenario opens the resources game from its archive; the absolute-URL sound is in `resources.scenario.ts`                        |
| Sounds stopped on game stop                               | current-game.ts:242                       | ✅ `sounds stop when the game stops`                                                                                                           |

## I. Saves

| Touch point                                                                               | Where                                             | E2E |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------- | --- |
| `savegame` / `opengame` without path → saves panel, slot save / load                      | qsp-api.ts:276-301; save.ts:30-84, 127-157        | ✅  |
| Several slots, clear slot                                                                 | save.ts:30-98, 127-157                            | ✅  |
| `savegame "name"` / `opengame "name"` (named saves)                                       | save.ts:44-56, 72-84                              | ✅  |
| Quicksave / quickload (F5 / F9, pause-screen command)                                     | save.ts:100-123; hotkeys.ts:81-82                 | ✅  |
| Ctrl+S / Ctrl+O                                                                           | hotkeys.ts:83-104                                 | ✅  |
| `NOSAVE`: blocks the player's saves (quicksave, Ctrl+S, Esc → save); Esc still opens load | save.ts:101; hotkeys.ts:88; game-runner.tsx:28-31 | ✅  |
| Cancelling the saves panel resumes the engine                                             | pause-screen.ts:29-41                             | ✅  |
| Saves survive app restart                                                                 | —                                                 | ✅  |

## J. Lifecycle and timing

| Touch point                                                                         | Where                                                                | E2E                                                                                           |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Counter loop (`execCounter`), `SETTIMER`                                            | counter.ts:57-77; qsp-api.ts:198                                     | ✅ ticks asserted                                                                             |
| Counter paused by msg / input / wait / pause screen / open_game                     | counter.ts:7-56 (reasons, `withCounterPaused`)                       | ◐ msg, input, menu, pause screen; wait, open_game — (a `view` does not pause it, see defects) |
| Restart: Ctrl+R, pause-screen command, `qspider_restart`; regions / layers reloaded | current-game.ts:284-295; hotkeys.ts:70-80; qspider-commands.ts:41-53 | ✅ (regions / layers: behaviour only, see note)                                               |
| Quit to shelf (pending dialogs resolved, sounds cleared)                            | current-game.ts:209-253                                              | ✅                                                                                            |
| Pause screen open / close via Esc                                                   | game-runner.tsx                                                      | ✅                                                                                            |
| Custom hotkeys from `game.cfg` (`execLoc`)                                          | hotkeys.ts:156-164                                                   | ✅                                                                                            |

Note (§J): restarting resets regions and layers. The scenario `restart resets regions and layers` checks only that behaviour: the region is empty and the layer gone after a restart. It does not tell `reloadLayers` from the layer re-reading the engine on mount, so the layer reset stays behaviour-only until 2f's theme-layout layer.

## K. System commands (`qspider.*` via `system_cmd`)

| Touch point                                                                                                        | Where                                | E2E                                                            |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | -------------------------------------------------------------- |
| `action:` (`restart`, `quit`), `event:` (`qspider-event`), `update_region:`, `update_layer:`, `fullscreen:`        | GS/qspider-commands.ts:40-118        | ✅ (`fullscreen:` on desktop: no error and the game continues) |
| `scroll_region:`, `action:` other than restart / quit                                                              | qspider-commands.ts:41-96            | —                                                              |
| `update_layers` (`qspider_show_only_layer`), bare `quit` (the fixture's `qspider_quit` goes through `action:quit`) | qspider-commands.ts:101-109, 116-118 | —                                                              |
| `change_theme:`                                                                                                    | qspider-commands.ts:75-83            | ✅ (2f, `themes.scenario.ts`)                                  |

Note: `change_theme` is covered in 2f (Themes and layout), not 2e. 2e covers the other `qspider.*` commands above.

## L. Errors, version, debugger

| Touch point                                                                       | Where                                | E2E |
| --------------------------------------------------------------------------------- | ------------------------------------ | --- |
| `error` → error dialog                                                            | qsp-api.ts:172; qsp-error-alert.tsx  | —   |
| `version` answers (`player`, `platform`)                                          | qsp-api.ts:163                       | —   |
| Debugger: `debug` callback, step / resume, deferred `exec:` links, code inspector | qsp-api.ts:90-118,305; libs/debugger | —   |

## M. Player-side integrations (storage, filesystem, translations, platform)

Not engine calls, but integrations with something external, so E2E as well. Not yet inventoried at file:line level.

| Touch point                                                                                                      | E2E                                |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Shelf: add, remove, re-import overwrites; persistence across app restart (IndexedDB / Tauri storage)             | ◐ add + reopen; remove / restart — |
| Saves persistence across restart                                                                                 | —                                  |
| Player settings: change takes effect, persists across restart                                                    | —                                  |
| Language switch: translations loaded at runtime, UI re-rendered; launch notice language before translations load | —                                  |
| Player light / dark theme persistence                                                                            | —                                  |
| Catalog: add game from catalog (network) — dropped from Phase 2 (offline/isolated)                               | —                                  |

## Proposed Phase 2 scenarios

Grouped into batches, each a shippable PR. Order is by historic breakage (from the fix-commit clustering: paths/names, archives, saves, lifecycle break most) and by shared fixtures. "Pack" = additions the test pack needs. Scenarios run on both web and desktop unless marked. ⚠ = expected to find or confirm a bug.

### 2a. Opening routes and archives (§A)

- Drag-and-drop a game file (web-only — cannot be driven through the desktop dialog)
- URL import `?game=` succeeds (web-only) ⚠ failed `?game=` leaves the loader up
- Open a single-game `.zip` (web, desktop)
- Multi-game `.zip` is shelved, not started (confirms #164 change)
- `.qsp` / `.gam` entry file opens
- Cyrillic-named game and resource file opens — Pack: a Cyrillic-named game
- Engine-driven `open_game` (`inclib`, `opengame "file"`) — Pack: a game that includes another
- rar / 7z import (web) ⚠ drop doesn't accept `.7z`

### 2b. Dialogs and blocking calls (§C)

- `msg` shows and closes; several `msg` in a row — Pack: a game using `msg`
- `input` returns text; cancel returns empty; several in a row
- `menu` select and cancel; separators
- `view` opens and closes
- `wait` ends on timeout and on wait-lock click
- Esc is ignored while a dialog is open
- A hotkey pressed during `msg` / `input` does not crash (historic)

### 2c. Game HTML and interaction (§D)

- Engine text with markup renders in the main panel (one boundary case)
- `exec:` link runs code; numeric link selects an action; `<area>` exec
- `qsp-on:click` / `mouseenter` / `mouseleave` run code
- `qsp-bind` two-way variable binding ⚠ unescaped input
- `qsp-variable`, `qsp-show`, `qsp-style`, `qsp-region`, `qsp-layer` react to variables
- `<form qsp-on:submit>` ⚠ expected dead (confirmed in code)
- Pack: a game exercising these

### 2d. Saves (§I)

- Several slots; clear a slot
- Named saves (`savegame "name"` / `opengame "name"`)
- Quicksave / quickload (F5 / F9, pause-screen command)
- Ctrl+S / Ctrl+O
- `NOSAVE` blocks the player's saves (quicksave, Ctrl+S, Escape → save); Escape still opens load. The player never blocks a game's own `savegame` — Pack: a `nosave` game
- Cancelling the saves panel resumes the engine
- Saves survive an app restart (new persistence-preserving restart helper; see design doc)

### 2e. Panels, lifecycle, system commands (§B, §J, §K)

_Pack: extend fixtures with stats, objects, a command-line prompt, SETTIMER, panel_visibility toggles and custom game.cfg hotkeys._

- Stats panel updates
- Objects: list, select, images
- Command line (`user_input` / `updateUserInput`)
- `panel_visibility` toggling
- Action hotkeys 1-9 / space; hover selection
- Restart (Ctrl+R, pause-screen command); regions/layers reload
- Custom hotkeys from `game.cfg` (`execLoc`)
- Counter / `SETTIMER` advances (assert, don't just run)
- `qspider.*` system commands: `update_region`, `update_layer(s)`, `fullscreen`, `quit`, `event`

### 2f. Themes and layout (§E, §F)

- Aero-mode game loads — Pack: an Aero game
- Game-provided theme via `defaultTheme`; `forEachTheme` dimension
- Missing `defaultTheme` → notice; falls back to the mode's theme
- Runtime `change_theme`
- Classic `qspgui.cfg` layout (docks only; panes are not covered: parked, not in 2f′)

### 2f′. Aero/classic variables that change how the game looks (§E) — done

How these surface, and so how they're asserted:

- **Colour / unit / image vars** become CSS custom properties on `qsp-game-root` / `#portal-container` (css-variables.tsx): assert the applied custom-property value, not pixels.
  - `FCOLOR`, `BCOLOR`, `LCOLOR`, `FSIZE`, `$FNAME`
  - `$BACKIMAGE`, `$TOPIMAGE`, aero `*_BACKIMAGE` (+ natural-size `-w`/`-h`)
  - dialog positions `MSG_X/Y`, `INPUT_X/Y`, `MENU_X/Y` (and W/H)
- **Behavioural vars** change which elements render: assert element/class presence or absence.
  - `DISABLESHADE` → overlay element absent (aero-overlay.tsx, `.qsp-overlay`)
  - `ALWAYS_SHOW_VIEW` → view stays open after a close (aero-view.tsx)
  - `FIXED_SIZE_MENU` → menu uses fixed sizing (aero-menu.tsx)
- **Format wrappers:** `$MAIN_FORMAT`, `$STATS_FORMAT`, `$MSG_FORMAT`, `$INPUT_FORMAT`, `$ACTION_FORMAT` / `$SEL_ACTION_FORMAT` wrap content; `%TEXT%` / `%IMAGE%` substitution.
- **New-location effects:** `$NEWLOC_EFFECT`, `NEWLOC_EFFECT_TIME`, `NEWLOC_EFFECT_SEQ` apply an effect class/animation on a location change.

Pack: an Aero game whose code sets these variables on demand (e.g. actions that flip `DISABLESHADE`, move `MSG_X`, change `FCOLOR`).

Assertion method (decided, see the design doc "Decisions made"):

- Reading a CSS custom property runs JS in the page (`page.evaluate` / `browser.execute`) — added as a reusable check, the first that reads computed style rather than text/attributes.
- The shade overlay and other class-only Aero elements get `data-qsp` hooks (small `libs/renderer` change) so they're located per the README convention.

### 2g. Resources, paths, sound (§G, §H) — done

- Images: `<img src>`, backslash path, `$BACKIMAGE` ⚠ backslash/absolute handling
- Action / object / menu images; view image
- Fonts / styles / scripts from `game.cfg` resources
- Resources loaded from inside an archive
- Case-insensitive path reference ⚠ desktop case fallback
- Sound: `play_file`, `is_play`, `close_file`, mute / volume, from archive — Pack: a game with audio
- Web CORS proxy fallback

Found and decided in 2g (defect numbers below):

- Fixed plain: every backslash in game-HTML `<img>`, CSS-variable paths, the view path and sound paths / keys (one key owner, `getFileKey`); `?query` / `#` stripped by the web service worker and the desktop protocol; the service worker sets Content-Type for known extensions only; the desktop lookup is exact, then whole-path lowercase, then per-segment case-insensitive.
- Fixed, player-visible (approved by the maintainer): absolute and `data:` URLs pass through; `game.cfg` resources load before the game starts, scripts in declared order, a failed one shows a notice and the game still starts (15 s per resource); `ISPLAY` reflects `PLAY` / `CLOSE` in the same action; the volume slider follows the volume.
- Harness added: probes `SoundState` / `SeeSoundWebAudio`, `ImageLoaded`, the game-resource count; web-only `DelayRequests` and `RouteThroughProxy`; a test asset server on 127.0.0.1:47631; fixture `resources-game`. See `apps/player-e2e/README.md`.

### 2h. Player-side integrations (§M)

_Pack: fixtures exercising settings, language and theme state._

- Shelf: remove a game; shelf survives restart
- Settings change takes effect and persists across restart
- Language switch re-renders the UI ⚠ launch notice English before translations load
- Light / dark player theme persists

## Suspected defects found while reading (unverified by running, unless marked)

1. **Sanitizer bypassed for game HTML** (confirmed in code): `transform` runs before the banned-tag check and `defaultTransform` always returns an element (html-parser.ts:84-100, template-transformers.tsx:19-25, default-transformers.tsx:63-71). The `javascript:` check is case-sensitive (GS/attributes.ts:65). `<iframe>` gets `sandbox="allow-scripts allow-same-origin"`. Possible script execution in the player's origin; on desktop that may reach Tauri IPC. Security issue, separate from Phase 2.
2. **`<form qsp-on:submit>` is dead**: `submit` is not in `supportedEvents` (R/content/attributes.ts:79), so the attribute is dropped (confirmed in code).
3. `qsp-bind` writes raw input into QSP code (quotes break it; code injection).
4. `face` → `fontFace` (not CSS), so `<font face>` is ignored.
5. Inline style values containing `:` (`url(http://…)`, `data:`) are truncated.
6. **Fixed in 2g**: backslash paths: only the first `\` was replaced for images / CSS vars; view and sound paths were not cleaned. Every backslash is now normalised in game-HTML `<img>`, CSS-variable paths, the view path and sound paths / keys.
7. **Fixed in 2g** (player-visible, approved by the maintainer): absolute `$BACKIMAGE` (`http…`) got the game base prefixed. Absolute and `data:` URLs now pass through (`prepareUrl`); the desktop XHR shim forwards external URLs to the real XHR and `readBytes` does not prefix them. The shared `isExternalUrl` needs at least 2 characters before `:`, so `C:\` stays relative.
8. **Fixed in 2g**: desktop case fallback only tried the fully lowercased path. The lookup is now exact, then whole-path lowercase (fast path), then per-segment case-insensitive (greedy, no backtracking when case-variant siblings exist). Remote / standalone web have none (a case-sensitive server).
9. **Fixed in 2g**: the service worker sent no Content-Type (SVG / fonts could fail) and captured `?query` into the path. It now strips `?query` / `#` and sets Content-Type for known extensions only (no header for unknown ones). The desktop protocol strips them too.
10. CP866 Cyrillic names in old zips likely mojibake. Still parked (2a).
11. **Fixed in 2f**: a missing `defaultTheme` in aero mode left the classic theme. It now falls back to Aero (classic in classic mode) and shows the notice (current-game.ts:152-155).
12. Saved `dark` player theme probably ignored (player-theme.ts:6-11).
13. **Fixed in 2d** (confirmed against the engine contract): slot / path restore called the engine's `loaded()` before `loadSave()`, while the `@qsp/wasm-engine` Readme says the `load_save` callback is called after `api.loadSave`. `restoreFromSlot` / `restoreFromPath` now call `loadSave()` first, then `loaded()` (save.ts:58-84). Observable on both targets, before and after the fix: after `opengame` and a slot pick the main text is the restored one (`COUNTER=1`), the code written after `opengame` (`AFTER LOAD PANEL`) is not shown, and Increment gives `COUNTER=2` (restored 1 + 1). That end state is the same under both orders. The regression test `loading from the panel opened by the game does not run the code after opengame` tells them apart: with `loaded()` first, the `msg` after `opengame` (outside the save) opened over the restored text and blocked the game; with the fix it never opens.
14. Engine events with no handler (`close`, `refresh`, `sleep`?) — not checked against the engine typings.

Found in 2e.

Fixed in 2e:

15. **Restart left the game / counter paused** when the pause screen was not open: the restart went back in history out of the game, and the counter stayed paused (current-game.ts:284-295).
16. **Counter pauses clobbered each other**: one boolean, so closing a dialog resumed a counter that another still held paused. It is now a set of pause reasons plus one token per `withCounterPaused` (counter.ts:7-56).
17. **`qspider_restart` broke with a library at start**: the restart ran inside the engine call, and the new game's async library load re-entered the engine mid-call. The command now defers the restart to the next tick (qspider-commands.ts:41-50), and a restart no longer leaves the counter paused after loading a library.
18. **Ctrl+R during a dialog** restarted the game under the open msg / input / menu and left the engine stuck inside the old call; it is now ignored while one is open (hotkeys.ts:70-80).
19. **`parseArgs` NaN**: a number after a string argument in `qspider_event` came out as NaN (qspider-commands.ts:8-38).

Open (found in 2e, not fixed):

20. The deferred `qspider_restart` ignores the dialog guard of defect 18: the guard is checked only for Ctrl+R, not when the deferred restart runs.
21. An `open_game` fetch that rejects leaves the engine waiting (qsp-api.ts:201).
22. Quit does not clear a pending wait.
23. Ctrl+R in a focused input reloads the page instead of restarting the game.
24. A modal `view` does not pause the counter, unlike msg / input / menu / wait.

Fixed in 2f:

25. **Theme script-links never executed**: the renderer rendered them as React `<script src>` elements, which are inert. They are now appended to `document.head` as real elements and removed on a theme switch or game stop (script-links.tsx:6-22).
26. **`change_theme` to an unknown name never showed its error**: it set `errorMessage$` directly, which nothing displayed. It now goes through `showError` (qspider-commands.ts:79).

Open (found in 2f, parked by the maintainer):

27. The built-in Aero theme on a classic-mode game renders blank.
28. The pre-game window size is not restored on quit, and the classic layout collapses in a very small window (from the desktop investigation).

Harness finding in 2f (fixed): the host's `GDK_SCALE` leaked into the private desktop session and collapsed the app's layout; the session now removes `GDK_SCALE`, `GDK_DPI_SCALE`, `QT_SCALE_FACTOR`, `QT_AUTO_SCREEN_SCALE_FACTOR`, `GTK_THEME` and `XCURSOR_SIZE` (`targets/desktop/run-desktop-e2e.mjs`).

Fixed in 2f′ (player-visible, approved by the maintainer):

29. **Classic theme ignored `qspgui.cfg` BackColor / FontColor / LinkColor / FontSize**: the defaults in classic.html shadowed the `--cl-*` fallback. The defaults moved to classic.css, and a unit variable with no value and no default now writes nothing (css-variables.tsx).
30. **Aero `$*_FORMAT` never applied to a game opened after startup**: the engine's `openGame(src, true)` runs `_cleanup()`, which wiped the module-level watchers (render-state.ts `createVariableAtom`). Fixed by re-subscribing on `gameOpenEpoch$` / `openGameSource`.
31. **Aero new-location effects were skipped when `$NEWLOC_EFFECT` / `NEWLOC_EFFECT_TIME` / `NEWLOC_EFFECT_SEQ` are set in the same action as the jump**: the engine emits `main_changed` synchronously and the watched variables a tick later (`setTimeout 0`). The effect is now read synchronously at `main_changed` via `newLocEffect$`.

Open (found in 2f′):

32. `qspgui.cfg` `UseFontSize=1` ("Always use selected font size": the cfg size overrides `FSIZE`; QSPFoundation/qspgui frame.cpp:397, label :573) is ignored by qSpider. Parked by the maintainer.
33. The hooks `useQspVariable` / `useQspExpression` lose their watchers after an in-game `open_game` (the engine `_cleanup`) unless their deps change. `gameOpenEpoch$` makes the fix easy (add it to the deps). The in-game `open_game` re-subscription path of defect 30 has no E2E coverage either.
34. `convertColor` (libs/utils/src/colors.ts) treats an alpha byte of 1 as fully opaque (`alpha === 1 ? 1 : alpha / 255`). Unexercised: QSP `RGB()` yields alpha 0xFF, so normal games are unaffected.
35. **Fixed in 2g**: `prepareUrl` in css-variables.tsx replaced only the first backslash (`url.replace('\\', '/')`); same family as defect 6.
36. Tooling: the root lint-staged ESLint config does not know the react-hooks rules and does not enforce the `max-lines` that `nx lint` enforces (a commit hit it, and a disable comment had to be removed). Noted only.

Fixed in 2g: defects 6, 7, 8, 9 and 35 (above), plus the player-visible changes that were not numbered defects:

- `game.cfg` resources (fonts, styles, scripts) are loaded before the game starts, scripts in declared order (`async = false`). A failed resource shows the notice "Failed to load game resources: …" and the game still starts; each resource has a 15 s timeout.
- `ISPLAY` reflects `PLAY` / `CLOSE` within the same action: Howler emits its events through `setTimeout`, so the state is now set synchronously and stale callbacks are guarded (including a stop queued during `autoResume`).
- The volume slider is controlled and follows the volume.

Open (found in 2g):

37. `normalizeVolume(1)` gives 100 %, not 1 %. Parked by the maintainer.
38. Security, with the sanitizer carve-out of defect 1 (Tauri reach): `game_uri.rs` passes `..` in relative paths, and the `read_resource` IPC takes a raw URL.
39. `runGame` cannot be cancelled: the shelf route stops a running game only if `currentGameEntry$` is set, and that happens at the end of `runGame`. A desktop drop during loading races two `runGame` calls. Pre-existing, widened by the resource await.
40. Notices share one slot: a later theme notice overwrites the resource notice.
41. Upstream `@qsp/wasm-engine`: after `PLAY 'snd\b.wav'` the engine never delivers `CLOSE 'snd/b.wav'` (the other spelling) to the player. Game-visible, not fixable in the player.
42. `PLAY` while Howler's audio context is locked allocates extra sound ids, so the sound starts twice on resume. Pre-existing.
43. Games loaded through the web CORS proxy: only text / binary fetches (`game.cfg`, entry, includes, themes) use the proxy. DOM resources (`<img>`, css `url()`, `@font-face`, Howler) resolve through `<base href>` to the unreachable origin and fail. Parked by the maintainer.
44. The web service worker decodes with `decodeURI`, the desktop protocol decodes fully, so encoded `%3F` / `%23` differ between targets.
45. The `game.cfg` font-failure path has no E2E row (only a missing script and a missing style).
