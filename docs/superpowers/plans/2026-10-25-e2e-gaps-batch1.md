# E2E gaps after unit batch 1: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Real E2E scenarios for the five behaviours #185's deleted mock specs claimed, plus fixes for UTF-16 `game.cfg` (desktop direct open, web, standalone web) and the uncaught failure of a game's own file open.

**Architecture:**

- New fixture games and archive variants in `apps/player-e2e/fixtures`. Each is built by `build-fixtures.ts`, or served by `asset-server.ts`.
- New scenarios in two new feature files plus `open-routes` and `standalone`.
- One shared BOM-aware decoder in `@qspider/utils`, used at every place that turns `game.cfg` bytes into text.

**Tech Stack:**

- Serenity/JS screenplay over Playwright (web) and WebdriverIO + tauri-driver (desktop);
- TypeScript, Vitest (unit), NX/pnpm.

**Spec:** `docs/superpowers/specs/2026-10-25-e2e-gaps-after-unit-batch1-design.md`

## Global Constraints

- The Rules in `apps/player-e2e/README.md` apply, enforced by `nx lint player-e2e`:
  - locate by `data-qsp`/`data-qa`/role only;
  - `seeEventually` with no sleeps;
  - absence checks only after a settled anchor;
  - checks that discriminate;
  - no branching inside a scenario;
  - ≤150 lines per screenplay file and ≤8 actions per fixture location.
- No test hooks in release builds. No `windowsOnly`/`linuxDesktopOnly` used to make a suite pass. No retries. No mocks.
- Defects get a red `test(...)` commit first, then a `fix(...)`. Never route a scenario around a bug.
- Fixtures are plain files. URL constants that a game spells out are kept in sync by `fixtures/build-fixtures.spec.ts`. Never read or write the repo's `public/game/`.
- Run tasks through NX/pnpm only (never vitest/playwright/wdio directly).
- Local checks are `pnpm format:check`, `pnpm nx run-many -t lint typecheck test` (touched projects), and the touched E2E specs:
  - web: `pnpm e2e:web <scenario file name>`;
  - standalone web: `pnpm e2e:standalone-web`;
  - Linux desktop: `PATH=$HOME/.cargo/bin:$PATH pnpm e2e:desktop --spec apps/player-e2e/scenarios/<file>`, one run at a time, through the runner only (never `wdio` directly);
  - standalone desktop: `PATH=$HOME/.cargo/bin:$PATH pnpm nx run player-e2e:build-desktop-standalone-e2e && PATH=$HOME/.cargo/bin:$PATH node apps/player-e2e/targets/desktop/run-desktop-e2e.mjs --standalone --spec apps/player-e2e/scenarios/standalone/standalone.scenario.ts`.
- Never touch the real desktop session, and never kill processes by name. If the a11y bus breaks, stop and report.
- No local `pnpm check:full`. Windows runs in CI only.
- Commit only your own files, by explicit path (never `git add -A`). Never bypass hooks. Never push.

## Review Focus

1. **A UTF-16 `game.cfg` on the web upload route.** It is decoded at import time (`archive-importer.ts` `readGameDescriptor`) as well as at run time (`libs/browser` `fetchTextContent`). Fixing only one gives a shelf entry that then fails to start. Task 3's web scenario goes through both.
2. **A failed game-file open leaves the game unusable.** After the error, the next action must still work (Task 4 asserts the next location's text).
3. **The error check can't pass on the `index.html` fallback.** The standalone check asserts the fetcher's own cause (`file not found`), not just the file name (Task 4).
4. **Notice count by coincidence.** The 3-game archive differs from the launch pack's 2 (Task 1).
5. **The relative XHR passes without the shim.** The mark has to carry the data file's own content, which `index.html` or a 404 can't produce (Task 6).

---

### Task 1: The "N games added to shelf" notice on the Open game and upload routes (gap 1)

**Files:**

- Modify: `apps/player-e2e/fixtures/archives.ts` (new `tripleZip`), `apps/player-e2e/fixtures/build-fixtures.ts`, plus a new 3-game `game.cfg` source (e.g. `apps/player-e2e/fixtures/triple/game.cfg` with three `[[game]]` entries reusing existing `.qsps` sources that `zipPack` can include)
- Modify: `apps/player-e2e/scenarios/open-routes.scenario.ts`
- Modify: `apps/player-e2e/README.md:138`: it still names `add-imported.spec.ts`, which #185 deleted. Say instead that the pure decision is unit-tested in `libs/game-shelf/src/import-outcome.spec.ts` and that the notice text is asserted here.

**Interfaces:**

- Produces: `ARCHIVES.tripleZip: { path: string; titles: [string, string, string] }`

- [ ] **Step 1:** Add `tripleZip`, then rework the multi-game scenario to use it. Title: `'a multi-game zip is shelved with a notice naming the count, not started'`. After `OpenGameFile(ARCHIVES.tripleZip.path)`, assert `SeeNoticeContaining(pluralTranslation('en-US', '{{ count }} games added to shelf', 3))` and `SeeShelfTitles([...ARCHIVES.tripleZip.titles])`. On desktop, `WaitNoticeGone()` comes before the open, because the launch pack shows its own notice at startup. Keep the rest of the existing multiZip scenario's checks (not started; open from shelf). If `multiZip` is then unused, remove it from `archives.ts` and `build-fixtures.ts`.
- [ ] **Step 2:** In `'re-opening the launch pack keeps one entry each'`, replace `SeeNoticeShown()` with `SeeNoticeContaining(pluralTranslation('en-US', '{{ count }} games added to shelf', TEST_PACK.titles.length))`. Drop the `SeeNoticeShown` import if it becomes unused.
- [ ] **Step 3:** Run `pnpm e2e:web open-routes` and the Linux desktop `--spec apps/player-e2e/scenarios/open-routes.scenario.ts`. Expected: all pass. Also prove that the count check discriminates: temporarily change the expected count to 2, see it fail, then revert.
- [ ] **Step 4:** Run `pnpm nx run player-e2e:lint` and `pnpm format:check`, then commit with `test(e2e): exact shelf notice on the open and upload routes`.

### Task 2: One BOM-aware text decoder in `@qspider/utils` (refactor)

**Files:**

- Create: `libs/utils/src/text.ts` and `libs/utils/src/text.spec.ts`. The three existing `decodeText` cases move here from `libs/desktop/src/lib/resource-route.spec.ts`.
- Modify: `libs/utils/src/index.ts` (export), `libs/desktop/src/lib/resource-route.ts`/`.spec.ts` (remove `decodeText`), `libs/desktop/src/lib/data-fetcher.ts` (import from `@qspider/utils`), `libs/game-state/src/utils.ts` (`convertQsps` decodes with `decodeText`).

**Interfaces:**

- Produces: `decodeText(data: Uint8Array | ArrayBuffer): string`, exported from `@qspider/utils`. It decodes UTF-16 LE when the bytes start with the BOM `FF FE`, and UTF-8 otherwise.

- [ ] **Step 1:** Move the function and its three tests unchanged. Widen the parameter to accept `ArrayBuffer`, and add one test: `decodeText(new Uint8Array([0xff, 0xfe, 0x68, 0, 0x69, 0]).buffer)` is `'hi'`.
- [ ] **Step 2:** Switch the three callers over. Behaviour stays unchanged.
- [ ] **Step 3:** Run `pnpm nx run-many -t test typecheck lint -p utils desktop game-state`. Expected: pass.
- [ ] **Step 4:** Commit with `refactor(utils): shared BOM-aware text decoder`.

### Task 3: UTF-16 `game.cfg` on every route (gap 3, the direct-open bug, and the web bug)

**Files:**

- Create: `apps/player-e2e/fixtures/utf16-game/` containing:
  - `game.cfg`: the UTF-8 source, one `[[game]]` with `styles = ["css/utf16.css"]`;
  - `utf16.qsps`: writes `'UTF16 START'`;
  - `css/utf16.css`: sets `:root { --e2e-utf16: UTF16; }`;
- Create: `apps/player-e2e/fixtures/utf16-game.ts` with the constants: the start text, and the css property and value.
- Modify:
  - `build-fixtures.ts`: a helper `utf16(text: string): Buffer` (BOM `FF FE` + `Buffer.from(text, 'utf16le')`); `ARCHIVES.utf16Zip` (its game.cfg re-encoded); `ARCHIVES.utf16Folder` (a plain folder whose `game.cfg` is re-encoded, the way `resourcesFolder` is built);
  - `archives.ts`;
  - `targets/standalone/stage-public.ts`: the staged standalone `game.cfg` is re-encoded with the same helper. Put the helper where both can import it without test-framework imports, e.g. `fixtures/utf16.ts`;
  - `build-fixtures.spec.ts`: one case asserting that the built `utf16Zip` `game.cfg` and the staged standalone one start with `FF FE`.
- Create: `apps/player-e2e/scenarios/text-encodings.scenario.ts`.
- Fix (separate commit):
  - `libs/browser/src/lib/data-fetcher.ts` `fetchTextContent`;
  - `libs/importers/src/lib/archive-importer.ts` `readGameDescriptor`;
  - `libs/importers/src/lib/url-importer.ts` (both cfg reads);
  - `apps/player-standalone/src/app/config-runner.ts`;
  - `libs/desktop/src/lib/desktop-importer.ts:38`.
  - Each decodes the bytes with `decodeText` (read `arrayBuffer()`, not `text()`).

**Interfaces:**

- Consumes: `decodeText` (Task 2).
- Produces: `ARCHIVES.utf16Zip`, `ARCHIVES.utf16Folder` (with `configPath`), `UTF16_GAME`.

- [ ] **Step 1:** Before anything else, check that nothing in the standalone build tooling (`tools/standalone-config`, `apps/player-standalone/vite.config.mts`) parses the staged `game.cfg`. If something does, stop and report: the spec makes that the maintainer's call.
- [ ] **Step 2:** Add the scenarios:
  - `'a UTF-16 game.cfg inside an archive is read'` (both targets): `LoadGame(ARCHIVES.utf16Zip.path)`, `SeeGameStarted(UTF16_GAME.text.start)`, `SeeCssValue` of `--e2e-utf16` equal to `UTF16`. The styles only apply if the cfg was decoded: a cfg that fails to decode falls back silently with no styles.
  - `scenario.desktopOnly('a UTF-16 game.cfg opened directly is read', …)`: `OpenGameFile(ARCHIVES.utf16Folder.configPath)`, then the same two checks.
- [ ] **Step 3:** Run them, plus `pnpm e2e:standalone-web`. Expected RED:
  - the web archive scenario;
  - the desktop direct-open scenario;
  - standalone web, whose existing scenarios now get a UTF-16 cfg.
  - The desktop archive scenario may also be red, because the archive import decodes in `readGameDescriptor`. Record which scenario failed, and how, in the report.
- [ ] **Step 4:** Commit the fixtures, staging and scenarios with `test(e2e): UTF-16 game.cfg on every route`.
- [ ] **Step 5:** Apply the fix at the five sites listed under Files.
- [ ] **Step 6:** Run the new scenarios on web and Linux desktop, `pnpm e2e:standalone-web`, and the standalone desktop suite. Expected: all pass. Also run `pnpm nx run-many -t test typecheck lint -p browser importers desktop player-standalone player-e2e`.
- [ ] **Step 7:** Commit with `fix: read UTF-16 game.cfg on the web, standalone web and desktop direct open`.

### Task 4: A game's own failed file open (gap 2 and the uncaught `open_game` failure)

QSP's `inclib 'file'` raises the engine's `open_game(path, isNewGame=false, onOpened)` event, which is handled in `libs/game-state/src/qsp-api.ts` (around line 212). (`opengame` without a file is the save-load command, a different event.) Today a fetch rejection inside `withCounterPaused(...)` is uncaught, and `onOpened` is never called.

**Files:**

- Modify:
  - `apps/player-e2e/fixtures/includer/` source `.qsps`: an action `'Include missing'` running `inclib 'missing.qsps'`, then shown text `'AFTER MISSING'`; plus the label and text constants in its `*-game.ts` (create that module if the includer has none);
  - `apps/player-e2e/fixtures/standalone/standalone.qsps`: on `start`, an action `'Include missing'` running `inclib 'missing.qsps'`; plus `STANDALONE_GAME.action.includeMissing`.
- Create: `apps/player-e2e/scenarios/game-file-loading.scenario.ts`.
- Modify: `apps/player-e2e/scenarios/standalone/standalone.scenario.ts`.
- Fix: `libs/game-state/src/qsp-api.ts` `open_game` handler.

- [ ] **Step 1:** Add the scenarios:
  - `'a game file that fails to open shows an error and the game goes on'` in `game-file-loading.scenario.ts` (both targets): load the includer zip, act `'Include missing'`, `SeeErrorAlertText('Failed to open missing.qsps')`, then act `'Go …'` or any following action, and see its text. Read the includer fixture for the right action; add one if none exists.
  - `scenario.desktopOnly('a missing bundled file is rejected, not served as the page', …)` in `standalone.scenario.ts`: act `'Include missing'`, `SeeErrorAlertText('missing.qsps: file not found')` (the cause from `read_app_asset`, `src-tauri/src/main.rs`; read the exact text there and use it), then act `'Go to room'` and `SeeMainText('ROOM counter=0')`.
- [ ] **Step 2:** Run them. Expected RED: no error alert. Record what actually happens (hang, nothing, console only) in the report. Commit with `test(e2e): a game's failed file open`.
- [ ] **Step 3:** Fix the handler.
  - Catch a rejection from loading or converting the file, then `showError(`Failed to open ${file}: ${message}`)`, where `message` is the error's message.
  - Then call `onOpened()`, so the engine continues the statement as if the include added nothing. Confirm against `@qsp/wasm-engine`'s `open_game` contract (`dist/contracts/events.d.ts`) that this is the supported way to finish the call. If it isn't, report before choosing another.
  - Keep the counter-pause behaviour.
- [ ] **Step 4:** Run the scenarios on web, Linux desktop and standalone desktop, plus `pnpm e2e:standalone-web` (the standalone scenario is `desktopOnly`, so it is skipped there). Expected: pass. Also run the existing `open-routes` includer scenario. Commit with `fix(game-state): show an error when a game's own file open fails`.

### Task 5: Desktop fetch of an external URL, and its rejection (gap 4)

The reachable product path: a `game.cfg` `themes = ["http://…"]` goes through `registerThemes` → `fetchTextContent` → the desktop network route (`libs/desktop/src/lib/data-fetcher.ts`, `!response.ok` → `Failed to load <url>: <status>`). `runGame` reports a thrown error as a notice (`current-game.ts`, `showNotice(e.message)`).

**Files:**

- Modify: `apps/player-e2e/fixtures/asset-server.ts`: serve `/ext-theme.html` (`text/html`), a theme file defining the alias `e2e-ext` in the shape of `fixtures/themed-game/e2e-theme.html` (the smallest valid theme). Add `ASSET_SERVER.paths.theme` and a constant for the 404 path `/missing-theme.html`.
- Create: `apps/player-e2e/fixtures/external-theme-game/`, holding:
  - `game.cfg`, with `themes = ["http://127.0.0.1:47631/ext-theme.html"]` and `defaultTheme = "e2e-ext"`;
  - `game-404.cfg`, with the 404 URL;
  - a `.qsps` with start text.
  - It also needs constants and `ARCHIVES.externalThemeZip` / `externalTheme404Zip`, built through the variant pattern (`[ARCHIVES.x, 'game-404.cfg']`).
- Modify: `build-fixtures.spec.ts`: the cfg-spelled URLs equal `assetUrl(...)` of the server's paths.
- Modify: `game-file-loading.scenario.ts`.

- [ ] **Step 1:** Add `scenario.desktopOnly('a theme from an external URL is applied', …)`: `LoadGame(externalThemeZip)`, `SeeGameStarted(...)`, `SeeActiveTheme('e2e-ext')`.
- [ ] **Step 2:** Add `scenario.desktopOnly('a theme URL that answers 404 is reported', …)`: `LoadGame(externalTheme404Zip)`, `SeeNoticeContaining(`${assetUrl('/missing-theme.html')}: 404`)`.
- [ ] **Step 3:** Run on Linux desktop. Expected: both pass, because this is existing behaviour. Prove the 404 check discriminates by temporarily expecting `: 500` and seeing it fail. Commit with `test(e2e): external theme fetch and its 404 on desktop`.
- [ ] **Step 4:** Windows is unverified until CI runs: a `https://qsp.localhost` page fetches `http://127.0.0.1`. Note that in the report. The controller checks the Windows result on the PR.

### Task 6: A game's own relative XHR through the Linux shim (gap 5)

The shim is in `libs/desktop/src/lib/setup.ts` (`XMLHttpRequestShim`). Its `responseText` returns `''` while replacing a request, so the script must read `xhr.response`.

**Files:**

- Modify: `apps/player-e2e/fixtures/resources-game/`:
  - a new `data/rel.txt` with the content `REL TEXT`;
  - `js/one.js`: a handler for a new event `res_xhr_rel`. It runs `xhr.open('GET', 'data/rel.txt')` with `responseType = 'arraybuffer'`, decodes `xhr.response` with `TextDecoder`, and writes the mark `xhr-rel` with that text;
  - `resources-game.qsps`: a media action `'Fetch relative'` firing `exec 'qspider.event:res_xhr_rel'`. That makes 8 actions on media; if the count is already 8, put it on a new location;
  - `fixtures/resources-game.ts`: the constants;
  - `build-fixtures.ts`: the zip and folder include `data/rel.txt`.
- Modify: `game-file-loading.scenario.ts`.

- [ ] **Step 1:** Add `scenario.desktopOnly("a game script's relative request reads the game's file", …)`: `LoadGame(ARCHIVES.resourcesZip.path)`, go to media, act `'Fetch relative'`, then `SeeResourceMark('xhr-rel', 'REL TEXT')`.
- [ ] **Step 2:** Run on Linux desktop. Expected: pass. Prove the scenario depends on the shim by temporarily making `shouldShimXhr` return false locally (never commit this). It must fail, with the mark showing something other than `REL TEXT`. Revert, then confirm that `git diff libs/` is empty.
- [ ] **Step 3:** Commit with `test(e2e): a game's relative XHR on desktop`.
