# Unit tests for pure functions, batch 1 (PR 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every pure function in `utils`, `importers`, `game-shelf`, `desktop`, `debugger`, `i18n`, `apps/player`, `apps/player-standalone` and `apps/player-desktop` has a unit test without mocks. The seven mock-based specs are rewritten, except `e2e-marks`, which is deferred to PR 2.

**Architecture:** Each project runs its tests through the `@nx/vitest` inferred `test` target in the `node` environment. When a pure function sits in a file with heavy imports (`@qspider/game-state`, `@qspider/env`, Tauri, `history`, i18next setup, or a service worker's top-level side effects), it moves into a small new file that imports only pure modules. The original file then imports it from there. Tests call the pure functions directly with real inputs.

**Tech Stack:** Vitest 5.0.5, NX 23 (`@nx/vitest` plugin), TypeScript, xoid.

**Spec:** `docs/superpowers/specs/2026-10-25-unit-tests-phase4-design.md`

## Global Constraints

- **No `vi.mock`, `vi.fn`, `vi.spyOn` or `vi.stubGlobal` in any spec.** The only test double allowed is fake timers (`vi.useFakeTimers`).
- **Unit tests cover pure logic only.** Integration (engine, storage, Tauri, file system, network) stays E2E.
- **Refactors are pure moves or extractions.** They go in their own `refactor(<project>): …` commit, before the `test(<project>): …` commit that uses them, and they don't change player-visible behaviour.
- **Tests describe behaviour.** Use real inputs and exact expected values. No snapshot tests. Name each `it` as a behaviour sentence, matching the existing specs (e.g. `'detects the ZIP local-file signature'`).
- **Defects:** when the current output looks wrong for an input a real game or user could produce, don't pin it as expected.
  - First add a failing test as its own `test(...)` commit.
  - Then report it as DONE_WITH_CONCERNS and stop that function. The controller decides on the fix.
  - Don't fix anything that changes rendered output, parsed layout or game behaviour without that decision.
  - A crash on impossible input, dead code or an internal-only fix may be fixed in the same task, in a `fix(...)` commit after the red test.
- **Deleting a mock-based assertion:** do it only after naming the E2E scenario (file and `it`/scenario title under `apps/player-e2e/scenarios/`) that covers that behaviour. If none does, keep a note in the report and flag it as a concern. The controller asks the maintainer.
- **Data tables are not tested** (MIME maps, `EVENT_SIGNATURES`, `QSP_PANEL_NAMES`, locale lists). Functions that read them are tested.
- **Tasks run through NX/pnpm only:** `pnpm nx test <project>`, `pnpm nx typecheck <project>`, `pnpm nx lint <project>`, `pnpm format:check`. Never invoke vitest directly.
- **Spec files are typechecked.** A project's `typecheck` target also runs `tsc -p tsconfig.spec.json --noEmit`, following `libs/utils` (its `project.json` and `tsconfig.spec.json`). Add this to every project the plan touches that lacks it.
- **Git:** stage only the task's own files (never `git add -A`) and never bypass hooks. Don't push. Don't run desktop E2E, `check:full` or any wdio/playwright command. Never read or write `public/game/`.
- **Files stay focused:** one responsibility per new file. Specs go next to their source as `<name>.spec.ts`.

## Review Focus

1. **Archives:** a game file in a subfolder (`sub/game.qsp`), both `.qsp` and `.qsps` at one level, and the descriptor found below the root. Users import real archives shaped like this. Pinned in Task 2.
2. **URLs carrying `?query` or `#hash`,** such as an imported URL, the standalone config URL or a service-worker resource path. These must be stripped before naming or locating files. Pinned in Tasks 2, 7 and 8.
3. **Windows-style backslash paths and uppercase extensions** in resource paths (`IMG\A.PNG`). Pinned in Tasks 4 (`resolveResourceUrl`) and 8 (`contentTypeOf`).
4. **`resolvePath` with `..` that climbs above the start,** and absolute second paths. Games link resources relatively. Pinned in Task 1.
5. **UTF-16LE files with a BOM** (old `.cfg`/`.xml` written on Windows), which must decode the same on every route. Pinned in Tasks 4 (`decodeText`) and 8 (`isUtf16Le`).

---

### Task 1: `libs/utils`

**Files:**

- Test: `libs/utils/src/colors.spec.ts`, `common.spec.ts`, `hash.spec.ts`, `throttle.spec.ts`, `toml.spec.ts`
- Modify: `libs/utils/src/path.spec.ts` (add `cleanPath` cases if missing)

**Interfaces:** none new.

Functions to cover: `convertColor`, `invertColor`, `getContrastColor`, `defer`, `resolvePath`, `hashString`, `prepareBaseUrl`, `cyrb53`, `throttle`, `parseToml`, `cleanPath`, `isExternalUrl` (already tested). Not pure, so skipped: `isTouchDevice` (reads `window`/`navigator`), `fetchProxyFallback` (network), `noop`.

- [ ] **Step 1: Write the specs.** Required cases, with expected values taken from running the code mentally. If one looks wrong, apply the defect rule.
  - `convertColor`:
    - `0` → `null`;
    - `0xff0000ff`, with and without alpha. The int is read big-endian as `[alpha, blue, green, red]`, so `0xff0000ff` with alpha is `'rgba(255,0,0,1)'`. If it isn't, apply the defect rule.
    - alpha byte `1` → alpha `1`; alpha byte `128` → `128/255`;
    - `withAlpha=false` → `rgb(...)`.
  - `invertColor('#ffffff')` → `'#000000'`. `getContrastColor('#ffffff')` → `'black'`; `getContrastColor('#000000')` → `'white'`.
  - `defer`: `resolve(1)` makes `promise` resolve to `1`, and `reject(new Error('x'))` rejects it.
  - `resolvePath`:
    - `('a/b/c.html', 'd.png')` → `'a/b/d.png'`;
    - `('a/b/', '../d.png')` → `'a/d.png'`;
    - `('a/b/c', './d')` → `'a/b/d'`;
    - `('a/b', '/x/y')` → `'/x/y'`;
    - a trailing-slash second path is preserved;
    - `..` above the root (`('a/', '../../x')`): pin the current output, or apply the defect rule if it's nonsense.
  - `hashString`: deterministic, `''` → `0`, and two different strings give different values.
  - `cyrb53`:
    - deterministic hex string;
    - a seed changes the result;
    - pin one known value. Compute it once and assert the literal, so that a refactor which changes the hash breaks the test. Game ids derive from it, and changing them would orphan saved games.
  - `prepareBaseUrl`:
    - `'https://a.org/games/x.qsp?v=1#h'` → `'https://a.org/games/'`;
    - `'https://a.org'` → `'https://a.org/'`;
    - `'https://a.org/dir/'` → `'https://a.org/dir/'`.
  - `throttle` (fake timers):
    - it calls through once, returns the first result for calls within `limit`, and calls again after `limit` ms;
    - it passes `this` and the arguments through.
  - `parseToml`:
    - parses a `[[game]]` table;
    - CRLF and lone-CR content parses the same as LF.

- [ ] **Step 2: Run** `pnpm nx test utils` and expect PASS. A new test that fails is a defect: follow the rule.
- [ ] **Step 3: Run** `pnpm nx typecheck utils && pnpm nx lint utils && pnpm format:check` and expect all to pass.
- [ ] **Step 4: Commit:** `test(utils): cover every pure helper`.

### Task 2: `libs/importers`, the archive tree and the shelf-entry builders

**Files:**

- Create: `libs/importers/src/lib/archive-tree.ts`, `archive-tree.spec.ts`, `import-entries.ts`, `import-entries.spec.ts`, `libs/importers/tsconfig.spec.json`
- Modify: `libs/importers/src/lib/archive-importer.ts`, `url-importer.ts`, `file-importer.ts`, `libs/importers/project.json` (spec typecheck)

**Interfaces:**

- **Produces, in `archive-tree.ts`** (it imports only `GAME_DESCRIPTOR_NAME` from `@qspider/contracts` and `import type { FileDir, File } from './utils'`):
  - `findRootDescriptorFolder(root: FileDir): [FileDir, Uint8Array] | null`
  - `findRootGameFileFolder(root: FileDir): [FileDir, string] | null`
  - `getGameFolder(root: FileDir, filename: string): FileDir`

  These are the three functions from `archive-importer.ts`, moved unchanged and exported.

- **Produces, in `import-entries.ts`** (it imports only `@qspider/contracts` types and `cyrb53` from `@qspider/utils`):
  - `splitGameUrl(url: string): { cleanUrl: string; base: string; fileName: string }`: strips the hash and search; `base` runs up to and including the last `/`; `fileName` is the rest.
  - `descriptorEntry(descriptor: GameDescriptor, loadConfig: GameShelfEntry['loadConfig']): GameShelfEntry`: the mapping used by `importArchive`'s descriptor branch. It copies `id`, `mode`, `title`, `author`, `ported_by`, `version` and `description`. `icon` is `loadConfig.url + descriptor.resources.icon` when set, and `loadConfig` is `{ ...loadConfig, descriptor }`.
  - `archiveFallbackEntry(archiveName: string, loadConfig: GameShelfEntry['loadConfig'], rootDescriptor?: GameDescriptor): GameShelfEntry`: the `importArchive` branch for a root game file.
    - The title is `rootDescriptor.title`, or else the decoded last path segment of `archiveName`.
    - The mode is `rootDescriptor.mode`, or else `'aero'` if `archiveName` ends with `aqsp`, or else `'classic'`.
    - The icon is prefixed as above.
  - `archiveGameId(archiveName: string, rootDescriptor?: GameDescriptor): string`: returns `rootDescriptor?.id || cyrb53(archiveName)`.
  - `urlConfigEntry(found: GameDescriptor, base: string): GameShelfEntry` and `urlFallbackEntry(cleanUrl: string, base: string, fileName: string, rootDescriptor?: GameDescriptor): GameShelfEntry`: the two returns in `importUrl`'s non-`.cfg` branch.
  - `fileEntry(fileName: string, loadConfig: GameShelfEntry['loadConfig']): GameShelfEntry`: the `importFile` return, where `id` is `cyrb53(fileName)`.
- **Consumes:** nothing from other tasks.

- [ ] **Step 1: Refactor.** Move the three tree functions into `archive-tree.ts` and add the builders to `import-entries.ts`. Make `archive-importer.ts`, `url-importer.ts` and `file-importer.ts` call them, so the output is identical field for field and every field keeps its order. Then run `pnpm nx test importers && pnpm nx typecheck importers`, and expect PASS. Commit: `refactor(importers): archive tree search and shelf-entry builders in their own files`.
- [ ] **Step 2: Write `archive-tree.spec.ts`.** Build `FileDir` trees inline, using a helper `dir(name, ...content)` and `file(name)`. Required cases:
  - the descriptor at the root;
  - the descriptor only in `a/b/`, which returns that folder;
  - the root descriptor found before a nested one;
  - `findRootGameFileFolder`:
    - prefers `.qsp`/`.gam` over `.qsps` at the same level;
    - takes `.qsps` alone;
    - descends into the first matching dir;
    - returns `null` when there is no game file;
  - `getGameFolder`:
    - `'game.qsp'` gives the root;
    - `'sub/inner/game.qsp'` gives the nested dir;
    - a missing dir throws `'Failed to find game file sub/game.qsp in archvive'`. The typo in the message is current behaviour; pin it.
- [ ] **Step 3: Write `import-entries.spec.ts`.** Required cases:
  - `splitGameUrl('https://a.org/g/game.qsp?x=1#y')` → `{ cleanUrl: 'https://a.org/g/game.qsp', base: 'https://a.org/g/', fileName: 'game.qsp' }`;
  - `archiveFallbackEntry` with no descriptor:
    - `'https://a.org/My%20Game.aqsp'` → title `'My Game.aqsp'`, mode `'aero'`;
    - `'x.zip'` → `'classic'`;
  - descriptor values override the defaults;
  - the icon is prefixed with `loadConfig.url` only when the descriptor has one;
  - `archiveGameId` prefers the descriptor id, and otherwise is stable for the same name;
  - `urlFallbackEntry` with no descriptor: the title is `fileName`, the mode `'classic'`, the id `cyrb53(cleanUrl)`, and `loadConfig.entrypoint` is `fileName`;
  - `urlConfigEntry` maps `found.file` to `entrypoint`;
  - `fileEntry`: the id is `cyrb53(fileName)` and the title is `fileName`.
- [ ] **Step 4: Wire the spec typecheck.** Copy `libs/utils/tsconfig.spec.json`, adjusting paths, and add `tsc -p tsconfig.spec.json --noEmit` to `libs/importers/project.json`'s `typecheck` commands.
- [ ] **Step 5: Run** `pnpm nx test importers && pnpm nx typecheck importers && pnpm nx lint importers && pnpm format:check`, and expect all to pass.
- [ ] **Step 6: Commit:** `test(importers): archive tree search and shelf-entry builders`.

### Task 3: `libs/game-shelf`, the shelf state, pending writes, import outcome and catalog rules

**Files:**

- Create:
  - `libs/game-shelf/src/shelf-state.ts` and its spec;
  - `pending-writes.ts`, replacing the spec's subject, so `pending-writes.spec.ts` is rewritten;
  - `import-outcome.ts` and its spec;
  - `catalog-rules.ts` and its spec;
  - `formatters.spec.ts`;
  - `libs/game-shelf/tsconfig.spec.json`.
- Modify: `game-shelf.ts`, `add-imported.ts`, `qsp-catalog.ts`, `index.ts` (only if exports must stay reachable), `project.json`.
- Delete: `add-imported.spec.ts`. Its rewrite is `import-outcome.spec.ts`.

**Interfaces (produces):**

- **`shelf-state.ts`** (imports only contracts types): `addGame(games, id, data)`, `updateGame(games, id, data)` and `removeGame(games, id)`.
  - Each has the type `(games: Record<string, GameShelfEntry>, …) => Record<string, GameShelfEntry>` and returns a new object, never mutating its input.
  - `updateGame` merges into the existing entry, or into `{}` when the entry is missing.
  - Also produces `sortByTitle(games: Record<string, GameShelfEntry>): GameShelfEntry[]` (`localeCompare` on the title) and `sourceMap(games): Map<string, Set<string>>`.
  - `games$`, `gamesList$` and `gameSourceMap$` in `game-shelf.ts` use these.
- **`pending-writes.ts`** (imports only `xoid`): `pendingWrites$` (moved) and `trackWrite(write: Promise<void>): void`, which is the current `tracked`.
  - `game-shelf.ts` imports both and re-exports `pendingWrites$`, so `@qspider/game-shelf`'s public API is unchanged.
- **`import-outcome.ts`** (imports only contracts types): `importOutcome(imported: readonly GameShelfEntry[]): { start: string } | { notice: number }`.
  - It throws `new Error('No games imported')` when `imported` is empty.
  - One entry gives `{ start: id }`, and more than one gives `{ notice: imported.length }`.
  - `addImported` keeps its signature and behaviour and uses it.
- **`catalog-rules.ts`** (imports only contracts types): the `CatalogGame` and `CatalogAuthor` interfaces move here and `qsp-catalog.ts` re-exports them. Also produces:
  - `catalogUrl(query: { page: number; sort: string; order: 'asc' | 'desc'; title: string; author: string; featured: boolean }): string`, the exact `loadQspCatalog` URL;
  - `authorsUrl(page: number): string`;
  - `isUpdateCheckDue(lastCheck: number | undefined, now: number): boolean`, true when `now - (lastCheck ?? 0) >= ONE_DAY_MS`;
  - `hasNewerVersion(sourceDate: number, catalogUpdatedAt: string): boolean`;
  - `catalogEntryFields(game: CatalogGame): Pick<GameShelfEntry, 'title' | 'description' | 'icon' | 'author' | 'ported_by' | 'version' | 'meta'>`, the `moveToShelf` mapping, with `sourceName` moved here and re-exported;
  - `nextSortDirection(current: 'asc' | 'desc'): 'asc' | 'desc'`.

  `qsp-catalog.ts` uses all of these.

- [ ] **Step 1: Refactor.** Do the extractions above with identical behaviour. Then run `pnpm nx test game-shelf && pnpm nx typecheck game-shelf`; the old specs still pass at this point. Commit: `refactor(game-shelf): pure shelf, import and catalog logic in their own files`.
- [ ] **Step 2: Check E2E coverage before deleting the mock-based assertions.** For each, name the scenario file and title under `apps/player-e2e/scenarios/` that covers it, and put the list in the report:
  - (a) an import adds every entry to the shelf;
  - (b) a multi-game import shows the "N games added to shelf" notice and starts nothing;
  - (c) a single import starts the game;
  - (d) shelf writes reach storage and survive a restart (this is what `pendingWrites$` exists for).

  If any has no scenario, flag it as a concern and keep going.

- [ ] **Step 3: Write the specs.**
  - **`shelf-state.spec.ts`:**
    - add, update and remove don't mutate the input;
    - update of a missing id creates the entry from the partial data;
    - remove of a missing id returns an equal object;
    - `sortByTitle` orders `['b', 'a', 'B']` by `localeCompare`;
    - `sourceMap` groups `source_id`s per `source` and skips entries without `meta.source`.
  - **`pending-writes.spec.ts`:** keep the three existing behaviours, but drive `trackWrite(deferred.promise)` directly with real promises, no storage mock and no `console.error` spy:
    - counts until the write resolves;
    - still decrements on reject;
    - counts concurrent writes independently.

    Rejected writes log through `console.error`. That's acceptable noise, so don't silence it with a spy.

  - **`import-outcome.spec.ts`:** the cases are none (throws), one and two.
  - **`catalog-rules.spec.ts`:**
    - `catalogUrl` gives exactly `'https://qsp.org/api/v1/games?page=2&per-page=20&sort=created&order=desc'` when no filters are set;
    - with all filters, `search-name`, `search-authors` and `featured=1` are appended in that order;
    - `authorsUrl(3)`;
    - `isUpdateCheckDue` at `undefined`, at exactly one day, and one ms short;
    - `hasNewerVersion`, both ways;
    - `catalogEntryFields` with null `translators`/`icon_url` gives `''`;
    - `nextSortDirection`, both ways.
  - **`formatters.spec.ts`:**
    - `0` → `'0 Bytes'`;
    - `1023` → `'1023 Bytes'`;
    - `1024` → `'1 KB'`;
    - `1536` → `'1.5 KB'`;
    - `1536` with `decimals=0` → `'2 KB'`;
    - `5 * 1024 ** 3` → `'5 GB'`.
- [ ] **Step 4: Wire the spec typecheck** the same way as in Task 2.
- [ ] **Step 5: Run** `pnpm nx test game-shelf && pnpm nx typecheck game-shelf && pnpm nx lint game-shelf && pnpm format:check`, and expect all to pass. Then `grep -n "vi\.\(mock\|fn\|spyOn\|stubGlobal\)" libs/game-shelf/src` should find nothing.
- [ ] **Step 6: Commit:** `test(game-shelf): pure shelf, import and catalog logic without mocks`.

### Task 4: `libs/desktop`, game URL rules and resource routing

**Files:**

- Create: `libs/desktop/src/lib/game-url-rules.ts`, `game-url-rules.spec.ts`, `resource-route.ts`, `resource-route.spec.ts`, `libs/desktop/tsconfig.spec.json`
- Modify: `game-url.ts`, `setup.ts`, `data-fetcher.ts`, `storage-migration.ts`, `storage-migration.spec.ts`, `vite.config.mts`, `project.json`
- Delete: `game-url.spec.ts`, `setup.spec.ts`, `data-fetcher.spec.ts`. Their rewrites are the two new specs.
- Untouched: `e2e-marks.ts`/`e2e-marks.spec.ts`. This is deferred to PR 2, because `plainText` needs a real `DOMParser` and browser mode only arrives in PR 2.

**Interfaces (produces):**

- **`game-url-rules.ts`** (no imports): `type DesktopOs = string`, the value of `platform()` from `@tauri-apps/plugin-os`. Functions:
  - `gameUrlBaseFor(os: DesktopOs): string`: `'https://qsp.localhost/'` on `'windows'`, and otherwise `'qsp://localhost/'`;
  - `buildGameUrlFor(os, uuid): string`;
  - `isGameUrlFor(os, url): boolean`;
  - `isLegacyGameUrl(url, uuid): boolean`, moved here;
  - `shouldShimXhrFor(os, baseUrl): boolean`.

  `game-url.ts` keeps `gameUrlBase()`, `buildGameUrl()` and `isGameUrl()` as one-line wrappers that pass `platform()`, and re-exports `isLegacyGameUrl`. `setup.ts`'s `shouldShimXhr(baseUrl)` becomes `shouldShimXhrFor(platform(), baseUrl)`. `storage-migration.ts` imports `isLegacyGameUrl` from `game-url-rules`.

- **`resource-route.ts`** (imports only `cleanPath` and `isExternalUrl` from `@qspider/utils`, plus `game-url-rules`):
  - `resolveResourceUrl(baseUrl: string, path: string): string`;
  - `resourceRoute(os: DesktopOs, url: string): 'game' | 'app-asset' | 'network'`;
  - `appAssetUrl(url: string): string`, which is `new URL(url).href`;
  - `decodeText(data: Uint8Array): string`, UTF-16LE when the bytes start with the BOM `ff fe`, and otherwise UTF-8;
  - `APP_ORIGINS`, moved here.

  `data-fetcher.ts` keeps `fetchTextContent` and `fetchBinaryContent` and their behaviour, built on these.

- [ ] **Step 1: Refactor** as above. Run `pnpm nx test desktop && pnpm nx typecheck desktop` and expect PASS with the old specs still present. Commit: `refactor(desktop): game url rules and resource routing as pure functions`.
- [ ] **Step 2: Check E2E coverage before deleting the old specs.** Name the scenario per behaviour:
  - game resources load on desktop (`read_resource`);
  - the bundled standalone game's files load (`read_app_asset`);
  - a missing bundled file fails rather than yielding `index.html`;
  - UTF-16 `game.cfg`;
  - external URLs are fetched;
  - the Windows https form;
  - the XHR shim (a game's own XHR on Linux).

  Flag any gap.

- [ ] **Step 3: Write `game-url-rules.spec.ts`.** Carry over every case from the old `game-url.spec.ts` and `setup.spec.ts`, passing the OS as an argument. Add:
  - `isGameUrlFor('windows', 'qsp://localhost/x')` → `false`;
  - `shouldShimXhrFor('linux', 'https://example.com/')` → `false`.
- [ ] **Step 4: Write `resource-route.spec.ts`.**
  - `resolveResourceUrl`:
    - `('qsp://localhost/abc/', 'img\\a.png')` → `'qsp://localhost/abc/img/a.png'`;
    - an external `path` (`'https://x.org/a.png'`) is returned unchanged.
  - `resourceRoute`:
    - each of the three `APP_ORIGINS` → `'app-asset'`;
    - a game URL on linux and on windows → `'game'`;
    - `'https://example.com/a'` → `'network'`.
  - `appAssetUrl`: carry over the three normalisation cases from the old data-fetcher spec, including `'my file ф.txt'` → `'tauri://localhost/game/my%20file%20%D1%84.txt'`.
  - `decodeText`:
    - `[0xff, 0xfe, 0x68, 0, 0x69, 0]` → `'hi'`;
    - `[0x68, 0x69]` → `'hi'`;
    - UTF-8 Cyrillic bytes.
- [ ] **Step 5: Update `storage-migration.spec.ts`.** Drop its `vi.mock` and keep every case.
- [ ] **Step 6: Clean up the config and wiring.**
  - Remove the `@qspider/utils` alias from `libs/desktop/vite.config.mts`, a workaround that exists only for the old specs. If `pnpm nx test desktop` then fails to load the utils barrel in Node, keep the alias and state the exact error in the report.
  - Wire the spec typecheck as in Task 2.
- [ ] **Step 7: Run** `pnpm nx test desktop && pnpm nx typecheck desktop && pnpm nx lint desktop && pnpm format:check` and expect all to pass. Then `grep -rn "vi\.\(mock\|fn\|spyOn\|stubGlobal\)" libs/desktop/src` should list only `e2e-marks.spec.ts`.
- [ ] **Step 8: Sweep the remaining desktop files** (`config-entries.ts`, `utils.ts`, `shell.ts`, `window-manager.ts`, `desktop-importer.ts`, `updater.ts`, `tauri-storage.ts`) for further pure logic that is reachable or extractable. Extract and test what you find in the same refactor-then-test pattern, or list in the report why each file has none.
- [ ] **Step 9: Commit:** `test(desktop): game url rules and resource routing without mocks`.

### Task 5: `libs/debugger`, test wiring and `debug-utils`

**Files:**

- Create: `libs/debugger/vite.config.mts`, following `libs/utils/vite.config.mts` with name `debugger` and environment `node`; `libs/debugger/tsconfig.spec.json`; `libs/debugger/src/lib/debug-utils.spec.ts`
- Modify: `libs/debugger/project.json` (spec typecheck)

Functions to cover: `decodePanelBitmask`, `formatListItems`, `formatEventArgs`. `EVENT_SIGNATURES` and `QSP_PANEL_NAMES` are data tables.

- [ ] **Step 1: Wire it.** `pnpm nx show project debugger` must list a `test` target.
- [ ] **Step 2: Write the spec.** Required cases:
  - `decodePanelBitmask`: `0`, a single bit, several bits (order as the code produces) and an unknown bit;
  - `formatListItems`: an empty list, plain values, objects and long lists (whatever truncation the code does);
  - `formatEventArgs`:
    - a known event maps its args to the signature names;
    - an unknown event;
    - fewer or more args than the signature.

  Read the code for the exact outputs.

- [ ] **Step 3: Run** `pnpm nx test debugger && pnpm nx typecheck debugger && pnpm nx lint debugger && pnpm format:check` and expect all to pass. Also run `pnpm nx run-many -t test` and expect the new target to be included.
- [ ] **Step 4: Commit:** `test(debugger): wire unit tests and cover debug-utils`.

### Task 6: `libs/i18n`, theme translation grouping and date format

**Files:**

- Create: `libs/i18n/src/translations.ts` and `translations.spec.ts`; `libs/i18n/vite.config.mts` (name `i18n`, environment `node`); `libs/i18n/tsconfig.spec.json`
- Modify: `libs/i18n/src/index.ts`, `libs/i18n/project.json`

**Interfaces (produces), in `translations.ts`** (no imports besides contracts types):

- `LOCALES`: the list from `index.ts`, moved.
- `groupThemeTranslations(translations: ThemeTranslation[], locales: readonly string[]): Record<string, Record<string, string>>`: the grouping loop from `loadThemeTranslations`.
- `formatDateIn(language: string, date: Date): string`: `Intl.DateTimeFormat(language, { dateStyle: 'long', timeStyle: 'short' })`.

In `index.ts`, `loadThemeTranslations` uses `groupThemeTranslations(translations, LOCALES)`, and `formatDate(date)` becomes `formatDateIn(i18n.language, date)`. `index.ts` can't be imported in a test, because it initialises i18next against `window` at load time.

- [ ] **Step 1: Refactor.** Commit: `refactor(i18n): theme translation grouping and date format as pure functions`.
- [ ] **Step 2: Write the spec.**
  - `groupThemeTranslations`:
    - groups by language;
    - drops a language outside the list;
    - a later duplicate key wins;
    - empty input gives `{}`.
  - `formatDateIn('en', new Date(Date.UTC(2026, 9, 25, 12, 30)))` contains `'October 25, 2026'`. Assert only the date part, because the time part depends on the runner's time zone.
- [ ] **Step 3: Run** `pnpm nx test i18n && pnpm nx typecheck i18n && pnpm nx lint i18n && pnpm format:check` and expect all to pass.
- [ ] **Step 4: Commit:** `test(i18n): wire unit tests and cover translation helpers`.

### Task 7: `apps/player-standalone`, the config entry

**Files:**

- Create: `apps/player-standalone/src/app/config-entry.ts` and `config-entry.spec.ts`; a `test` block in `apps/player-standalone/vite.config.mts` (name `player-standalone`, environment `node`, include `src/**/*.spec.ts`); a spec tsconfig plus a typecheck command, following `libs/utils`
- Modify: `apps/player-standalone/src/app/config-runner.ts`

**Interfaces (produces), in `config-entry.ts`** (imports only contracts types):

- `cleanConfigUrl(url: string): string`: strips the hash and search, and throws `new Error('Only .cfg files are supported')` unless the result ends with `.cfg`.
- `configEntry(config: PlayerConfig, cleanUrl: string): GameShelfEntry`: the first game, or `new Error('Game not found')`; `loadConfig` is `{ url: <base up to last '/'>, entrypoint: game.file, descriptor: game }`.

`runConfig` keeps its signature and only does the fetch and parse between those calls.

- [ ] **Step 1: Refactor.** Commit: `refactor(player-standalone): config url and entry mapping as pure functions`.
- [ ] **Step 2: Write the spec.**
  - `cleanConfigUrl('https://a.org/g/game.cfg?x#y')` → `'https://a.org/g/game.cfg'`;
  - `'https://a.org/g/game.qsp'` throws;
  - `configEntry`:
    - maps every field, with the base `'https://a.org/g/'`;
    - an empty `game` array throws `'Game not found'`;
    - with two games, it takes the first.
- [ ] **Step 3: Run** `pnpm nx test player-standalone && pnpm nx typecheck player-standalone && pnpm nx lint player-standalone && pnpm format:check` and expect all to pass. Also check that `pnpm nx build player-standalone` still builds, because the vite config changed.
- [ ] **Step 4: Commit:** `test(player-standalone): config url and entry mapping`.

### Task 8: `apps/player`, the service-worker file rules; and `apps/player-desktop` sweep

**Files:**

- Create: `apps/player/src/qspider-files.ts` and `qspider-files.spec.ts`; a `test` block in `apps/player/vite.config.mts` (name `player`, environment `node`, include `src/**/*.spec.ts`); a spec tsconfig plus a typecheck command, following `libs/utils`
- Modify: `apps/player/src/service-worker.ts`; `apps/player-desktop` (spec typecheck only, unless the sweep finds pure code)

**Interfaces (produces), in `qspider-files.ts`** (no imports):

- `MIME_TYPES` (moved).
- `parseQspiderFileUrl(url: string): { gameId: string; path: string } | null`: the current `regexp` match, both parts `decodeURI`d. The path stops at `?` or `#`.
- `contentTypeOf(path: string): string | undefined` (moved).
- `isUtf16Le(data: ArrayBuffer): boolean`: true when the first two bytes are `ff fe`.

`service-worker.ts` keeps its behaviour. The UTF-16 branch still applies only to `.xml` paths.

- [ ] **Step 1: Refactor.** Commit: `refactor(player): service-worker file rules in their own file`.
- [ ] **Step 2: Write the spec.**
  - `parseQspiderFileUrl`:
    - `'https://x.org/qspider-files/g%201/img/a%20b.png?v=2#h'` → `{ gameId: 'g 1', path: 'img/a b.png' }`;
    - a URL without `/qspider-files/` → `null`.
  - `contentTypeOf`:
    - `'a/b.PNG'` → `'image/png'`;
    - `'dir.v2/file'` → `undefined`;
    - `'noext'` → `undefined`;
    - `'a.unknown'` → `undefined`.
  - `isUtf16Le`:
    - the BOM → true;
    - UTF-8 → false;
    - 0- and 1-byte buffers → false.
- [ ] **Step 3: Sweep `apps/player-desktop/src` and `apps/player/src`** for other pure logic (`isSupportedFileType` is already tested). Extract and test what you find, or list in the report why none exists. Add the spec typecheck to `player-desktop`.
- [ ] **Step 4: Run** `pnpm nx test player && pnpm nx typecheck player && pnpm nx lint player && pnpm nx build player`, the same targets for `player-desktop` (except build), and `pnpm format:check`. Expect all to pass.
- [ ] **Step 5: Commit:** `test(player): service-worker file rules`.

---

## Handoffs to later PRs

- `libs/desktop` `e2e-marks`: rewrite it without mocks in PR 2, once browser mode exists. The stage logic becomes a pure function, and `plainText` is tested in a real browser.
- `isTouchDevice` is not pure. Leave it to E2E.
