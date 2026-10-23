# E2E Batch 2g — Resources, paths, sound Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cover inventory §G (resources and paths) and §H (sound) with real-engine E2E scenarios on both targets, and fix the resource-loading defects they expose:

- images: game-HTML `<img>`, action / object / menu images, the view image, CSS-variable images;
- paths: backslashes, subfolders, spaces, Cyrillic, wrong case, `?query`, absolute and `data:` URLs;
- `game.cfg` resources: fonts, styles, scripts (load before start, in order, removed on stop);
- resources from inside an archive (web service worker; desktop protocol and XHR shim);
- sound: `PLAY` (volume), `ISPLAY`, `CLOSE` one / all, replay, global mute / volume, stop on game stop, from an archive;
- the web CORS proxy fallback.

**Architecture:**

- **Sound is asserted without hearing it.**
  - The primary check is the real engine path: the game prints `ISPLAY('…')` into the main text after `PLAY` / `CLOSE` / `CLOSE ALL` / replay.
  - The secondary check is one new read-only named probe in `support/page-script.ts` that reads `window.Howler` (exposed by Howler itself): for a given source, whether it is playing and at what volume; globally, muted and volume.
  - No player-side test hooks.
- **Desktop audio sink.** WebKitGTK under the private Xvfb session may have no audio output. If the Task 1 spike shows that sounds fail to play there, the desktop runner routes audio to a null sink **inside the private session only** (e.g. GStreamer `fakesink` via the session environment). It never touches the host audio or the real session.
- **Web CORS proxy:** web only. Playwright route interception makes the origin request fail, and serves `https://proxy.qspider.xyz/**` from the fixture. The check confirms the game loaded and the proxied URL decoded to the original.
- **External URLs on desktop** (B7) are served by a local test server that the desktop runner starts inside the session. The Task 1 spike decides whether `data:` URLs suffice instead.
- **Fixtures:**
  - one source `resources-game`, packed as a zip (archive path) and also opened as a plain folder `.qsp` (desktop `local_path`, real case; web plain-folder route via the served dir);
  - generated PNGs (2f′ `transparentPng`) and a generated tiny WAV (PCM silence or short tone), with no committed binaries unless the generator can't produce the format;
  - a font file: a tiny valid font, committed (justify it), or the smallest generated one.

**Maintainer decisions (2026-10-23):**

- **Fixed in 2g, flagged ⚠ (player-visible), each RED→GREEN in its own `fix(...)` commit:**
  - **B7, absolute URLs pass through:**
    - `prepareUrl` (CSS-variable images) does not prefix `http:` / `https:` / `data:` (and other schemes);
    - the desktop XHR shim forwards external URLs to the real `XMLHttpRequest`, and `fetchBinaryContent` does not prefix them.
    - The scheme test needs **≥ 2 characters before `:`** (`/^[a-z][a-z0-9+.-]+:/i`), so a Windows drive path `C:\…` stays relative.
  - **B4/B5, `game.cfg` resources:**
    - the game starts only after its resources have loaded;
    - scripts run in declared order (`async = false`, like 2f's theme-script fix);
    - a resource that fails to load shows a notice instead of being swallowed.
  - **B6, the volume slider follows the volume:** `qsp-volume-slider` becomes controlled, so PageUp / PageDown changes show in it.
- **Parked:** B2 (`normalizeVolume(1)` = 100 %, not 1 %). Record it in the inventory; no change.
- **Fixed inline without a flag (design doc: "plain resource-loading bug fixes … fixed inline"):** RED→GREEN, separate `fix(...)` commits:
  - **B1, backslashes:** every backslash, not only the first, in `<img>`, CSS variables, view, sound paths and the sound key.
  - **The desktop case fallback** becomes a per-segment case-insensitive lookup in `game_uri.rs`, with unit tests.
  - **`?query` / `#` stripped** in the web service worker and the desktop protocol.
  - **The web service worker sets `Content-Type`** from the extension.
- **Sound assertion = ISPLAY + Howler probe** (above).

**Builder calls (mine; flag in review if wrong):**

- **Volume asserted through the probe.** The Howler probe is read-only and named, like `CssValues`: `soundState(srcSuffix)` → `{ playing, volume } | null` and `audioState()` → `{ muted, volume }`. Sources are matched by suffix, because the base differs per target.
- **Mute/volume UI:** the hotkeys work only on the pause screen (`when_paused`), so scenarios open the pause screen and use the existing pause tasks. The widgets (`qsp-mute-toggle`, `qsp-volume-slider`) are covered only if a built-in theme renders them; otherwise the fixture theme adds them.
- **`ISPLAY` treats a loading sound as playing** (`sound.ts:99-102`). Checks wait for the probe's `playing: true` before reading `ISPLAY`, so loading never stands in for playing.
- **CP866 Cyrillic names in old zips** (defect 10) belong to 2a archives, so they stay parked. 2g covers Cyrillic file names in UTF-8 zips and plain folders.
- **Out of scope (security, carved out with the sanitizer work):**
  - `game_uri.rs` does not reject `..` in the relative path;
  - `read_resource` takes the raw URL.

  Record them in "Suspected defects" with that pointer. Do not fix them here.

**Tech Stack:** Serenity/JS screenplay; web = Playwright; desktop = WebdriverIO + tauri-driver; fixtures as `.qsps` + TOML `game.cfg`, zipped by `fixtures/build-fixtures.ts`; Rust unit tests in `src-tauri` (`pnpm check:rust`).

**Spec:**

- `docs/superpowers/specs/2026-10-21-e2e-phase2-design.md` (2g; the "plain resource-loading bug fixes inline" decision).
- `docs/superpowers/specs/2026-10-21-e2e-engine-inventory.md` §G, §H, the 2g list, and defects 6–10 and 35.

## Global Constraints

- **Same as 2f′:**
  - NX/pnpm only;
  - desktop only via `run-desktop-e2e.mjs`: one run at a time, wait for it, rebuild after any change outside `apps/player-e2e`;
  - never touch the real session or kill processes by name;
  - plain branch `feat/e2e-2g-resources-sound`, no worktree.
- **README Rules:**
  - locators;
  - `seeEventually` / page-script helpers / presence helpers;
  - ≤ 150 lines per screenplay file;
  - no sleeps (the page-clock exception stays scoped to the counter checks);
  - `ExecuteScript` only in `support/page-script.ts`, read-only and named.
- **Fixtures:**
  - opened via `OpenGameFile`;
  - **≤ 8 actions per location**;
  - unique ALL-CAPS markers referenced only through `fixtures/*-game.ts`;
  - no apostrophes in QSP `!` comments.
- **Theme matrix:** resource and sound scenarios run **on both targets, once each**. Keep them coarse (several checks per scenario) to limit desktop relaunches. Web-only only where a step exists on one target (CORS proxy, plain-URL route), split per README "Single-target scenarios".
- **Fix policy:**
  - Only the maintainer-approved ⚠ fixes above, plus the plain resource-loading fixes.
  - Anything else player-visible: stop and report.
  - Every fix is RED→GREEN in its own commit.
  - **Never route a scenario around a bug: root-cause it first.**
- **Discrimination:** every key check is run once with its mechanism disabled and seen to FAIL; the ledger records it. Every absence check has a settled anchor.
- **Local verification:**
  - targeted specs per task, on both targets; Rust changes also run `pnpm check:rust`;
  - before each commit: `nx format:check --all`, plus `nx lint` and typecheck (lint-staged does not enforce `max-lines`; see defect 36);
  - **one** `pnpm check:full` at the end, after the final review's fixes.
- **CI:** Rust changes make the `rust` job run on the PR. Expect it.

## Review Focus

- **Autoplay / audio sink:** headless Chromium and WebKitGTK under Xvfb may never reach `onplay`, so `ISPLAY` would stay false or show a play error. The Task 1 spike settles this per target before any sound scenario is written.
- **Howler loads audio by XHR** (non-HTML5), so on desktop sound goes through the XHR shim. Images, fonts and scripts use the `qsp:` protocol directly. A path bug can therefore show only for sound, or only for images.
- **Backslashes on desktop:** WHATWG URL parsing converts `\` only for special schemes, so a raw `\` survives in `qsp://`. Web (http) may hide B1. A green web run is not evidence for desktop.
- **Case:** web archives are lowercased in IndexedDB (case-insensitive by construction). Desktop archive imports are lowercased on disk. Only a **plain folder** keeps real case, so the case scenario must use a plain folder on desktop.
- **`?query`:** the service worker's regex captures it into the path; Rust reads it as part of the file name.
- **B4 ordering:** awaiting the resources must not deadlock a game whose resource 404s. On failure, show the notice and start anyway.

---

## Task 1: Spike — sound and external URLs on both targets (no commits except the probe)

**Files:** `screenplay/support/page-script.ts` (+ split file if near 150 lines), README support list; a temporary scenario and fixture (deleted after).

- [ ] **Step 1:** Add the read-only named probes `soundState(srcSuffix)` and `audioState()` (self-contained, plain-data results), plus checks `SeeSoundState(suffix, expected)` and `SeeAudioState(expected)` through `seeScriptEventually`.
- [ ] **Step 2: Temporary game** with a generated WAV in a zip. Actions: `Play` (`PLAY 'snd/a.wav', 50`), `Is playing` (`*pl` the result of `ISPLAY('snd/a.wav')`), `Close`. Run it on web and desktop. Record:
  - whether `playing` becomes true;
  - what `ISPLAY` prints;
  - any `console.error` from `sound.ts`.
- [ ] **Step 3: If desktop never plays,** find the cause.
  - Look at the GStreamer sink, at WebKit's audio policy, and at the Howler state.
  - Route audio to a null sink **inside the private session** (runner env only). Re-run, and record the before/after.
  - If it can't be made to play, **stop and report**. Don't make sound webOnly silently.
- [ ] **Step 4: External URLs on desktop:** probe whether a `data:` URL reaches Howler through the shim, and whether a `data:` `$BACKIMAGE` renders, after a temporary local patch of B7 that is reverted afterwards. Decide between `data:` and a runner-served local HTTP server for Task 6, and record why.
- [ ] **Step 5:** Delete the temporary scenario and fixture. Commit only the probe and the runner env change, if one was needed: `feat(e2e): read-only sound probe` / `fix(e2e): desktop session audio sink`.

## Task 2: The resources fixture

**Files:**

- `fixtures/resources-game/`:
  - the qsps;
  - `game.cfg` with `resources`: two styles, two scripts, one font;
  - assets in mixed-case subfolders, including one with a space and one with a Cyrillic name.
- `fixtures/resources-game.ts`: the constants.
- `archives.ts` / `build-fixtures.ts` (+ spec cases): the zip, plus a plain-folder copy (desktop `local_path`; web served dir like `url-game`).

**Locations (≤ 8 actions each):**

- `start`: `<img>` by forward slash, by backslash path (`img\sub\a.png`), by spaces / Cyrillic name, by wrong case, by `?v=2`. An action with an image, an object with an image. Links to the other locations.
- `media`: view image by backslash path; menu with an item image; `data:` `$BACKIMAGE`; an external `$BACKIMAGE` (Task 1's choice).
- `resources`: text written by script 1 then script 2 (proves order); an element styled by style 1 (custom property read with the probe); a font check (the script writes `document.fonts.check(...)` into the game text, or the probe reads the computed `font-family` plus a loaded flag).
- `sound`: `Play` (vol 50), `Play again` (vol 80, already playing), `Is playing`, `Close`, `Play two`, `Close all`, `Play backslash` (`snd\b.wav`), each printing `ISPLAY`.

- [ ] **Step 1:** Write the fixture and constants, generated assets first (PNG via `transparentPng`; WAV via a tiny generator in `build-fixtures.ts`; font as decided).
- [ ] **Step 2:** Fixture spec cases: every referenced asset exists in the zip and in the folder with the intended case and name.
- [ ] **Step 3:** Commit `test(e2e): resources and sound fixture`.

## Task 3: Images and paths (RED → plain fixes)

**Files:** new `scenarios/resources.scenario.ts`; screenplay checks for images (`data-qsp` image markers exist for action / object / menu / view; a game-HTML `<img>` gets a fixture `data-qa`); fixes in `libs/renderer/src/theme-core/html/img.tsx`, `css-variables.tsx`, `libs/game-state` (view path, cleanPath use), `apps/player/src/service-worker.ts`, `src-tauri/src/game_uri.rs`.

- [ ] **Step 1: RED,** both targets. Scenario `game images load from every kind of path`.
  - Each image's `naturalWidth > 0` (a read-only probe for "loaded image" through page-script, or the existing `CssValues` on the `-w` size for CSS vars).
  - Covers forward, backslash, nested backslash, spaces, Cyrillic, wrong case (desktop plain folder; web archive), and `?v=2`.
  - Record which rows fail on which target.
- [ ] **Step 2: Fixes,** each a separate `fix(...)` commit, with a Rust unit test where Rust changes:
  - all backslashes, in `img.tsx` and `prepareUrl` (`cleanPath`); also the view path;
  - `?query` / `#` stripped in the service worker and in `game_uri.rs`;
  - the service worker sets `Content-Type`;
  - a per-segment case-insensitive lookup in `game_uri.rs`.
- [ ] **Step 3: GREEN** on both targets. Discriminate each fix by reverting it alone and seeing its row FAIL.
- [ ] **Step 4:** Commit the scenario: `test(e2e): game images from every kind of path (2g)`.

## Task 4: `game.cfg` resources (RED → ⚠ B4/B5)

**Files:** `scenarios/resources.scenario.ts`; `libs/game-state/src/resources.ts`, `current-game.ts`.

- [ ] **Step 1: RED,** both targets, scenario `game.cfg resources load before the game starts, in order`:
  - the script order text reads `SCRIPT ONE` then `SCRIPT TWO`;
  - the style applies;
  - the font is loaded;
  - all present at the first `SeeGameStarted` (the start location reads a value script 1 set, so starting early shows a different text).
- [ ] **Step 2: RED,** scenario `game.cfg resources are removed when the game stops`. Return to the shelf, then check that no `[data-qspider-resource]` is left (settled anchor: the shelf titles). Then start another game, which shows no fixture style.
- [ ] **Step 3: RED,** scenario `a missing game.cfg resource shows a notice and the game still starts`: a cfg variant with a 404 script.
- [ ] **Step 4: Fix** (⚠, approved): await resources before the engine runs the game, set `async = false` on scripts, show a notice on a failed resource, and start anyway. Commit `fix(game-state): game.cfg resources load before the game, in order`.
- [ ] **Step 5: GREEN** on both targets. Discrimination: drop `async = false` and see the order check FAIL (if order is not deterministically broken by that alone, make script 1 larger or delay it through the test server and record how); un-await and see Step 1 FAIL.

## Task 5: Sound

**Files:** new `scenarios/sound.scenario.ts`; sound checks (ISPLAY text plus the probe); fixes in `libs/game-state` (sound path `cleanPath`, the sound key) and `volume-slider.tsx` (B6).

- [ ] **Step 1: Scenario `PLAY, replay, ISPLAY and CLOSE`** (both targets):
  1. `Play` → probe `playing` with `volume 0.5` → `ISPLAY` prints 1;
  2. `Play again` → still playing, not restarted, volume 0.8;
  3. `Close` → `ISPLAY` 0;
  4. `Play two` → both playing;
  5. `Close all` → both stopped.
- [ ] **Step 2: Scenario `a sound path with backslashes`.** `Play backslash`, then `ISPLAY` with the forward-slash spelling prints 1, and `CLOSE` with the forward-slash spelling stops it. RED first, then the fix: `cleanPath` for sound paths and for the key, as a plain fix.
- [ ] **Step 3: Scenario `mute and volume`.**
  - Open the pause screen.
  - Press `Home`, and the probe shows `muted: true`; press `End`, and it shows `muted: false`.
  - Press `PageDown` twice, and the volume is 0.8.
  - The slider's `aria-valuenow` follows: RED → B6 fix, ⚠ `fix(renderer): volume slider follows the volume`.
- [ ] **Step 4: Scenario `sounds stop when the game stops`.** `Play`, then return to the shelf, and the probe shows no source. Anchor: the shelf, plus the probe having been non-null before.
- [ ] **Step 5: Discrimination:**
  - make `close` a no-op → Step 1 fails;
  - skip the key `cleanPath` → Step 2 fails;
  - revert B6 → Step 3's slider row fails;
  - drop `sounds$.actions.clear()` → Step 4 fails.

  Revert each.

## Task 6: Absolute and `data:` URLs (RED → ⚠ B7)

**Files:** `scenarios/resources.scenario.ts` / `sound.scenario.ts`; `css-variables.tsx` `prepareUrl`; `libs/desktop/src/lib/setup.ts` (XHR shim), `data-fetcher.ts`; `libs/utils` (scheme test).

- [ ] **Step 1: RED:**
  - a `data:` `$BACKIMAGE`, and the external one per Task 1, apply: `--background-image` equals the URL unchanged and `-w` > 0, on both targets;
  - on desktop, `PLAY` of the external sound plays (probe).
- [ ] **Step 2: Fix** (⚠, approved): one shared `isExternalUrl` (≥ 2 characters before `:`), used by `prepareUrl`, the XHR shim (forward to the real XHR) and `readBytes`. A unit test of the helper in `libs/utils` (pure logic) covers `C:\x`, `http://x`, `data:x` and `qspider:x`. Commit `fix(renderer): absolute and data: URLs pass through`.
- [ ] **Step 3: GREEN** on both targets. Discrimination: revert each half and see its row FAIL.

## Task 7: Web CORS proxy (web only)

**Files:** `scenarios/open-routes.scenario.ts` (or new); `targets/web/` route helper behind `OperatePlayer` if the step needs the Playwright page (README "Target differences"); desktop gets `scenario.webOnly` (it has no proxy).

- [ ] **Step 1: Scenario `a game URL the browser cannot fetch loads through the CORS proxy` (web only).**
  - Route the origin URL to abort.
  - Fulfil `https://proxy.qspider.xyz/**` with the fixture.
  - Check that the game starts, and that the proxied path decodes to the original URL (record the requests in the web target).
- [ ] **Step 2: Discrimination:** remove the `.catch` fallback in `libs/utils/src/fetch.ts`, and the scenario must FAIL. Revert.

## Task 8: Docs

- [ ] **Step 1: Inventory:**
  - §G / §H rows → ✅ with scenario names;
  - the 2g list marked done;
  - defects 6–9 and 35 marked fixed in 2g;
  - B2, B4–B7 recorded (fixed or parked);
  - the `..` / `read_resource` security items pointed at the sanitizer carve-out;
  - anything new that was found.
- [ ] **Step 2: README:**
  - the new probe (support list);
  - the resources and sound fixtures;
  - the desktop audio-sink note if one was added (Desktop isolation section);
  - the CORS proxy web-only route.
- [ ] **Step 3:** Commit `docs(e2e): resources and sound coverage (2g)`.

## Task 9: Whole-branch review and verification

- [ ] **Step 1:** Final whole-branch review on the most capable model (spec, quality, scenario bar). Apply its fixes in one wave plus one scoped re-review.
- [ ] **Step 2:** Run `nx format:check --all`, lint and typecheck. Then run **one** `pnpm check:full`, and read `CHECKFULL_EXIT=` and the desktop `Spec Files:` line from the log body.
- [ ] **Step 3:** Push and open a PR against `main`. The body covers:
  - the ⚠ fixes (B7, B4/B5, B6);
  - the plain fixes;
  - the probe;
  - the audio-sink change;
  - the desktop duration;
  - parked items (B2, CP866, the security items).
