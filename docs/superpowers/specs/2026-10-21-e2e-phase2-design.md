# Phase 2 — Broaden the E2E scenarios: design

Date: 2026-10-21. Supersedes the Phase 2 sketch in `2026-10-20-automated-checks-design.md` (that was a pre-inventory estimate).
Companion: `2026-10-21-e2e-engine-inventory.md` — the full map of player↔engine and player↔platform touch points, their file:line locations, current coverage, and the batched scenario list. This doc is the authority on intent, scope and conventions; the inventory is the authority on what each scenario targets.

## Intent and why

The player is only trustworthy where it has been run against the real QSP engine and the real platform. Today 5 scenarios cover ~8 of ~100 integration points. Phase 2 raises that toward full coverage of every point where the player integrates with something external: the QSP engine (`@qsp/wasm-engine`), browser/Tauri storage, the filesystem, runtime translations, and platform dialogs. Where the player's behaviour defines "correct", the maintainer approves the scenario before it is built; the approved batch list in the inventory is that approval.

## Goals

- A scenario for every integration point in the inventory (sections A–M), run on both web and desktop unless a point is target-specific.
- Each new scenario either passes against current behaviour or, where it exposes a real defect (marked ⚠ in the inventory), is paired with the fix in the same PR — unless the fix changes behaviour players rely on, in which case the maintainer decides first.
- The test pack grows to carry the fixtures these scenarios need, shared across both targets.

## Non-goals / anti-goals

- **Not** unit-test territory: pure HTML→DOM conversion (inventory §D′) belongs to Phase 4, not here. Do not fold it in.
- **Not** the sanitizer security fix: that is a separate, prior piece of work with its own design (see "Carved out" below). Phase 2 does not depend on it.
- **Not** pixel/visual-regression testing. Aero "look" is asserted via applied CSS custom-property values and element presence, never screenshots.
- **Anti-goal:** a scenario that passes by mocking or bypassing the external piece it claims to test. If it doesn't exercise the real engine/storage/FS/translations/platform, it does not belong in this suite.
- **Anti-goal:** hidden or skipped failures. A red scenario blocks its PR; it is fixed or the PR waits. No "known failures" list.

## Constraints

- Follow `apps/player-e2e/README.md`: areas; elements/tasks/checks; locate only by `data-qsp*` / role / `data-qa`; `seeEventually`; presence helpers; `OperatePlayer`; tagged scenarios; themes as a dimension.
- Run tasks through NX, never direct tool invocations.
- Desktop stays headless and isolated (private runtime/home dirs; never the real session). Web needs `CHROME_BIN`.
- `pnpm check` / `check:full` must stay green; every required check (`frame`, `rust`, `e2e-web`, `e2e-desktop`) must pass per PR.

## Decisions made (maintainer-approved)

- **Scope resolved after builder-check (2026-10-21):**
  - **2i (standalone builds) moves to Phase 3.** No standalone E2E target exists (no `targets/standalone/`, no startup marker in the standalone app); it is new target infrastructure, and the `2026-10-20` design already scoped standalone to Phase 3. Phase 2 is **2a–2h**, and all of it is done (2h shipped last).
  - **Across-restart persistence (2d, 2h) is in**, and needs a new restart helper that **keeps** the private data dir (the existing one wipes it before every scenario). The new variant stays fully isolated — private data/home dirs, never the real session.
  - **Catalog-from-network (2h) is dropped.** It fights the offline/isolated, no-flake anti-goals; revisit only if a local fixture catalog is ever wanted.
  - **The five visible-behaviour ⚠ fixes are approved to fix in their batch** (flagged in each PR): `<form qsp-on:submit>` submitting (2c), `.7z` drop accepted (2a), missing-`defaultTheme` Aero fallback (2f), failed `?game=` closes the loader with an error (2a), `qsp-bind` input escaped (2c). Plain resource-loading bug fixes (backslash paths, desktop case fallback) are fixed inline without a flag.
- **Batch order fixed:** 2a → 2h, as in the inventory. Ordered by historic breakage (paths/names, archives, saves, lifecycle break most, from the fix-commit clustering) and by shared fixtures.
- **One PR per batch.** Each reviewed and merged on its own; no mega-PR. Keeps review tractable and CI bisectable.
- **Fix ⚠ defects in the same PR by default;** ask the maintainer first only when the fix changes player-visible behaviour.
- **2f′ (Aero look):**
  - Add a reusable check that reads an applied CSS custom-property value (via `page.evaluate` on web, `browser.execute` on desktop). This is a new kind of check — the first that reads computed style rather than text/attributes — and is accepted.
  - Add `data-qsp` hooks to the Aero elements that currently have only classes (e.g. the shade overlay `.qsp-overlay`), so they can be located per the README convention rather than by class. This is a small production change in `libs/renderer`. The same applies to the wait-lock element (2b), which is also class-only (`wait-lock.tsx`): add a `data-qsp` hook there too (builder's call, consistent with this decision).

### Settled builder questions (my calls, after builder-check)

- **System-command observability (2e/§K):** `event:` dispatches a `window` CustomEvent and `fullscreen:` calls the Fullscreen API — neither is a DOM node. Assert `event:` with the same page-evaluate check introduced for 2f′ (register a listener in the page, assert it fired); this reuse is intended, not limited to 2f′. For `fullscreen:`, assert the state the player sets rather than the OS fullscreen (headless can't observe the latter); if no such state exists, assert the command ran without error. `quit` is already covered by the existing quit-to-shelf path.
- **Fixture delivery (desktop):** new fixtures do **not** go into the shared launch `game.cfg` (that would break the exact `SeeShelfTitles` anchor and the per-run launch). They are opened via `OpenGameFile` / import. Consequence: routes that can't be driven through the dialog — drag-and-drop, URL / `?game=` import — are **web-only**, marked with `scenario.webOnly`.
- **Pack notes corrected:** 2e and 2h are not "Pack: —". They need authored QSP fixture content (stats, objects, command line, `SETTIMER`, `panel_visibility`, custom `game.cfg` hotkeys for 2e; settings/language/theme state for 2h). Extend the existing fixtures.

## The batches

See the inventory's "Proposed Phase 2 scenarios" section for the full list and per-scenario targets. Summary:

| PR  | Batch                              | Area     | Pack additions                                  |
| --- | ---------------------------------- | -------- | ----------------------------------------------- |
| 2a  | Opening routes & archives          | §A       | Cyrillic-named game; includer game              |
| 2b  | Dialogs & blocking calls           | §C       | game using msg/input/menu/view/wait             |
| 2c  | Game HTML & interaction            | §D       | game with links/binds/widgets                   |
| 2d  | Saves                              | §I       | nosave game                                     |
| 2e  | Panels, lifecycle, system commands | §B,§J,§K | stats/objects/cmd/timer/hotkeys fixture content |
| 2f  | Themes & layout                    | §E,§F    | Aero game; custom theme                         |
| 2f′ | Aero/classic look variables        | §E       | Aero game that flips vars on demand             |
| 2g  | Resources, paths, sound            | §G,§H    | audio; images                                   |
| 2h  | Player-side integrations           | §M       | settings/language/theme fixture content         |

(2f and 2f′ share the Aero fixture and may ship as one PR or two at the implementer's discretion; count them one batch for ordering. 2i, standalone builds, is deferred to Phase 3.)

## Left to the builder

- Exact fixture QSP source for each pack addition, and whether one fixture game can carry several batches' needs (e.g. one Aero game driving all of 2f′).
- Screenplay structure for new checks/tasks per area, within the README conventions.
- Whether rar/7z and the `?game=` loader-stuck case (2a) are fixed in 2a or split out, given each is a ⚠ with its own fix.
- Per-batch confirmation of web-only vs both for the remaining routes; the known web-only ones (drag-and-drop, URL/`?game=` import, CORS proxy) are settled above.

## Carved out (not Phase 2)

- **Game-HTML hardening — folded into batch 2c as a quality item, NOT a security boundary.** Games already run arbitrary JS with full host access by design, via `game.cfg` `resources.scripts` and theme `script-link` (real `<script src>` appended to `document.head`; `resources.ts:40`, `script-links.tsx:12`). So the sanitizer cannot contain a malicious author (they ship a declared script) and is not treated as a containment boundary. Its realistic value: protect honest games from injected inline markup (player input / data / networked text smuggled into location HTML) and keep malformed markup from crashing the player. The config-declared script path is left untouched (a feature). Real containment of untrusted games would be a separate architecture effort (CSP + origin sandbox + permissions) that conflicts with the script feature; out of scope unless the maintainer ever wants it.

  Verified in a real React 18.3 render mirroring `libs/renderer` `Element` (spike, 2026-10-21): inline `<script>` and `<script src>` are **inert** (present in DOM, do not execute); **`<svg><script>` executes**, and **`<iframe sandbox="allow-scripts allow-same-origin" srcdoc>` executes and reaches `parent`** — both live inline-injection vectors. A mixed-case `JavaScript:` href survives React verbatim, so qSpider's lowercase-only `javascript:` check (`attributes.ts:65`) is bypassable. A `__proto__` attribute does **not** pollute (string assignment to `__proto__` is a no-op). So 2c's negative assertions have real targets: SVG `<script>`, `<iframe>`, and mixed-case `javascript:` links must not execute; malformed markup must not crash. Make the existing dead banned-tag/attribute filtering actually run for these inline cases.

- 61 Dependabot alerts on `main` (6 critical, 15 high) — separate triage.
