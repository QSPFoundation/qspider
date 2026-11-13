# Debugger in the desktop player, bundled editor, debugger E2E

Date: 2026-11-13. A medium change; short design.

## Intent

The F12 debugger (`libs/debugger`) only exists in the web player. It was wired only into
`apps/player/src/app/app.tsx` in 31f04950. Game authors test from their own disk, which is where the desktop player
fits best, but they don't get the debugger there. The debugger's code viewer also downloads Monaco from
cdn.jsdelivr.net at runtime (`@monaco-editor/react` with no loader config), so it can't show code offline. Nothing
in the debugger has E2E coverage. The why: authors get the debugger in the desktop player, and the maintainer can
change the debugger without fear.

## Decisions (maintainer's)

1. The editor is bundled into the app for **every** player that has the debugger, and loaded on first use. It goes
   in the debugger's lazy chunk, which the first F12 fetches. Nobody downloads it before opening the debugger, and
   nothing comes from a CDN.
2. The seven E2E scenarios below are the agreed scope.
3. The standalone players (web and desktop) do **not** get the debugger, because they ship one game to players.

## Goals

- The desktop player (`apps/player-desktop`) wraps its root in `<Debugger>` like the web player. F12 opens the
  panel there.
- `monaco-editor` (already a dependency) is imported by the debugger's editor module, and `@monaco-editor/react`'s
  `loader.config({ monaco })` points it at the bundled copy. Only the base editor worker is bundled (via Vite's
  `?worker` import and `self.MonacoEnvironment.getWorker`). The QSP language is our own, so no TS/JSON/CSS/HTML
  workers are needed.
- Monaco and its worker land only in lazy chunks. The players' entry chunks don't grow by more than a few KB. The
  builder checks this once, by hand, in the build output and records the before and after entry chunk sizes in the PR.
  No automated test or CI check for chunk sizes (maintainer's call).

## Non-goals

- No new debugger features (variables come later).
- No debugger in the standalone players.
- No change to how the web service worker caches. It doesn't precache build assets, so the lazy chunk is fetched
  only on use.

## E2E (agreed scope)

These run on web and desktop like the rest of the suite. They need a new fixture game `debugger/`: two locations,
one action, one link. The README Rules apply: the area is `debugger` (`screenplay/debugger/` with `elements.ts`,
`tasks.ts`, `checks.ts`), and the scenarios go in `scenarios/debugger.scenario.ts`.

1. **Open and close:** F12 opens the panel; the close button and F12 close it.
2. **Code:** selecting a location shows its code in the editor, and the action code tab shows the action's code.
3. **Stepping:** with debug mode on, a breakpoint on a location pauses when the game reaches it. Step advances,
   and resume lets the game continue.
4. **Event log:** an action shows up in the log, and clear empties it.
5. **Auto-pause on links:** with it on, clicking a link pauses before its code runs.
6. **Dock:** moving the dock to the left survives a player restart (the position is kept in localStorage).
7. **The editor comes from the app:**
   - Web: Playwright blocks `cdn.jsdelivr.net`, and the code still shows.
   - Desktop: the code shows, and the page has no `<script>` whose `src` points at `cdn.jsdelivr.net`.
   - CI runners are online, so "the code shows" alone would prove nothing.

## Constraints and risks

- **F12 on Windows.** The desktop build enables Tauri's `devtools` feature, and WebView2 may take F12 for its own
  devtools. Scenario 1 on the Windows desktop CI job must prove that F12 opens our panel. If it doesn't, the
  builder finds the root cause (for example the order in which accelerator keys are handled). They don't work
  around it by picking another key unless the maintainer agrees.
- **Breakpoints through the editor gutter** may be fragile under WebdriverIO. Scenario 3 sets the breakpoint
  through the panel's own controls if those exist. If only the gutter click exists, try it on desktop first, and
  if it can't be made reliable, ask the maintainer before narrowing it to web only.
- There is no local desktop E2E (house rule): desktop scenarios are proved on CI. The local run is the web E2E for
  the new spec.
- Monaco's ESM package needs Vite worker handling in both app configs (`apps/player`, `apps/player-desktop`). The
  debugger lib's own Vitest browser tests must keep passing.

## Approaches

|                      | (a) Bundled everywhere, lazy (picked) | (b) Bundled on desktop only via `@qspider/env` | (c) Keep the CDN |
| -------------------- | ------------------------------------- | ---------------------------------------------- | ---------------- |
| Desktop offline      | works                                 | works                                          | broken           |
| Web offline          | works                                 | broken (CDN)                                   | broken           |
| Code paths           | one                                   | two (env split)                                | one              |
| Cost to web visitors | none until the first F12              | none                                           | none             |

The maintainer picked (a). It's one code path, and the lazy chunk keeps the cost on people who open the debugger.

## Left to the builder

- Exact file split for the Monaco setup inside `libs/debugger` (it must stay inside the lazy chunk).
- The fixture's QSP content and the element locators. Prefer `data-qa` marks added to the debugger components
  where no role or label fits.
