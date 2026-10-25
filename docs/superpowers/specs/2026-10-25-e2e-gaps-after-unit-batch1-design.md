# E2E gaps left by unit batch 1

Follow-up to Phase 4 PR 1 (#185, merged 2026-10-25), per `2026-10-25-unit-tests-phase4-design.md`.

## Intent

#185 deleted the mock-based unit specs `add-imported`, `data-fetcher`, `setup` and `game-url`. Their pure parts were rewritten as unit tests without mocks. Five integration behaviours they claimed to cover are now proven by nothing. A mock-based check is not accepted as coverage (memory `engine-integration-real-e2e`), so each one gets a real E2E scenario. The goal is the same as for all test work: change the code without fear.

## Decided by the maintainer

- A separate PR, right after #185.
- **The UTF-16 direct-open case is a bug, fixed in this PR.** Opening a `game.cfg` directly on desktop (Open game, drop, or launch with `--file=`) decodes it as UTF-8 only (`libs/desktop/src/lib/desktop-importer.ts`, `new TextDecoder().decode(content)`). The same file inside an archive or folder goes through `fetchTextContent`, whose `decodeText` handles a UTF-16 LE BOM. Commit order: a red `test(...)` scenario first, then a `fix(...)` that decodes with the same `decodeText` (from `resource-route.ts`).
- **The web player has the same bug, and it is fixed in this PR too.** `libs/browser/src/lib/data-fetcher.ts` `fetchTextContent` returns `r.text()`, which always decodes UTF-8, so a UTF-16 `game.cfg` that works on desktop fails in the web and standalone web players. The fix: both platforms decode text with one shared BOM-aware decoder. Claude's call: move `decodeText` from `libs/desktop/src/lib/resource-route.ts` to `@qspider/utils`, keep its unit test with it, and have both fetchers and the desktop direct-open path use it. The commit order is again a red `test(...)` first, then the `fix(...)`.
- The rules from earlier phases apply unchanged (listed under Constraints).

## The five behaviours and how each is proven

The scenarios live in `apps/player-e2e`. "Desktop" means the Linux and Windows desktop suites; `scenario.desktopOnly` runs on both. The rejection cases below rely on today's behaviour, checked in `libs/game-state/src/current-game.ts`: a theme file that fails to load throws out of `registerThemes`, so the game doesn't start and the player shows its error. If the theme file instead comes back as unrelated HTML, there's no error; a `defaultTheme` it should have defined just produces the notice `Theme <name> not found`.

1. **"N games added to shelf" notice: text and count.** Already asserted exactly on the desktop launch route (`launch.scenario.ts`, `language.scenario.ts`). Not asserted on the Open game / web upload route: `open-routes.scenario.ts` uses `SeeNoticeShown()` (any notice) or no notice check at all.
   - Strengthen those checks to `SeeNoticeContaining(pluralTranslation('en-US', '{{ count }} games added to shelf', n))`, on web and desktop.
   - Add a 3-game archive fixture so that the count can't match by coincidence: the multi-game zip and the launch pack both hold 2 games.
   - On desktop, the launch pack raises the same kind of notice at startup. Claude's call: the 3-game count (against the pack's 2) is what discriminates. The existing `WaitNoticeGone` before the open is kept as an extra guard.
2. **Standalone desktop rejects a missing bundled file instead of serving `index.html`.**
   - There is one standalone build. It bundles one `game.cfg`, and the player starts only its first game. So the observable route is the game itself: a new action in the bundled `standalone.qsps` runs `opengame` on a file that isn't bundled.
   - This depends on the `opengame` fix below. Expected: the player's error names the missing file, and the current game keeps running. A later action still works and its text appears.
   - If the request were answered with `index.html`, the player would try to run HTML as a game, and the error and the text checks would come out differently.
   - Runs in `standalone-desktop` only (`desktopOnly` in the shared standalone scenarios). Standalone web is served by vite preview, whose SPA fallback is exactly the `index.html` behaviour, and it uses a different fetcher.
3. **UTF-16 LE `game.cfg` with BOM, on every desktop route.**
   - Fixtures are generated at build time (BOM `FF FE` + `Buffer.from(text, 'utf16le')`), not committed as binaries.
   - Each config sets something a scenario can see: a stylesheet checked with `SeeCssValues`, or a `defaultTheme` checked with `SeeActiveTheme`. A config that fails to decode falls back silently, so the scenario has to look for something the config sets.
   - Routes:
     - (a) a UTF-16 cfg inside an archive or folder game (qsp route), desktop;
     - (b) a UTF-16 cfg opened directly (the bug above), desktop;
     - (c) the bundled standalone game (app-asset route). Claude's call: the standalone fixture's own `game.cfg` is staged as UTF-16 LE with a BOM. There is only one standalone build, so that cfg is the only one available. Its existing scenarios (default theme, game styles, game script mark) then prove the decoding on `standalone-desktop` and, after the web fix, on `standalone-web`, with no extra build. The UTF-8 source file stays in git, and `stage-public.ts` re-encodes it. First check that nothing in the standalone build tooling (`tools/standalone-config`, the vite config) parses the staged `game.cfg`.
     - (d) web: a UTF-16 cfg inside an archive and opened through the web route, `webOnly` or shared with (a).
   - The network route can't receive a `game.cfg` through any product path, so it's out of scope.
4. **Desktop fetch of an external URL, and its rejection on a non-ok response.**
   - The reachable product path is a theme listed in `game.cfg` as an `http://` URL (`registerThemes` → `fetchTextContent` → the network route).
   - Uses the existing `fixtures/asset-server.ts` (127.0.0.1:47631; any unknown path is a 404). It is already started for the desktop and standalone-desktop suites.
   - Success: a served theme file (new entry in the server's `files` map) becomes the active theme.
   - Rejection: a theme URL that 404s shows the player's error. Claude's call: the check asserts that the error text names the URL and the status `404`, so a request that is blocked can't pass as a 404.
   - The scenario runs `desktopOnly`. On Windows the page origin is `https://qsp.localhost`. Fetching `http://127.0.0.1` should be allowed there (loopback is a trustworthy origin), but that is unverified until CI runs. If Windows blocks it, it's a finding to bring back to the maintainer, not to skip.
5. **A game's own relative XHR through the Linux XHR shim.**
   - The resources game gets a data file (e.g. `data/rel.txt`) and a script handler that runs a relative `xhr.open('GET', 'data/rel.txt')` and writes the content into an `e2e-marks` mark, read with `SeeResourceMark`.
   - The shim's `responseText` returns `''`, so the script reads `xhr.response` (e.g. `responseType = 'arraybuffer'`, then decode).
   - Without the shim, the request would go to the page origin and the mark would differ. On Linux this proves the shim. On Windows (shim off, native https route) the same scenario guards against regressions. `desktopOnly`.

## Goals, non-goals, anti-goals

- Goals: each of the five has a scenario that fails if the behaviour breaks; the UTF-16 `game.cfg` bug is fixed on desktop direct-open and on the web; and the uncaught `opengame` failure is fixed.
- **The maintainer decided to fix the uncaught `opengame` failure in this PR.** When a game's own `opengame` names a file that fails to load (`libs/game-state/src/qsp-api.ts`, `open_game` handler), the rejection is uncaught today. `onOpened` is never called, and the game probably hangs with no message. After the fix, the player shows its error naming the file, the current game keeps running, and the engine isn't left waiting. The builder reads the engine contract (what `onOpened` and the engine state need on failure) and confirms the current behaviour with the red scenario first. The commit order is a red `test(...)` (the gap 2 scenario, plus a web or desktop variant if the failure is the same there), then the `fix(...)`. This changes behaviour players see, and the maintainer approved it.
- Non-goal: macOS behaviour of the shim (no macOS E2E suite).
- Anti-goals:
  - no test hooks in release builds;
  - no `windowsOnly`/`linuxDesktopOnly` used to make a suite pass;
  - no retries without a documented cause;
  - no scenario that routes around a bug;
  - no mocks.

## Constraints

- README Rules of `apps/player-e2e`:
  - locate by `data-qsp`/`data-qa`/role only;
  - `seeEventually` with no sleeps;
  - absence checks only after a settled anchor;
  - checks that discriminate;
  - no branching inside a scenario;
  - ≤150 lines per screenplay file and ≤8 actions per fixture location.
- Fixtures are plain files built by `build-fixtures.ts`. `build-fixtures.spec.ts` keeps URL constants spelled in game code in sync. Never read or write the repo's `public/game/`.
- Run tasks through NX/pnpm only. Local runs:
  - format check, lint, typecheck;
  - the touched web specs;
  - the touched Linux desktop and standalone-desktop specs through `run-desktop-e2e.mjs`, one run at a time, `$HOME/.cargo/bin` first on PATH, in the private session.
- Windows runs only in CI.
- CI is the gate. Watch only the job being iterated on.
- Plain branch in the main checkout. Push and open a PR. Merge only when the maintainer says so.

## Left to the builder

- Fixture names, and whether the standalone variants are extra staged configs or a second standalone fixture. This depends on how `stage-public.ts` and the standalone build consume `game.cfg`. Check that the standalone build tooling accepts a UTF-16 `game.cfg`. If it doesn't, bring it back to the maintainer before working around it.
- What exactly each UTF-16 config makes visible (stylesheet vs theme).
- Which existing scenario files get the new scenarios, within the file limits. Claude's call: if the resources game already has 8 actions at its location, the relative-XHR action goes in a new location.
- Whether the error surface is asserted through an existing check (e.g. the `error-alert` hook) or a new `See…` check.
