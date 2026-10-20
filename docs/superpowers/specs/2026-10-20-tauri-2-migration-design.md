# Tauri 2 migration — design

Date: 2026-10-20
Status: ready for owner review

## Intent

Move qSpider's desktop builds (the main desktop player and the standalone game builds) from Tauri v1 to Tauri v2.

Why:

- **Get off an aging stack.** v1 is in maintenance mode, `tauri-plugin-window-state` is pinned to a git `v1` branch, and the JS APIs in use are deprecated.
- **Open a path to mobile.** A native mobile app is a possible future project. It is worth building only for what the PWA cannot do: **opening local game files** and **storage the OS won't purge**. This migration must not block that future, but it does not deliver mobile.

Success: existing desktop users and players of standalone games auto-update to the v2 build and notice nothing except that the app still works. Game authors make a one-time, documented change to their repo, and after that never deal with Tauri config again.

## Goals

1. The desktop player (`apps/player-desktop` + `src-tauri`) runs on Tauri v2 on Windows, macOS and Linux with feature parity with today.
2. The standalone desktop build (what the template repo builds; `src-tauri/standalone.conf.json` is only the local-dev overlay) runs on Tauri v2 and **actually loads its game** (see "Current state": it appears broken since v1.3.0).
3. **Everything carries over** for existing users: game library, saves, games opened from local folders, and the theme setting (`localStorage`).
4. **v1 installs of qSpider auto-update to v2** through their normal updater, **at any time**, including users who wait months or years to update. (Standalone games skip this; see §6.)
5. **Update UX is the same as today:** check on startup, ask, install, restart.
6. **Tauri config is abstracted away from game authors.** Authors edit a small qSpider-owned config. qSpider generates the Tauri config from it at build time.
7. The template repo (`QSPFoundation/qspider-standalone-game-template`) is updated, and includes a migration guide for existing game repos.
8. **Mobile-ready boundaries:** all Tauri-specific code lives behind the `@qspider/env` seam (`libs/desktop`). Game-file serving and storage are not shaped in ways that only work on desktop.

## Non-goals

- Building mobile (Android/iOS) targets, or any mobile-specific UI.
- New desktop features (file associations, a menu bar, tray, etc.).
- Redesigning storage (it stays as JSON + files under the app data dir).
- Keeping un-migrated game repos building. Authors are asked to update them once.
- Changing the web player or web standalone builds beyond what shared code requires.

## Anti-goals (a failure even if it "works")

- A user updates and their library, saves, or locally-opened games are gone or broken.
- v1 users are stranded and have to discover and reinstall v2 by hand.
- A game author follows the migration guide and their players lose saves. This happens if the bundle identifier changes, because that moves the app data dir.
- The update prompt or any other existing desktop UX behaves noticeably differently.
- Tauri imports spread further into apps and shared libs, making a future mobile env harder.

## Constraints

- Tauri v2 on Linux requires webkit2gtk-4.1. Distros older than roughly Ubuntu 22.04 lose support. This is unavoidable and gets mentioned in release notes.
- The bundle identifier `org.qsp.qspider` must not change, because it determines the app data dir where the library and saves live.
- The updater signing key must stay the same, since v1 installs verify v2 updates with the existing pubkey.
- v1 installs have the endpoint `https://qspfoundation.github.io/qspider/updater.json` baked in. After the bridge release, that file is **frozen forever** (§6).
- The template's CI checks out qSpider's `release` branch. Whatever lands on `release` is what every game repo builds against.

## Decided with the project owner

- Scope: desktop migration only, with mobile-ready boundaries. Mobile is a separate, later project.
- Full carry-over of user data, plus a v1→v2 auto-update bridge.
- Update UX same as today.
- Standalone builds are in scope. The template repo is updated as part of this project.
- Game authors may be asked to make a one-time update to their repos.
- Tauri config is abstracted behind a qSpider-owned game-build config.
- No standalone desktop games with real players are known. Standalone builds **skip the update bridge**: they use the v2 update format from the start, and the migration guide says existing v1 players of a game reinstall once. Data carry-over code is shared with the player, so it applies anyway, but it isn't separately tested (§10).
- **Two update URLs:** a single bridge release is published to the old `updater.json`, which is then frozen; v2 checks a new `updater-v2.json` (§6).
- The v1→v2 update is proven with a test build of v1.4.0 pointed at a test endpoint, not by redirecting the stable `updater.json`.

## Current state (what exists)

- `src-tauri/src/main.rs` (~140 lines):
  - a `qsp` URI scheme protocol that serves files from a registered game folder (uuid → path map)
  - `prepare_game_start` and `read_resource` commands
  - `tauri-plugin-window-state`
  - `WEBKIT_DISABLE_COMPOSITING_MODE=1`
  - case-insensitive file fallback (retry with a lowercased path)
- `src-tauri/tauri.conf.json`:
  - `allowlist.all`, with the fs scope limited to `$APPDATA`
  - a CLI with a positional `filePath` and `-f/--file`
  - the updater with `dialog: true`
  - NSIS with custom Russian/Ukrainian language files and a language selector
  - `webviewInstallMode: embedBootstrapper`
  - one hidden window (`visible: false`)
  - `freezePrototype: false`
- `src-tauri/standalone.conf.json` is an overlay that points the build at `dist/apps/player-standalone`. It is used only by the local `start:desktop-standlone` script. The template does **not** use it: its `game.build.conf.json` carries its own `build` section and is the only `-c` overlay.
- ☝️ **Standalone desktop appears broken since v1.3.0** (commit 1a54386). In desktop mode, `apps/player-standalone` resolves `@qspider/env` to `libs/desktop`, whose `fetchTextContent`/`fetchBinaryContent` always `invoke('read_resource')`. The standalone game lives in the bundled frontend (`tauri://localhost/game/…`), not behind the `qsp` protocol, so `read_resource` fails with "Game not found".
- JS usage of `@tauri-apps/api` v1:
  - `libs/desktop`: `data-fetcher.ts`, `tauri-storage.ts`, `utils.ts` (fs), `window-manager.ts` (window/os/process)
  - `libs/importers/src/lib/desktop-importer.ts` (path, invoke)
  - `apps/player-desktop/src/app`: `init.ts` (cli), `app.tsx` (`tauri://file-drop*` events, path), `open-game-button.tsx` (dialog)
- Game URLs: `buildGameUrl` (duplicated in `tauri-storage.ts` and `desktop-importer.ts`) produces `qsp://<uuid>/` (macOS/Linux) or `https://qsp.<uuid>/` (Windows). The uuid is the URL **host**.
- Persisted data: `<appData>/qspider_1.db` (JSON) holds `games` and `saves`. A library entry stores `loadConfig.url` (the game URL above), `local_id` (uuid), `local_path`, and possibly `icon` as a full game URL (`${urlPrefix}${icon}`). Binary data lives under `<appData>/<game_id>/{game,saves}/`.
- `libs/desktop/src/lib/setup.ts` overrides XHR when `baseUrl$` starts with `qsp://`, routing reads through `read_resource`.
- CI (`main.yml`, `prerelease.yml`): `tauri-action@v0` with `TAURI_PRIVATE_KEY`/`TAURI_KEY_PASSWORD`, Linux on `ubuntu-20.04` with `libwebkit2gtk-4.0-dev`, `updaterJsonPreferNsis: true`. The `publish-release` job also runs on `ubuntu-20.04`.
- ☝️ GitHub retired the `ubuntu-20.04` runners in 2025. The Linux desktop and publish jobs in qSpider CI, and two template jobs, are likely broken today.
- Template repo:
  - each game repo carries its own Tauri-v1-format `game.build.conf.json`, passed to `tauri-action` with `-c`
  - its CI uses `npm ci` with `cache: 'npm'`, but qSpider has only `pnpm-lock.yaml`, so this is broken today
  - its CI runs `apt-get install webkit2gtk-4.0` (not a real package name, so Linux desktop builds fail), runs `create-release`/`publish-release` on `ubuntu-20.04` (`build-desktop` already uses `ubuntu-latest`), reads the release version from `package.version` in the v1 file, and runs `tauri icon` on the game icon

## Design

### 1. Rust side

- Upgrade to the latest Tauri 2.x and `tauri-build` 2.x. Replace v1 features (`api-all`, `updater`, `cli`, …) with plugins: `fs`, `dialog`, `cli`, `os`, `process`, `updater`, plus `window-state` v2 from crates.io.
- Enable the Tauri cargo features `image-png` and `image-ico`, because `setIcon` is called with PNG/ICO bytes from the game.
- Keep `WEBKIT_DISABLE_COMPOSITING_MODE=1` and the release profile.
- **Rewrite the `qsp` protocol handler** for the v2 signature (`UriSchemeContext`, `http::Request<Vec<u8>>` → `http::Response<Vec<u8>>`):
  - Read the game uuid from the **first path segment**, not the host (see §2).
  - Keep behavior: 200 for POST with an empty body, `Access-Control-Allow-Origin: *`, mime from the extension, 404 for a missing file or unknown game, and the lowercase-path fallback.
  - No panics on malformed input. Replace the `unwrap()`s and `?`s with 400/404 responses.
- **`read_resource`** uses the same URL parsing as the protocol (one shared function). It returns raw bytes via `tauri::ipc::Response` instead of a JSON number array; the JS side receives an `ArrayBuffer`. *(My call: the function is being rewritten anyway, and this removes a large serialization cost for images and audio.)*
- `prepare_game_start` is unchanged in behavior, but returns an error rather than panicking on a bad uuid.

### 2. Game URL scheme

v2 serves custom protocols at `qsp://localhost/<path>` (macOS/Linux) and `http(s)://qsp.localhost/<path>` (Windows). The host can no longer carry the uuid.

- The new game URL is `<protocol base>/<uuid>/`, where the protocol base is built by **one helper in `libs/desktop`**. Use `convertFileSrc('', 'qsp')` or equivalent, so the platform difference lives in one place. `desktop-importer.ts` imports it rather than duplicating it.
- Windows uses the HTTPS variant (see §4), so the URL is `https://qsp.localhost/<uuid>/`.
- The XHR override in `setup.ts` detects game URLs with that helper (`isGameUrl(url)`), replacing `startsWith('qsp://')`.

### 3. Data carry-over

- The app data dir is unchanged because the identifier is unchanged. **Verify on all three OSes** that v2 `appDataDir()` resolves to the same folder v1 used, before release.
- **Library URL migration.** In `TauriStorage.initialize()`, for every game with `loadConfig.local_id`:
  - rebuild `loadConfig.url` with the new helper
  - rewrite `icon` if it starts with the game's old URL prefix
  - flush once if anything changed
  
  The migration is idempotent. A game whose old URL can't be mapped keeps the existing removal rule (it is dropped only if `prepare_game_start` fails, as today).
- Catalog-downloaded games (stored under `<appData>/<id>/game/`) go through the same path, since they also have `local_id`/`local_path`.
- Saves need no migration (they are file-based and keyed by game id).
- `localStorage` (theme, debugger layout) survives because the webview origin is unchanged: `tauri://localhost` on macOS/Linux, and `https://tauri.localhost` on Windows via `useHttpsScheme: true`.
- Window size/position from `window-state` may reset once if the v2 plugin uses a different state file. *(My call: acceptable, no migration.)*

### 4. Config and permissions

- Convert `tauri.conf.json` to the v2 schema (`tauri migrate` is a fine starting point):
  - `build.frontendDist`, `build.devUrl`, top-level `identifier`, `productName`, `version`
  - `bundle.*` including NSIS languages, custom language files, `displayLanguageSelector`, and `webviewInstallMode`
  - `app.security.freezePrototype: false`
  - `app.windows[0]` as today, plus `useHttpsScheme: true`
  - `plugins.cli` with the same args
  - `plugins.updater` with the **new** endpoint `https://qspfoundation.github.io/qspider/updater-v2.json` and the same pubkey
- `bundle.createUpdaterArtifacts`: `"v1Compatible"` for the bridge release only, `true` (v2 format) afterwards (see §6).
- Replace `allowlist.all` with a **least-privilege capability** file for the main window, covering only what the code uses:
  - fs read/write/exists/mkdir/remove scoped to `$APPDATA/**`
  - dialog open
  - cli matches
  - os type/platform
  - process exit/relaunch
  - window size, min/max size, resizable, title, icon, fullscreen, and show if needed
  - core event listen
  - updater check/download/install
  - webview drag-drop

  Game folders are not exposed to the fs plugin; they are read only through the `qsp` protocol / `read_resource`.
- `standalone.conf.json` becomes a v2-schema overlay with the same purpose (local dev only).
- Keep the `devtools` cargo feature, so release builds keep devtools as today. *(My call: parity, and useful for game authors.)*

### 5. JS side

All Tauri imports move into `libs/desktop`. `apps/player-desktop` and `libs/importers` call desktop functions through `@qspider/env` (or `libs/desktop` exports), and do not import `@tauri-apps/*` directly. *(My call: this is the "mobile-ready boundary". A future mobile env replaces `libs/desktop`, not app code.)*

- `@tauri-apps/api` v2 plus the plugin JS packages.
- `tauri.invoke` → `invoke` from `@tauri-apps/api/core`.
- fs (`utils.ts`) → `@tauri-apps/plugin-fs`:
  - `readBinaryFile` → `readFile`
  - `writeBinaryFile` → `writeFile`
  - `createDir` → `mkdir`
  - `removeFile`/`removeDir` → `remove`
  - `{ dir }` → `{ baseDir }`
- Window (`window-manager.ts`):
  - `appWindow` → `getCurrentWindow()`
  - os → `@tauri-apps/plugin-os`: `type()` is now synchronous and returns `'windows' | 'macos' | 'linux'`, so `platformsMap` gets new keys
  - process `exit` → `@tauri-apps/plugin-process`
  - Keep the macOS height workaround (`adjustHeight`) and re-test it, since the upstream bug may be fixed.
- CLI (`init.ts`) → `@tauri-apps/plugin-cli` `getMatches()`. Same arg names.
- Open dialog → `@tauri-apps/plugin-dialog` `open()`, same filters/behavior.
- File drop (`app.tsx`) → `getCurrentWebview().onDragDropEvent()`. Map `enter`/`over` to today's hover handling, `drop` to today's drop handling, and `leave` to today's cancelled handling. The payload is `{ paths }`, not a bare array.
- `data-fetcher.ts`: `read_resource` now returns an `ArrayBuffer`. Keep the UTF-16LE BOM detection.
- **Fixes standalone:** the desktop `data-fetcher` routes only game-protocol URLs (`isGameUrl`) through `read_resource`. Any other URL, such as the bundled standalone game at `<app origin>/game/`, uses plain `fetch`, as the browser env does. *(My call.)*
- **XHR override:** keep today's platform split. The override in `setup.ts` applies on macOS/Linux only; on Windows, game XHRs keep going straight to the protocol. *(My call: no behavior change on the platform that works today.)*

### 6. Updater and the v1→v2 bridge

- **UX same as today:** on startup, check. If an update exists, show a confirm dialog with the version and notes. On yes, download + install, then relaunch. On no, continue. Errors are silent (logged), as with v1's dialog.
  - The builder chooses whether the dialog is `plugin-dialog`'s native `ask()` (closest to today's look) or the app's own Radix dialog. My call: native `ask()`, for parity.
  - The check lives in `libs/desktop`, so it applies to both the player and standalone builds.
- **Background:** v1's updater only understands archived update packages (`.nsis.zip`, `.AppImage.tar.gz`, `.app.tar.gz` + `.sig`). By default, v2 signs and serves the plain installers, which v1 can't apply. `createUpdaterArtifacts: "v1Compatible"` makes v2 produce the old format, which v2's updater also accepts.
- **Two update URLs (decided with the owner):**
  1. **Bridge release** (the first stable v2, e.g. 2.0.0) is built with `v1Compatible`. Its `latest.json` is published **once** to the old `updater.json`.
  2. **`updater.json` is then frozen.** No workflow writes it again, so it permanently points at the bridge release.
  3. **All v2 builds**, including the bridge itself, check the new `updater-v2.json`. Every release after the bridge is built with the default v2 format (`createUpdaterArtifacts: true`) and updates only `updater-v2.json`.
  4. A v1 user updating at any time goes v1 → bridge, then on the next startup check, bridge → latest v2. That means two updates and two restarts.
- **Hard rules:**
  - The bridge release and its assets must **never be deleted** from GitHub Releases, because the frozen `updater.json` links to them. Note this in the release description.
  - If the bridge has a bug, publish a fixed bridge (e.g. 2.0.1, also `v1Compatible`) and repoint `updater.json` to it by changing the pinned bridge tag (§9).
- **How the bridge flag is set:** the builder decides whether it's a config overlay used only for the bridge build or a workflow input. Either way, it must be impossible for a normal release to write `updater.json`.
- **Standalone games:** no bridge. The generator always emits the v2 format. The author's `updater.endpoint` is used as-is; the migration guide recommends a new file name (e.g. `updater-v2.json`), so any v1 players' apps don't try to apply a package they can't read. *(My call: no known standalone players.)*
- CI passes the signing key as `TAURI_SIGNING_PRIVATE_KEY` / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`, **mapped from the existing secrets** (`${{ secrets.TAURI_PRIVATE_KEY }}`), so no secret has to be renamed in any repo. *(My call.)*
- Keep `updaterJsonPreferNsis: true`.

### 7. Game-build config for standalone builds

Game authors stop editing Tauri config. qSpider owns a small config file and a generator.

- **File:** `qspider.desktop.json` in the game repo root, which lands in `public/game/` in CI. *(Name is my call. A distinct name avoids confusion with the old v1 file.)* A JSON Schema ships in the qSpider repo for editor autocomplete. Fields:
  - `productName`, `version`
  - `identifier` — must equal the old `tauri.bundle.identifier` for existing games
  - `publisher`, `copyright`, `category`, `shortDescription`, `longDescription`
  - `window`: `title`, `width`, `height`, `resizable`, `fullscreen`, `center`
  - `updater`: `enabled`, `endpoint`, `pubkey`
- **Generator:** a Node script in qSpider, e.g. `pnpm standalone:config <path>`. It validates the file and writes a **self-contained** Tauri v2 config overlay, including the `build` section (`frontendDist` → `dist/apps/player-standalone`, `beforeBuildCommand` → the standalone desktop build). The build passes it as the single `--config`. It produces the updater plugin config (v2 artifact format, no `v1Compatible`). It omits updater config entirely when `enabled: false`.
- **Clear failures:**
  - If `qspider.desktop.json` is missing but an old `game.build.conf.json` exists, fail with a message pointing to the migration guide.
  - Required fields missing → fail and name them.
- **Auto-convert helper:** the same script has a `--from-v1 <game.build.conf.json>` mode that prints a `qspider.desktop.json` built from an old v1 file. This carries over the identifier exactly, so authors don't have to retype it. It **lists every v1 field it dropped** (anything outside the schema: custom targets, icons, NSIS, CLI, …), so nothing is lost silently.
- **Updater enabled but empty:** `enabled: true` with an empty endpoint or pubkey (the template's v1 default) is treated as disabled, with a warning. *(My call.)*
- The JSON-schema version of the config gets a `"$schema"` / version field, so it can evolve later.

### 8. Template repo update

In `QSPFoundation/qspider-standalone-game-template`:

- Replace `game.build.conf.json` with `qspider.desktop.json`.
- Workflows:
  - pnpm (`pnpm/action-setup`, `pnpm install --frozen-lockfile`)
  - `ubuntu-latest` everywhere (no `ubuntu-20.04`)
  - webkit2gtk-4.1 packages
  - run the generator, then pass `--config <generated>` to `tauri-action`
  - map the signing secrets as in §6
  - update the version-reading step to read `version` from `qspider.desktop.json`
  - the gh-pages updater workflows write `updater-v2.json` instead of `updater.json`, and the README's endpoint example becomes `https://{user}.github.io/{repo}/updater-v2.json`
- README:
  - update the setup steps
  - add a **"Migrating an existing game repo (Tauri 2)"** section: copy the new workflow files, run `--from-v1` (or fill the new file by hand), **keep the identifier unchanged** (and why), delete the old file, release
  - mention the Linux floor change
- Merge the template update when the v2 qSpider lands on `release`, so new repos and the guide match what `release` builds.

### 9. qSpider CI

- `main.yml` / `prerelease.yml`:
  - Linux on `ubuntu-22.04` or newer
  - webkit2gtk-4.1 and the existing gstreamer packages
  - the `publish-release` job off `ubuntu-20.04`
  - signing secret mapping as in §6
  - a current `tauri-action` that supports v2
- ☝️ `demo.yml` deploys the whole web player to gh-pages with `clean: true`, and regenerates `updater.json` from the latest release's `latest.json` on every run. So "frozen" can't mean "left alone"; it has to be rebuilt from a fixed source on every deploy:
  - `updater.json` ← `latest.json` of the **bridge release, pinned by tag** (one place in the repo, e.g. a workflow env var `BRIDGE_RELEASE_TAG`). Changing the tag is the escape hatch for a fixed bridge.
  - `updater-v2.json` ← `latest.json` of the latest release (today's logic, new file name).
  - Until the bridge release exists, the current behavior stays (latest → `updater.json`).

  If this is missed, the first post-bridge deploy overwrites `updater.json` with a v2-format package and silently strands v1 users.

### 10. Rollout and verification

- Ship first as a **prerelease** for v2→v2 and general testing.
- **Bridge test:** build v1.4.0 from its tag with the updater endpoint changed to a test `updater.json` (e.g. a gist or a branch of gh-pages) that points at the `v1Compatible` artifacts of a bridge-candidate prerelease. Also point that candidate's v2 endpoint at a test `updater-v2.json` serving a later test build, so the second hop (bridge → latest v2) is verified too. Use those installs for the v1 → v2 rows below. The stable `updater.json` is never pointed at a prerelease. After the stable v2 release, watch the first real updates (issues/feedback) closely.
- Manual verification matrix (Windows, macOS, Linux), each starting from the **v1.4.0 test build** with a populated library:
  - Auto-update from v1 to the v2 prerelease succeeds, through the normal prompt.
  - The library is intact. Catalog games, local-folder games, archives, and games with icons all launch, and resources (images, audio, `game.cfg`) load.
  - Saves (slot and named) load.
  - The theme setting is preserved.
  - CLI launch with a file path and with `-f` works; open dialog, drag-and-drop (hover / unsupported type / drop / leave), window resize/min/max/fullscreen/title/icon from game config, and exit all work.
  - v2 → next v2 update works.
- Standalone: build a sample game from the updated template, using a qSpider branch before `release` (allowed), on all three OSes. Confirm the game loads, saves persist across restarts, and v2 → next v2 update works when the updater is configured. No v1 → v2 standalone test, since there are no known standalone players.

## Left to the builder

- Exact Tauri/plugin versions, the capability file layout and names, and whether `tauri migrate` output is kept or hand-written.
- Code structure of the protocol/URL parsing, the migration code, and the generator script.
- Whether to show the window from JS or rely on `window-state`. Today's hidden-window behavior must be preserved.
- Whether `adjustHeight` is still needed on macOS.
- Order of work and how it's split into PRs, provided `release` only receives the complete migration.
