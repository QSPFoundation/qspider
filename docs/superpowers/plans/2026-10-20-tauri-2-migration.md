# Tauri 2 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move qSpider desktop and the standalone desktop builds from Tauri v1 to v2. Existing users keep all their data, and v1 installs can auto-update to v2 at any time.

**Architecture:**

- The Rust shell is upgraded to Tauri 2 plus official plugins. The `qsp` protocol and `read_resource` share one URL parser that takes the game uuid from the path.
- All Tauri JS calls live in `libs/desktop`. Apps reach them via `@qspider/desktop` / `@qspider/env`.
- Standalone game repos use a qSpider-owned `qspider.desktop.json`. A Node generator turns it into a Tauri v2 config overlay.
- v1 → v2 updates go through one `v1Compatible` "bridge" release pinned behind the frozen `updater.json`. v2 reads `updater-v2.json`.

**Tech Stack:** Tauri 2.x (Rust, `tauri-plugin-{fs,dialog,cli,os,process,updater,window-state}`), `@tauri-apps/api` v2 + plugin JS packages, TypeScript/React, Vitest 5, Node ESM scripts, GitHub Actions (`tauri-apps/tauri-action@v0`).

**Spec:** `docs/superpowers/specs/2026-10-20-tauri-2-migration-design.md`

## Global Constraints

- Bundle identifier stays `org.qsp.qspider`.
- Updater pubkey stays the current value in `src-tauri/tauri.conf.json`.
- v2 updater endpoint: `https://qspfoundation.github.io/qspider/updater-v2.json`.
- Frozen v1 endpoint: `https://qspfoundation.github.io/qspider/updater.json`. After the bridge, it is only ever generated from the release pinned by `BRIDGE_RELEASE_TAG`.
- Windows webview uses `useHttpsScheme: true`. Game URL base is `https://qsp.localhost/` on Windows and `qsp://localhost/` elsewhere.
- Game URL format: `<base><uuid>/`.
- Keep `WEBKIT_DISABLE_COMPOSITING_MODE=1`, the `devtools` feature, the release profile, NSIS languages/custom files/selector, and `webviewInstallMode: embedBootstrapper`.
- Window: `freezePrototype: false`; window 1024×768, centered, resizable, `visible: false`.
- No `@tauri-apps/*` imports outside `libs/desktop` (and `libs/browser` none).
- CI secrets keep their names (`TAURI_PRIVATE_KEY`, `TAURI_KEY_PASSWORD`). They are mapped to `TAURI_SIGNING_PRIVATE_KEY` / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.
- Linux builds on `ubuntu-22.04`, with webkit2gtk-4.1. No `ubuntu-20.04` anywhere.
- Standalone builds never use `v1Compatible`.
- Do **not** merge to `release` until Task 11's verification passes.

## Review Focus

1. **Game files with spaces or Cyrillic names, raw or percent-encoded in the URL.** Must load. _Test in Task 1._
2. **Resource path in different case than on disk** (old games reference `IMG/Pic.PNG`). The lowercase fallback still applies. _Test in Task 1._
3. **Malformed protocol/IPC URLs** (no uuid segment, invalid uuid, unknown game). Return 404/400 or an `Err`, never panic. A panic in the protocol handler kills the app. _Test in Task 1._
4. **Library entries whose stored URL is already new-format, or that have no `local_id`** (web-imported or legacy). The migration leaves them untouched and doesn't rewrite the file needlessly. _Test in Task 3._
5. **`game.cfg` saved as UTF-16LE with BOM.** Still decoded correctly on both the IPC path and the plain-`fetch` path. _Test in Task 2._

---

### Task 1: Rust shell and Tauri v2 config

**Files:**

- Modify: `src-tauri/Cargo.toml`, `src-tauri/src/main.rs`, `src-tauri/tauri.conf.json`, `src-tauri/standalone.conf.json`
- Create: `src-tauri/src/game_uri.rs`, `src-tauri/capabilities/default.json`
- Modify: `package.json` (`@tauri-apps/cli` → `^2`)

**Interfaces:**

- Produces (Rust):
  - `game_uri::parse_game_uri(uri: &str) -> Option<(Uuid, String)>`
  - `game_uri::read_game_file(root: &Path, rel: &str) -> std::io::Result<Vec<u8>>`
- Produces (IPC):
  - `prepare_game_start({ path: string, id: string }) -> Result<bool, String>` (same as today)
  - `read_resource({ url: string }) -> ArrayBuffer` (raw bytes via `tauri::ipc::Response`; rejects with a string on error)
- Produces (config): the updater endpoint, `useHttpsScheme`, and the capability set that later tasks rely on.

- [ ] **Step 1: Write failing Rust unit tests in `src-tauri/src/game_uri.rs` (`#[cfg(test)] mod tests`)**

```rust
const ID: &str = "0f8fad5b-d9cb-469f-a165-70867728950e";
#[test] fn parses_unix_form() {
  let (id, p) = parse_game_uri(&format!("qsp://localhost/{ID}/img/a.png")).unwrap();
  assert_eq!(id.to_string(), ID); assert_eq!(p, "img/a.png");
}
#[test] fn parses_windows_form() {
  let (_, p) = parse_game_uri(&format!("https://qsp.localhost/{ID}/game.cfg")).unwrap();
  assert_eq!(p, "game.cfg");
}
#[test] fn decodes_percent_encoding() {
  let (_, p) = parse_game_uri(&format!("qsp://localhost/{ID}/%D0%BA%D0%B0%D1%80%D1%82%D0%B0%201.png")).unwrap();
  assert_eq!(p, "карта 1.png");
}
#[test] fn accepts_raw_unicode_and_spaces() {
  let (_, p) = parse_game_uri(&format!("qsp://localhost/{ID}/карта 1.png")).unwrap();
  assert_eq!(p, "карта 1.png");
}
#[test] fn rejects_missing_uuid_segment() { assert!(parse_game_uri("qsp://localhost/").is_none()); }
#[test] fn rejects_bad_uuid() { assert!(parse_game_uri("qsp://localhost/not-a-uuid/x.png").is_none()); }
#[test] fn rejects_no_scheme() { assert!(parse_game_uri("garbage").is_none()); }
#[test] fn reads_with_lowercase_fallback() {
  let dir = std::env::temp_dir().join(format!("qsp-test-{}", uuid::Uuid::new_v4()));
  std::fs::create_dir_all(dir.join("img")).unwrap();
  std::fs::write(dir.join("img/pic.png"), b"x").unwrap();
  assert_eq!(read_game_file(&dir, "IMG/Pic.PNG").unwrap(), b"x");
  assert!(read_game_file(&dir, "missing.png").is_err());
}
```

- [ ] **Step 2: Upgrade `Cargo.toml`, and verify the tests fail to compile**
  - `edition = "2021"`
  - `tauri-build = "2"`; drop `config-toml`
  - `tauri = { version = "2", features = ["devtools", "image-png", "image-ico"] }`
  - `tauri-plugin-fs`, `-dialog`, `-os`, `-process`, `-window-state` = `"2"`
  - Under `[target.'cfg(not(any(target_os = "android", target_os = "ios")))'.dependencies]`: `tauri-plugin-cli = "2"`, `tauri-plugin-updater = "2"`
  - Keep `serde`, `serde_json`, `uuid`, `urlencoding`, `mime_guess`; drop `entity-tag` if unused
  - Keep `[features]` and `[profile.release]`

  Run: `cd src-tauri && cargo test game_uri`
  Expected: compile failure (`parse_game_uri` not found).

- [ ] **Step 3: Implement `parse_game_uri` and `read_game_file`**
  - **`parse_game_uri`:**
    1. Take everything after `"://"`, then everything after the next `/`.
    2. Percent-decode the result with `urlencoding::decode`.
    3. Split at the first `/` into a uuid string and a relative path.
    4. `Uuid::parse_str`, returning `None` on any failure.
    5. Ignore the host entirely. Do not use `http::Uri` (it rejects raw spaces and Unicode).
  - **`read_game_file`:**
    1. `std::fs::read(root.join(rel))`.
    2. On error, retry once with `rel.to_lowercase()`.

- [ ] **Step 4: Run tests**

  Run: `cd src-tauri && cargo test game_uri`
  Expected: 8 passed.

- [ ] **Step 5: Rewrite `main.rs` for v2**
  - `#[cfg_attr(mobile, tauri::mobile_entry_point)] pub fn run()` is not needed (desktop only). Keep `fn main`.
  - `prepare_game_start`: same behavior, but `Uuid::parse_str(&id).map_err(|e| e.to_string())?`, with no `unwrap`.
  - `read_resource(url, state) -> Result<tauri::ipc::Response, String>`: `parse_game_uri` → look up the root → `read_game_file` → `Ok(Response::new(buf))`. Errors: `"invalid url"`, `"Game not found"`, or the io message.
  - `register_uri_scheme_protocol("qsp", |ctx, request| …)` returns a `tauri::http::Response<Vec<u8>>`. State comes from `ctx.app_handle().state::<GamesPath>()`.
    - POST → 200, empty body.
    - `parse_game_uri(&request.uri().to_string())` returns `None` → 400.
    - Unknown uuid or read error → 404 `text/plain`.
    - Success → 200 with mime from `mime_guess` (default `application/octet-stream`).
    - Always send `Access-Control-Allow-Origin: *`.
    - No `?` and no `unwrap` inside the closure.
  - Plugins:
    - fs, dialog, os, process, window-state.
    - cli and updater inside `#[cfg(desktop)]`.
    - Register updater only when `app.config().plugins.0.contains_key("updater")`, inside `.setup(|app| { … app.handle().plugin(tauri_plugin_updater::Builder::new().build())?; … })`. Standalone games may have no updater config.
  - Keep `std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1")`.

- [ ] **Step 6: Convert configs**
  - **`tauri.conf.json`** (v2 schema; `pnpm tauri migrate` may be used as a start, then hand-check):
    - Top level: `productName: "qSpider"`, `version: "../package.json"`, `identifier: "org.qsp.qspider"`.
    - `build`: `frontendDist: "../dist/apps/player-desktop"`, `devUrl: "http://localhost:4200"`, same before-commands.
    - `bundle`:
      - same targets, but the `"updater"` target is removed in v2
      - same icons, category, descriptions, deb/appimage settings
      - `windows.webviewInstallMode`
      - `windows.nsis` with the same languages/custom files/selector
      - `createUpdaterArtifacts: "v1Compatible"`
    - `app`:
      - `security.freezePrototype: false`
      - `windows[0]` as today plus `useHttpsScheme: true`
    - `plugins.cli`: same `description`/`args`.
    - `plugins.updater`: `{ "endpoints": ["https://qspfoundation.github.io/qspider/updater-v2.json"], "pubkey": "<unchanged>" }`. There is no `dialog` key in v2.
  - **`standalone.conf.json`**: `{ "build": { "frontendDist": "../dist/apps/player-standalone", "devUrl": "http://localhost:4200", "beforeDevCommand": "npm run serve:standalone-desktop", "beforeBuildCommand": "npm run build:standalone-desktop" } }`
  - **`capabilities/default.json`**: `windows: ["main"]`, `platforms: ["linux","macOS","windows"]`. Permissions:
    - `core:default`
    - `core:window:allow-set-size`, `core:window:allow-set-min-size`, `core:window:allow-set-max-size`, `core:window:allow-set-resizable`, `core:window:allow-set-title`, `core:window:allow-set-icon`, `core:window:allow-set-fullscreen`, `core:window:allow-show`
    - `fs:allow-appdata-read-recursive`, `fs:allow-appdata-write-recursive`
    - `dialog:allow-open`, `dialog:allow-ask`
    - `cli:default`
    - `os:default`
    - `process:allow-exit`, `process:allow-restart`
    - `updater:default`
    - `window-state:default`

- [ ] **Step 7: Verify it builds**

  Run: `pnpm install && cd src-tauri && cargo check && cargo test`
  Expected: compiles, all tests pass. The JS app won't work yet; that's Tasks 2–7.

- [ ] **Step 8: Commit**

```bash
git add src-tauri package.json pnpm-lock.yaml
git commit -m "feat(desktop): migrate rust shell and config to tauri 2"
```

---

### Task 2: Game URLs and data fetching in `libs/desktop`

**Files:**

- Modify: `package.json` (`@tauri-apps/api@^2`, `@tauri-apps/plugin-{fs,dialog,cli,os,process,updater}@^2`)
- Create: `libs/desktop/src/lib/game-url.ts`, `libs/desktop/src/lib/game-url.spec.ts`, `libs/desktop/src/lib/data-fetcher.spec.ts`, `libs/desktop/vite.config.mts` (test-only: `test: { name: 'desktop', environment: 'node' }`)
- Modify: `libs/desktop/src/lib/data-fetcher.ts`, `libs/desktop/src/index.ts`, `vitest.config.mjs` (add `./libs/desktop/vite.config.mts` to `projects`)

**Interfaces:**

- Consumes: IPC `read_resource` → `ArrayBuffer` (Task 1).
- Produces:
  - `gameUrlBase(): string` — `'https://qsp.localhost/'` when `platform() === 'windows'` (`@tauri-apps/plugin-os`), else `'qsp://localhost/'`
  - `buildGameUrl(uuid: string): string` — `${gameUrlBase()}${uuid}/`
  - `isGameUrl(url: string): boolean`
  - `isLegacyGameUrl(url: string, uuid: string): boolean` — true for `qsp://<uuid>/…` or `https://qsp.<uuid>/…`
  - `fetchTextContent(baseUrl, path): Promise<string>` and `fetchBinaryContent(baseUrl, path): Promise<ArrayBuffer>` (same signatures as today)

- [ ] **Step 1: Write failing tests**

```ts
// game-url.spec.ts — vi.mock('@tauri-apps/plugin-os', () => ({ platform: vi.fn() }))
it('uses https host form on windows', () => {
  platform.mockReturnValue('windows');
  expect(buildGameUrl('abc')).toBe('https://qsp.localhost/abc/');
});
it('uses qsp scheme elsewhere', () => {
  platform.mockReturnValue('linux');
  expect(buildGameUrl('abc')).toBe('qsp://localhost/abc/');
});
it('detects game urls', () => {
  platform.mockReturnValue('macos');
  expect(isGameUrl('qsp://localhost/abc/x.png')).toBe(true);
  expect(isGameUrl('tauri://localhost/game/x')).toBe(false);
});
it('detects legacy urls', () => {
  expect(isLegacyGameUrl('qsp://abc/', 'abc')).toBe(true);
  expect(isLegacyGameUrl('https://qsp.abc/i.png', 'abc')).toBe(true);
  expect(isLegacyGameUrl('qsp://localhost/abc/', 'abc')).toBe(false);
});

// data-fetcher.spec.ts — mock '@tauri-apps/api/core' invoke and global fetch
it('routes game urls through read_resource', async () => {
  /* invoke resolves bytes of "hi" */ expect(await fetchTextContent('qsp://localhost/abc/', 'a.txt')).toBe('hi');
  expect(invoke).toHaveBeenCalledWith('read_resource', { url: 'qsp://localhost/abc/a.txt' });
});
it('uses fetch for bundled standalone files', async () => {
  await fetchBinaryContent('tauri://localhost/game/', 'game.cfg');
  expect(invoke).not.toHaveBeenCalled();
  expect(fetch).toHaveBeenCalledWith('tauri://localhost/game/game.cfg');
});
it('decodes utf-16le with BOM on both paths', async () => {
  /* bytes FF FE 'h' 0 'i' 0 */ expect(await fetchTextContent('qsp://localhost/abc/', 'game.cfg')).toBe('hi');
  expect(await fetchTextContent('tauri://localhost/game/', 'game.cfg')).toBe('hi');
});
```

- [ ] **Step 2: Run, expect failure**

  Run: `pnpm vitest run --project desktop`
  Expected: FAIL (`game-url` module not found).

- [ ] **Step 3: Implement `game-url.ts` and update `data-fetcher.ts`**
  - `invoke<ArrayBuffer>` from `@tauri-apps/api/core` when `isGameUrl(url)`; otherwise `fetch(url)` → `arrayBuffer()`.
  - Text decoding keeps the existing BOM rule (`255,254` → `utf-16le`).
  - Export the new module from `index.ts`.

- [ ] **Step 4: Run, expect pass**

  Run: `pnpm vitest run --project desktop`
  Expected: all pass.

- [ ] **Step 5: Commit** — `feat(desktop): platform-aware game urls, fetch bundled files directly`

---

### Task 3: Storage on plugin-fs, plus library URL migration

**Files:**

- Create: `libs/desktop/src/lib/storage-migration.ts`, `libs/desktop/src/lib/storage-migration.spec.ts`
- Modify: `libs/desktop/src/lib/utils.ts`, `libs/desktop/src/lib/tauri-storage.ts`

**Interfaces:**

- Consumes: `buildGameUrl`, `isLegacyGameUrl` (Task 2); IPC `prepare_game_start`.
- Produces: `migrateGameUrls(games: Record<string, GameShelfEntry>, buildUrl: (uuid: string) => string): boolean`. It mutates in place, returns whether anything changed, and is idempotent.

- [ ] **Step 1: Write failing tests**

```ts
const build = (id: string) => `qsp://localhost/${id}/`;
it('rewrites legacy url and icon', () => {
  const games = {
    g: {
      id: 'g',
      title: 't',
      mode: 'classic',
      icon: 'qsp://u1/icon.png',
      loadConfig: { url: 'qsp://u1/', entrypoint: 'a.qsp', local_id: 'u1', local_path: '/x' },
    },
  };
  expect(migrateGameUrls(games, build)).toBe(true);
  expect(games.g.loadConfig.url).toBe('qsp://localhost/u1/');
  expect(games.g.icon).toBe('qsp://localhost/u1/icon.png');
});
it('rewrites windows legacy form', () => {
  /* url 'https://qsp.u1/' → build('u1') */
});
it('is idempotent and reports no change for new-format entries', () => {
  /* url already build('u1') → returns false, unchanged */
});
it('leaves entries without local_id untouched', () => {
  /* url 'https://example.com/game/' → returns false */
});
it('leaves non-game icons untouched', () => {
  /* icon 'https://qsp.org/x.png' stays */
});
```

- [ ] **Step 2: Run, expect failure**

  Run: `pnpm vitest run --project desktop storage-migration`
  Expected: FAIL.

- [ ] **Step 3: Implement `migrateGameUrls`.** For an entry with `local_id`:
  - set `url` to `buildUrl(local_id)` if it differs
  - if `icon` passes `isLegacyGameUrl(icon, local_id)`, replace the legacy prefix with `buildUrl(local_id)`

- [ ] **Step 4: Run, expect pass**

- [ ] **Step 5: Port `utils.ts` to `@tauri-apps/plugin-fs`**
  - `readTextFile`/`writeTextFile` with `{ baseDir: BaseDirectory.AppData }`.
  - `readBinaryFile` → `readFile`, `writeBinaryFile` → `writeFile`.
  - `createDir` → `mkdir`, keeping `recursive`.
  - `removeFile`/`removeDir` → `remove`, with `recursive` for dirs.
  - `exists(..., { baseDir })`.
  - `appDataDir`/`dirname` from `@tauri-apps/api/path`.
  - Same exported function names and signatures as today.

- [ ] **Step 6: Update `tauri-storage.ts`**
  - Delete the local `buildGameUrl` and use Task 2's.
  - `invoke` from `@tauri-apps/api/core`; `path` from `@tauri-apps/api/path`.
  - In `initialize()`, after loading, call `migrateGameUrls(games, buildGameUrl)` **before** the `prepare_game_start` loop. Call `flushStorageData` once if it returned `true` or any game was dropped.

- [ ] **Step 7: Run all desktop tests and lint**

  Run: `pnpm vitest run --project desktop && pnpm nx lint desktop`
  Expected: pass.

- [ ] **Step 8: Commit** — `feat(desktop): plugin-fs storage and library url migration`

---

### Task 4: Move desktop importer behind the desktop lib

**Files:**

- Move: `libs/importers/src/lib/desktop-importer.ts` → `libs/desktop/src/lib/desktop-importer.ts`
- Modify: `libs/importers/src/index.ts` (remove the desktop export; add `export { isSupportedArchive } from './lib/utils'`), `libs/desktop/src/index.ts`, `apps/player-desktop/src/app/{init.ts,app.tsx,open-game-button.tsx}` (import `importDesktop` from `@qspider/desktop`)

**Interfaces:**

- Consumes: `buildGameUrl` (Task 2); `importArchive`, `isSupportedArchive` from `@qspider/importers`.
- Produces: `importDesktop(filePath: string): Promise<GameShelfEntry[]>` exported from `@qspider/desktop` (same behavior).

- [ ] **Step 1: Move the file**
  - Replace its local `buildGameUrl` with Task 2's.
  - Use static imports from `@tauri-apps/api/path` (`isAbsolute`, `resolve`, `basename`, `dirname`) and `invoke` from `@tauri-apps/api/core`.
  - Use the local `./data-fetcher`.
  - Icon stays `${urlPrefix}${icon}`.
- [ ] **Step 2: Update the three app imports.**
- [ ] **Step 3: Verify**

  Run: `pnpm nx run-many -t lint -p desktop importers player-desktop && pnpm nx build player && pnpm nx build player-desktop`
  Expected: pass. `grep -rn "@tauri-apps" libs/importers` returns nothing.

- [ ] **Step 4: Commit** — `refactor(desktop): move desktop importer into desktop lib`

---

### Task 5: Window manager and XHR shim

**Files:**

- Modify: `libs/desktop/src/lib/window-manager.ts`, `libs/desktop/src/lib/setup.ts`
- Create: `libs/desktop/src/lib/setup.spec.ts`

**Interfaces:**

- Consumes: `isGameUrl` (Task 2).
- Produces: `shouldShimXhr(baseUrl: string): boolean` (exported from `setup.ts`), true iff `isGameUrl(baseUrl) && platform() !== 'windows'`.

- [ ] **Step 1: Failing test**

```ts
it('shims on linux/macos game urls', () => {
  platform.mockReturnValue('linux');
  expect(shouldShimXhr('qsp://localhost/u/')).toBe(true);
});
it('does not shim on windows', () => {
  platform.mockReturnValue('windows');
  expect(shouldShimXhr('https://qsp.localhost/u/')).toBe(false);
});
it('does not shim bundled standalone', () => {
  platform.mockReturnValue('macos');
  expect(shouldShimXhr('tauri://localhost/game/')).toBe(false);
});
```

- [ ] **Step 2: Run, expect failure**

  Run: `pnpm vitest run --project desktop setup`

- [ ] **Step 3: Implement**
  - In `setup.ts`, replace `baseUrl$.value.startsWith('qsp://')` with `shouldShimXhr(baseUrl$.value)`.
  - In `window-manager.ts`:
    - `getCurrentWindow()` from `@tauri-apps/api/window`; `LogicalSize`/`PhysicalSize` from `@tauri-apps/api/dpi`.
    - `setMinSize(null)` / `setMaxSize(null)` for the unset methods.
    - `setIcon(new Uint8Array(source))`.
    - `exit` from `@tauri-apps/plugin-process`.
    - `type()`/`platform()` from `@tauri-apps/plugin-os` (synchronous).
    - `platformsMap` becomes `{ macos: 'Macintosh', linux: 'Linux', windows: 'Windows' }`, assigned synchronously at module load.
    - `adjustHeight` uses `platform() === 'macos'`.
- [ ] **Step 4: Run, expect pass**

  Run: `pnpm vitest run --project desktop`

- [ ] **Step 5: Commit** — `feat(desktop): tauri 2 window manager, keep xhr shim platform split`

---

### Task 6: Desktop app shell (CLI, open dialog, drag-and-drop)

**Files:**

- Create: `libs/desktop/src/lib/shell.ts`
- Modify: `libs/desktop/src/index.ts`, `apps/player-desktop/src/app/{init.ts,app.tsx,open-game-button.tsx}`

**Interfaces:**

- Produces (in `@qspider/desktop`):
  - `getLaunchFilePath(): Promise<string | undefined>` — `getMatches()` from `@tauri-apps/plugin-cli`, returns `args.file.value || args.filePath.value` when it's a string.
  - `pickGameFile(): Promise<string | null>` — `open()` from `@tauri-apps/plugin-dialog`, with the same `multiple: false` and `Qsp files` filter list as today.
  - `onFileDrop(handlers: { onHover(path: string): void; onDrop(path: string): void; onCancel(): void }): Promise<() => void>` — `getCurrentWebview().onDragDropEvent`: `enter` → `onHover(paths[0])`, `drop` → `onDrop(paths[0])`, `leave` → `onCancel()`. `over` is ignored. Returns the unlisten function.
  - `extname(path: string): Promise<string>` — re-export from `@tauri-apps/api/path`.

- [ ] **Step 1: Implement `shell.ts`.** It's thin glue over plugin APIs with no logic to unit-test. Behavior is verified in Step 3 and Task 11.
- [ ] **Step 2: Rewrite the app files to use these exports.**
  - `app.tsx` keeps its existing hover/unsupported/drop/cancel state logic, but calls `onFileDrop` in one `useEffect` and unlistens on cleanup.
  - The app no longer imports `@tauri-apps/*`.
- [ ] **Step 3: Verify in the running app**
  - Run: `grep -rn "@tauri-apps" apps/` → nothing.
  - Run: `pnpm start:desktop`. Then check:
    - the library shows
    - the Open game button opens the picker and the game runs
    - dragging a `.qsp` file shows the hover state, and dropping runs it
    - dragging a `.txt` file shows the unsupported-type message
    - dragging out clears the hover state
    - `pnpm tauri dev -- -- -f /path/game.qsp` launches the game
- [ ] **Step 4: Commit** — `feat(player-desktop): cli, dialog and drag-drop on tauri 2 plugins`

---

### Task 7: Update check on startup

**Files:**

- Create: `libs/desktop/src/lib/updater.ts`
- Modify: `libs/desktop/src/index.ts`, `libs/browser/src/index.ts` + `libs/browser/src/lib/updater.ts` (no-op), `apps/player-desktop/src/app/init.ts`, `apps/player-standalone/src/app/init.ts`

**Interfaces:**

- Produces: `checkForUpdates(): Promise<void>` from both `@qspider/env` implementations. The browser version resolves immediately.

- [ ] **Step 1: Implement the desktop `checkForUpdates`**
  1. `check()` from `@tauri-apps/plugin-updater`. If it throws (including when no updater is configured) → `console.error` and return.
  2. If an update exists → `ask()` from `@tauri-apps/plugin-dialog` with the text `A new version ${update.version} is available.\n\n${update.body ?? ''}\n\nInstall now?` and title `Update available`.
  3. On yes → `update.downloadAndInstall()` then `relaunch()` from `@tauri-apps/plugin-process`.
  4. Any error → `console.error`, no UI.
- [ ] **Step 2: Wire it in.** Call `void checkForUpdates()` at the end of `init()` in both apps. Fire and forget; never block startup.
- [ ] **Step 3: Verify.**
  - Run: `pnpm nx build player-standalone && pnpm nx build player-desktop`
  - Expected: pass. Behavior is verified end-to-end in Task 11.
- [ ] **Step 4: Commit** — `feat(desktop): startup update prompt for tauri 2 updater`

---

### Task 8: Standalone game-build config generator

**Files:**

- Create:
  - `tools/standalone-config/generate.mjs`
  - `tools/standalone-config/cli.mjs`
  - `tools/standalone-config/qspider.desktop.schema.json`
  - `tools/standalone-config/generate.spec.mjs`
  - `tools/standalone-config/vitest.config.mjs` (`test: { name: 'standalone-config', environment: 'node' }`)
- Modify: `vitest.config.mjs` (add the project), `package.json` (`"standalone:config": "node tools/standalone-config/cli.mjs"`)

**Interfaces:**

- Produces:
  - `validate(cfg: object): string[]` — error messages; empty means valid. Required fields: `productName`, `version`, `identifier`, `publisher`, `window.title`.
  - `generateTauriConfig(cfg: QspiderDesktopConfig): { config: object, warnings: string[] }`
  - `convertFromV1(v1: object): { config: QspiderDesktopConfig, dropped: string[] }`
  - CLI:
    - `standalone:config <qspider.desktop.json> --out <file>` — exit 1 with messages on error.
    - `standalone:config --from-v1 <game.build.conf.json>` — prints JSON to stdout, dropped fields to stderr.
  - `QspiderDesktopConfig` (the JSON Schema is the source of truth):

```json
{
  "$schema": "...",
  "schemaVersion": 1,
  "productName": "",
  "version": "",
  "identifier": "",
  "publisher": "",
  "copyright": "",
  "category": "Game",
  "shortDescription": "",
  "longDescription": "",
  "window": { "title": "", "width": 1024, "height": 768, "resizable": true, "fullscreen": false, "center": true },
  "updater": { "enabled": false, "endpoint": "", "pubkey": "" }
}
```

- [ ] **Step 1: Failing tests**

```js
it('generates a self-contained overlay', () => {
  const { config } = generateTauriConfig(sample);
  expect(config.identifier).toBe('my.game.id');
  expect(config.build).toEqual({
    frontendDist: '../dist/apps/player-standalone',
    beforeBuildCommand: 'pnpm run build:standalone-desktop',
  });
  expect(config.app.windows[0]).toMatchObject({ title: 'My Game', width: 1024, visible: false, useHttpsScheme: true });
});
it('never emits v1Compatible', () => {
  expect(JSON.stringify(generateTauriConfig(withUpdater).config)).not.toContain('v1Compatible');
});
it('emits updater plugin and artifacts when enabled', () => {
  const { config } = generateTauriConfig(withUpdater);
  expect(config.plugins.updater).toEqual({ endpoints: ['https://u.github.io/g/updater-v2.json'], pubkey: 'KEY' });
  expect(config.bundle.createUpdaterArtifacts).toBe(true);
});
it('removes base updater config when disabled', () => {
  const { config } = generateTauriConfig(sample); // enabled: false
  expect(config.plugins.updater).toBeNull(); // JSON merge patch delete
  expect(config.bundle.createUpdaterArtifacts).toBe(false);
});
it('treats enabled-but-empty updater as disabled with a warning', () => {
  /* endpoint '' → updater null, warnings.length === 1 */
});
it('validate lists missing required fields', () => {
  expect(validate({})).toEqual(expect.arrayContaining([expect.stringContaining('identifier')]));
});
it('convertFromV1 keeps identifier and lists dropped fields', () => {
  const { config, dropped } = convertFromV1(templateV1WithExtras); // template's game.build.conf.json + bundle.targets + tauri.cli
  expect(config.identifier).toBe('my.game.id');
  expect(config.updater.enabled).toBe(false); // template default has empty endpoint/pubkey
  expect(dropped).toEqual(expect.arrayContaining(['tauri.bundle.targets', 'tauri.cli']));
});
```

- [ ] **Step 2: Run, expect failure**

  Run: `pnpm vitest run --project standalone-config`

- [ ] **Step 3: Implement `generate.mjs` and `cli.mjs`**
  - The overlay is applied as an RFC 7396 merge patch over `src-tauri/tauri.conf.json`. `null` deletes keys from the base: set `plugins.updater: null` when disabled. Leave `plugins.cli` from the base in place, because the Rust side always registers the cli plugin and needs its config. It also sets `bundle.targets: "all"`, `bundle.publisher`/`copyright`/`category`/`shortDescription`/`longDescription`, and top-level `productName`/`version`/`identifier`.
  - **`--from-v1` mapping:**
    - `package.productName`/`version`
    - `tauri.bundle.{identifier,publisher,copyright,category,shortDescription,longDescription}`
    - `tauri.windows[0].{title,width,height,resizable,fullscreen,center}`
    - `tauri.updater.{active,endpoints[0],pubkey}` → `updater`
    - `build.*` is expected and not reported as dropped
    - every other leaf key path → `dropped`
  - **CLI missing-file behavior:** if the given `qspider.desktop.json` doesn't exist and `game.build.conf.json` exists beside it, print `Found old game.build.conf.json. Migrate it: see https://github.com/QSPFoundation/qspider-standalone-game-template#migrating-an-existing-game-repo-tauri-2` and exit 1.
- [ ] **Step 4: Run, expect pass**
- [ ] **Step 5: End-to-end check.** Write a sample `qspider.desktop.json` plus a bundled sample game in `public/game/` (do not commit the game), then:

  Run: `pnpm standalone:config public/game/qspider.desktop.json --out standalone.tauri.json && pnpm tauri build --debug --config standalone.tauri.json`. Add `standalone.tauri.json` to `.gitignore`.

  Expected: the app opens and the bundled game loads (this proves the standalone fix from Task 2). The window title and identifier come from the sample.

- [ ] **Step 6: Commit** — `feat(standalone): qspider.desktop.json and tauri config generator`

---

### Task 9: qSpider CI

**Files:**

- Modify: `.github/workflows/main.yml`, `.github/workflows/prerelease.yml`, `.github/workflows/demo.yml`

- [ ] **Step 1: `main.yml` + `prerelease.yml`**
  - Matrix `ubuntu-20.04` → `ubuntu-22.04`, and its `if:` updated to match.
  - apt packages: `libwebkit2gtk-4.1-dev build-essential libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev patchelf` plus the existing gstreamer list.
  - `publish-release` → `ubuntu-latest`.
  - The `tauri-action` env becomes `TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_KEY_PASSWORD }}`.
  - Keep `updaterJsonPreferNsis: true`.
- [ ] **Step 2: `demo.yml`**
  - Add `env: BRIDGE_RELEASE_TAG: ''`.
  - Refactor the fill step into a helper that downloads a release's `latest.json` to a given file.
  - Always write `updater-v2.json` from `getLatestRelease`.
  - Write `updater.json` from `getReleaseByTag(BRIDGE_RELEASE_TAG)` when the variable is set; otherwise from `getLatestRelease` (pre-bridge behavior).
  - Add a comment above `BRIDGE_RELEASE_TAG` explaining that once set, it must only change to a fixed bridge release that is also `v1Compatible`.
- [ ] **Step 3: Verify**
  - Run: `actionlint .github/workflows/*.yml` (or `npx --yes @action-validator/cli` per file if actionlint is absent).
  - Expected: no errors. Then push the branch and run `prerelease.yml` from it. All three desktop jobs should be green, and the release should include `.nsis.zip`, `.AppImage.tar.gz` and `.app.tar.gz` with `.sig` files (the `v1Compatible` form) plus `latest.json`.
- [ ] **Step 4: Commit** — `ci: tauri 2 builds, signing env mapping, split updater files`

---

### Task 10: Template repo update (separate repository)

**Repo:** `QSPFoundation/qspider-standalone-game-template`. Work on a branch in a fresh clone and open a PR. **Merge only together with the qSpider `release` merge (Task 11).**

**Files:**

- Delete: `game.build.conf.json`
- Create: `qspider.desktop.json` (template defaults, `updater.enabled: false`, `$schema` → raw GitHub URL of `tools/standalone-config/qspider.desktop.schema.json` on qSpider `release`)
- Modify: `.github/workflows/{release.yml,gh-pages.yml,gh-pages-updater.yml,gn-pages-game.yml}`, `README.md`

- [ ] **Step 1: Workflows**
  - all jobs `ubuntu-latest`
  - `pnpm/action-setup` + `actions/setup-node` with `cache: 'pnpm'` + `pnpm install --frozen-lockfile`
  - Linux deps as in Task 9
  - version read from `qspider.desktop.json` `.version`
  - before `tauri-action`, run `pnpm standalone:config public/game/qspider.desktop.json --out standalone.tauri.json`, and pass `args: --config standalone.tauri.json`
  - signing env mapping as in Task 9
  - the updater workflows write `updater-v2.json` instead of `updater.json`
  - the web zip `exclusions` lists `qspider.desktop.json` instead of `game.build.conf.json`
- [ ] **Step 2: README**
  - Rewrite the "Fill in rest of desktop settings" and "No autoupdates" sections for `qspider.desktop.json`; the endpoint example is `https://{user_name}.github.io/{repo_name}/updater-v2.json`.
  - Add `## Migrating an existing game repo (Tauri 2)`:
    1. copy the new workflow files
    2. run the converter from a qSpider checkout with `pnpm standalone:config --from-v1 path/to/game.build.conf.json > qspider.desktop.json`, or fill it in by hand
    3. **keep `identifier` exactly as before, or players lose their saves**
    4. review the dropped-fields list
    5. delete `game.build.conf.json`
    6. use `updater-v2.json` as the endpoint; players on the old v1 build of the game must reinstall once
    7. note that the minimum Linux is now Ubuntu 22.04-era
- [ ] **Step 3: Verify.** In a scratch game repo generated from the branch, run `release.yml` with qSpider's checkout ref temporarily pointed at the migration branch. All three desktop builds should be green, the installed game should load, and saves should persist across a restart.
- [ ] **Step 4: Commit and open the PR** (do not merge yet) — `feat: tauri 2 / qspider.desktop.json`

---

### Task 11: Release verification and bridge release

Manual. No code merges to `release` until all boxes are ticked.

- [ ] **Step 1: v1 test build.**
  1. `git worktree add ../qspider-v1test v1.4.0`.
  2. In its `src-tauri/tauri.conf.json`, set `tauri.updater.endpoints` to a test URL (a secret gist raw URL) for "bridge-test.json".
  3. Build installers for Windows, macOS and Linux (locally or via a throwaway branch running the old `main.yml`).
- [ ] **Step 2: Bridge candidate.**
  1. On the migration branch, temporarily set `plugins.updater.endpoints` to a second test URL ("v2-test.json").
  2. Bump the version to `2.0.0-rc.1` and run `prerelease.yml`.
  3. Put that release's `latest.json` in "bridge-test.json".
  4. Build `2.0.0-rc.2` the same way, and put its `latest.json` in "v2-test.json".
- [ ] **Step 3: Matrix, on each OS.** Install the v1 test build and populate it with a catalog game, a local-folder game with a Cyrillic file name and an icon, an archive game, slot and named saves, and a dark theme. Then:
  - update v1 → rc.1 via the normal prompt
  - library intact, all games launch, images/audio/`game.cfg` load
  - saves load
  - theme kept
  - CLI `-f` and positional launch work
  - open dialog works
  - drag-drop hover/unsupported/drop/leave work
  - resize/min/max/fullscreen/title/icon from game config work
  - exit works
  - external `https://` link in game text opens the system browser
  - Linux: before building rc.1, on a v1.4.0 Linux install note which `~/.local/share/*` dir holds the webview `localstorage`. v2 uses `~/.local/share/org.qsp.qspider`; if v1 used a different dir, the theme setting won't carry over on Linux. Decide whether to add a one-time copy or accept it
  - a game using root-relative (`/img/x.png`) resource paths still loads
  - restart → rc.1 → rc.2 update via the prompt
- [ ] **Step 4: Ship the bridge.**
  1. Revert the test endpoint and set the version to `2.0.0`.
  2. Merge to `release` and merge the template PR (Task 10).
  3. After the Release workflow publishes, set `BRIDGE_RELEASE_TAG: 'v2.0.0'` in `demo.yml`, commit, and run `demo.yml`.
  4. Confirm `updater.json` and `updater-v2.json` on gh-pages both reference 2.0.0 assets.
  5. Add "Do not delete: v1 → v2 update bridge" to the 2.0.0 release description.
  6. State the Linux minimum (Ubuntu 22.04-era / glibc 2.35 / WebKitGTK 4.1) in the 2.0.0 release notes (shown in the v1 update dialog) so users on older distros can decline. Alternatively, exclude `linux-x86_64` from the frozen `updater.json`; decide which.
- [ ] **Step 5: Post-bridge switch.** In the next release's PR, set `bundle.createUpdaterArtifacts: true` in `src-tauri/tauri.conf.json`. After it ships, confirm `updater.json` on gh-pages still references 2.0.0.
