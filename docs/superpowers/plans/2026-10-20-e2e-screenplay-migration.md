# E2E Screenplay Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the phase 1 E2E tests with the four core flows written once in Serenity/JS Screenplay under the approved conventions, run on web (Playwright) and desktop (WebdriverIO + tauri-driver), with the conventions enforced by lint.

**Architecture:** `apps/player-e2e` is reorganised as follows:

- `scenarios/`: real test files that call a runner-neutral `scenario()` shim.
- `screenplay/<area>/{elements,tasks,checks}.ts`: one folder per place in the UI.
- `screenplay/support/`: the abstract `OperatePlayer` ability, `seeEventually`, `visible`, and the shim.
- `targets/web|desktop/`: configs, Casts, `OperatePlayer` subclasses and the shim implementations.

Controls are located only by theme-contract markers (`data-qsp*`), or by `data-qa` hooks in app-shell UI. The phase 1 files are deleted. Script and CI job names stay the same.

**Tech Stack:** Serenity/JS 3.49.0 (`core`, `web`, `assertions`, `playwright`, `playwright-test`, `webdriverio`, `mocha`, `console-reporter`), Playwright 1.64.1, WebdriverIO 9.32, mocha 10.8.2, tauri-driver, ESLint 9 + typescript-eslint 8.72.

**Spec:** `docs/superpowers/specs/2026-10-20-e2e-conventions-design.md`. Reference implementation: local branch `spike/serenity-js`, `apps/player-e2e/spike/`. It is structurally wrong for the long run, but its Serenity API usage works on both targets.

## Global Constraints

- **Layout:**
  - `scenarios/*.scenario.ts`;
  - `screenplay/<area>/{elements,tasks,checks}.ts` with areas `shelf`, `game`, `pause`, `saves`, `common`;
  - `screenplay/support/`;
  - `targets/web/`, `targets/desktop/`;
  - `fixtures/`.
- **One job per file:**
  - `elements.ts` holds element definitions only, and is the only place with `By.*`;
  - `tasks.ts` never asserts;
  - `checks.ts` is the only place with `Ensure`, always via `seeEventually`.
- **Naming:**
  - elements are nouns (`SaveSlot`);
  - tasks are verb phrases (`SaveToSlot`, `ReturnToShelf`, `OpenGameFile`);
  - checks start with `See`;
  - scenario titles state behaviour.
- **Locating controls:**
  - only by `data-qsp*` theme-contract markers, ARIA roles, or `data-qa` hooks (app-shell UI only);
  - never by visible text, CSS class, nesting or layout;
  - text is only for content the game writes or the scenario controls (`ROOM counter=1`, action labels from the fixture game, fixture titles).
- **Hidden duplicates:** every lookup that can match them goes through `visible()`.
- **No fixed sleeps:** no `Wait.for(`.
- **No retries:** Playwright `retries: 0`; WDIO `specFileRetries: 0`, mocha `retries: 0`.
- **No stray `.only`:** `forbidOnly: true` everywhere.
- **Clean app per scenario:**
  - web: a fresh browser context;
  - desktop: a fresh app process with wiped app data (existing `restartAppWithEmptyData`), one tauri-driver per run.
- **Scenarios contain** only tasks, checks and constants. They have no framework imports.
- **Single-target scenarios:** `scenario.webOnly` / `scenario.desktopOnly`, reported as skipped on the other target.
- **Unchanged names:** the scripts `e2e:web`, `e2e:desktop`, `check`, `check:full` and the CI jobs `e2e-web` and `e2e-desktop` keep their names. Artifacts stay under `apps/player-e2e/artifacts/`.
- **Phase 1 is replaced outright:** no side-by-side period.
- **Out of scope:** theme machinery (`forEachTheme`, theme fixture variants, `themes.scenario.ts`). The first change migrates the four flows only.
- **Verification:**
  - local runs use `CHROME_BIN=/usr/bin/chromium` (web) and `PATH="$HOME/.cargo/bin:$PATH"` (desktop);
  - `pnpm check` must exit 0 at the end of every task;
  - `pnpm check:full` must exit 0 at the end.

## Plan decisions (not in the spec; check these)

- **D1.** The game shelf and the import error toast are app-shell UI. They are not rendered from theme templates, so they get `data-qa` hooks, the convention `game-card.tsx` already uses (`data-qa="game-<id>"`), rather than `data-qsp` markers. The `elements.ts` selector lint allows `[data-qsp…]`, `[data-qa…]` and roles.
- **D2.** The `scenario()` shim chooses the runner implementation at runtime from `process.env.QSPIDER_E2E_TARGET` (`'web' | 'desktop'`). Each target config sets it before tests load. There is no module aliasing.
- **D3.** Fixture constants move from `shared/core-flow.ts` to `fixtures/e2e-game.ts`, with the same export names except as noted in Task 2. `shared/` is removed.
- **D4.** The desktop shim calls `restartAppWithEmptyData()` itself at the start of every scenario, so scenarios never import target code.

## Review Focus

1. **A missing `await` on `actor.attemptsTo(...)`:** the scenario must fail lint (`no-floating-promises`), not pass silently. Pinned in Task 5.
2. **A single-target scenario on the other target:** it shows as skipped, not missing. Pinned in Task 2 Step 5: the two tagged variants of the first scenario must each show as skipped on the other target.
3. **A game that fails to open:** the scenario fails within seconds with the player's error text, on both targets. Pinned in Task 3 with a temporary non-game fixture.
4. **Elements read before they render on desktop:** this must wait, not fail with `[object Object]`. Covered because desktop scenarios start reading as the app launches. Pinned in Task 2 by running the open-game scenario 3× on desktop.
5. **A control looked up by visible text:** this must not survive the migration. Pinned in Task 3 by grepping for the old English strings, and in Task 5 by the `elements.ts` selector lint.

---

### Task 1: Theme-contract and app-shell hooks for every control the four flows use

**Files:**

- Modify: `libs/game-shelf/src/components/game-shelf.tsx` (shelf container, empty notice)
- Modify: `libs/game-shelf/src/components/game-card.tsx` (card title, Run link)
- Modify: `libs/game-shelf/src/components/error-alert.tsx` (error toast root)

**Interfaces:**

- Produces DOM hooks used by Task 2–3 elements:
  - `data-qa="game-shelf"` on the shelf root;
  - `data-qa="game-shelf-empty"` on the empty notice;
  - `data-qa="game-title"` on each card's `<h3>`;
  - `data-qa="game-run"` on each card's Run link;
  - `data-qa="error-alert"` on the error `Toast.Root`.
- Existing theme-contract markers (no change, listed for later tasks):
  - `[data-qsp="main-content"]`, `[data-qsp="action"]`, `[data-qsp="pause-screen"]`;
  - `[data-qsp-command="quit"]`, `[data-qsp-save-index="<n>"]` with `data-save-empty`;
  - `[data-qsp-save-command="save" | "load"]`;
  - `role="alertdialog"` (QSP engine error).

- [ ] **Step 1: Add the five `data-qa` attributes.** They are attributes only, with no behaviour change.
- [ ] **Step 2: Verify the existing markers render as listed.** Run `pnpm start`, open `apps/player-e2e/fixtures/e2e-game.qsps`, and inspect: pause (Escape) shows `data-qsp="pause-screen"` and a `data-qsp-command="quit"` button, and the saves panel (the game's Save action) shows `data-qsp-save-command` buttons. If any listed marker is absent in the default theme, stop and report. Do not substitute a text selector.
- [ ] **Step 3: Verify.** `pnpm nx run-many -t lint typecheck -p game-shelf` passes, and `CHROME_BIN=/usr/bin/chromium pnpm e2e:web` still passes 4/4 (the phase 1 tests are unaffected).
- [ ] **Step 4: Commit** `feat(game-shelf): add data-qa hooks for e2e tests`

---

### Task 2: Screenplay support, both targets, and the first scenario

**Files:**

- Add devDeps (exact versions): `@serenity-js/core`, `web`, `assertions`, `playwright`, `playwright-test`, `webdriverio`, `mocha` and `console-reporter` (all `3.49.0`), plus `mocha@10.8.2`.
- Create:
  - `apps/player-e2e/fixtures/e2e-game.ts` (moved from `shared/core-flow.ts`, D3);
  - `screenplay/support/operate-player.ts`, `seeEventually.ts`, `visible.ts`, `scenario.ts`;
  - `screenplay/common/elements.ts`, `checks.ts`;
  - `screenplay/game/elements.ts`, `tasks.ts`, `checks.ts`;
  - `screenplay/shelf/elements.ts`, `tasks.ts`, `checks.ts`;
  - `screenplay/pause/elements.ts`;
  - `targets/web/playwright.config.ts`, `cast.ts`, `operate-web-player.ts`, `scenario.ts`;
  - `targets/desktop/wdio.conf.ts`, `cast.ts`, `operate-desktop-player.ts`, `scenario.ts`;
  - `scenarios/core-flow.scenario.ts` with the first scenario only.
- Move with `git mv`:
  - `desktop/fresh-app.ts`, `desktop/prereqs.ts`, `desktop/prereqs.spec.ts`, `desktop/check-prereqs.ts` → `targets/desktop/`;
  - `playwright.config.ts` → `targets/web/playwright.config.ts`;
  - `wdio.desktop.conf.ts` → `targets/desktop/wdio.conf.ts`.

  Keep their contents. Adjust relative paths and the `artifacts/` location so artifacts still land in `apps/player-e2e/artifacts/`.

- Modify:
  - root `package.json` scripts: `e2e:web` → `-c apps/player-e2e/targets/web/playwright.config.ts`; `e2e:desktop` → `node apps/player-e2e/targets/desktop/check-prereqs.ts && … && wdio run apps/player-e2e/targets/desktop/wdio.conf.ts`;
  - `apps/player-e2e/project.json` (target commands);
  - `vite.config.mts` (include `targets/desktop/**/*.spec.ts`);
  - `tsconfig.lib.json` / `tsconfig.desktop.json` (new paths).
- Phase 1 files (`web/`, `desktop/player.ts`, `desktop/core-flow.e2e.ts`) stay until Task 4. During Tasks 2–3 the configs run the new `scenarios/` only, so the phase 1 tests stop running from this task on. That is accepted: Task 2 restores the first flow, and Task 3 the rest.

**Interfaces (produced, used by Tasks 3–5):**

```ts
// fixtures/e2e-game.ts
export const E2E_GAME: {
  path: string;
  shelfTitle: string;
  text: { start: string; room(n: number): string };
  action: { goToRoom: string; increment: string; save: string; load: string };
};

// screenplay/support/operate-player.ts
export abstract class OperatePlayer extends Ability {
  abstract startPlayer(actor: UsesAbilities & AnswersQuestions): Promise<void>; // web: goto('/'); desktop: no-op (app already launched)
  abstract openGameFile(actor: UsesAbilities & AnswersQuestions, path: string): Promise<void>; // web: setInputFiles on #openGame; desktop: no-op (fixture is the launch argument)
}
export const StartPlayer: () => Interaction; // calls OperatePlayer.as(actor).startPlayer
export const OpenGameFile: (path: string) => Interaction; // calls OperatePlayer.as(actor).openGameFile

// screenplay/support/seeEventually.ts — the only wrapper around Ensure.eventually
export function seeEventually<T>(
  element: QuestionAdapter<PageElement> | PageElement,
  question: (e: PageElement) => Answerable<T>,
  expectation: Expectation<T>,
  description: string,
): Task;
// = Task.where(description, Wait.until(element, isPresent()), Ensure.eventually(question(element), expectation))

// screenplay/support/visible.ts
export function visible(selector: QuestionAdapter<PageElements>, description: string): QuestionAdapter<PageElement>;
// = selector.where(isVisible()).first().describedAs(description)

// screenplay/support/scenario.ts
export interface ScenarioFn {
  (title: string, body: (actor: Actor) => Promise<void>): void;
  webOnly(title: string, body: (actor: Actor) => Promise<void>): void;
  desktopOnly(title: string, body: (actor: Actor) => Promise<void>): void;
}
export const scenario: ScenarioFn; // delegates to targets/<QSPIDER_E2E_TARGET>/scenario.ts (D2)

// screenplay/common/checks.ts
export const SeeGameStarted: (startText: string) => Task;
// waits until main text equals startText OR an error alert ([data-qa="error-alert"] / role=alertdialog) is present;
// if an alert is present, fails with "Player shows an error alert: <alert text>"; then checks main text equals startText

// screenplay/game/tasks.ts
export const OpenFixture: () => Task; // StartPlayer() + OpenGameFile(E2E_GAME.path) + SeeGameStarted(E2E_GAME.text.start)
export const ClickAction: (label: string) => Interaction;
export const ReturnToShelf: () => Task; // Press Escape, wait pause-screen present, click quit, wait shelf present
// screenplay/game/checks.ts
export const SeeMainText: (text: string) => Task;
// screenplay/shelf/checks.ts
export const SeeShelfTitles: (titles: string[]) => Task; // exact ordered match; [] → empty notice present and no titles
```

- [ ] **Step 1: Install the devDeps and move the files listed above.** `pnpm check` must still pass. The phase 1 configs are now in `targets/` and still point at the old test files until Step 6.
- [ ] **Step 2: Write `scenarios/core-flow.scenario.ts` with the first scenario only, as two tagged variants with the same title.** On desktop the game is already open at launch, so the empty shelf can't be seen first.

Rule (record it for the Task 4 README): when a step exists on only one target, split the scenario into `.webOnly` / `.desktopOnly` variants with the same title. Never branch inside a scenario.

```ts
scenario.webOnly('opening a game file starts it and adds it to the shelf', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeShelfTitles([]), // clean state
    OpenGameFile(E2E_GAME.path),
    SeeGameStarted(E2E_GAME.text.start),
    ReturnToShelf(),
    SeeShelfTitles([E2E_GAME.shelfTitle]),
  );
});

scenario.desktopOnly('opening a game file starts it and adds it to the shelf', async (player) => {
  await player.attemptsTo(OpenFixture(), ReturnToShelf(), SeeShelfTitles([E2E_GAME.shelfTitle]));
});
```

- [ ] **Step 3: Run it to see it fail** (nothing implemented yet). Run `CHROME_BIN=/usr/bin/chromium pnpm e2e:web`. Expected: FAIL on missing modules or abilities.
- [ ] **Step 4: Implement the support, the elements, tasks and checks the scenario uses, and both targets:**
  - `targets/web/cast.ts`: actors can `BrowseTheWebWithPlaywright` (from the Playwright Test fixtures) and `new OperateWebPlayer()`.
  - `targets/desktop/cast.ts`: actors can `BrowseTheWebWithWebdriverIO.using(browser)` and `new OperateDesktopPlayer()`.
  - `OperateWebPlayer`: `startPlayer` navigates to `/`; `openGameFile` calls `setInputFiles` on `#openGame` via the native page (as in the spike).
  - `OperateDesktopPlayer`: both methods are no-ops, because the app is already launched with the fixture as its argument.
  - The web shim maps `scenario` to `@serenity-js/playwright-test` `it` with the `actor` fixture.
  - The desktop shim maps it to mocha `it` with `actorCalled('Player')`, calling `restartAppWithEmptyData()` first (D4).
  - `.webOnly` / `.desktopOnly` use the runner's `it.skip` on the other target.
  - Both configs set `process.env.QSPIDER_E2E_TARGET` and include `@serenity-js/console-reporter` in the crew. The desktop config uses `framework: '@serenity-js/webdriverio'` with `serenity: { runner: 'mocha' }`.
  - Configs point at `../../scenarios/**/*.scenario.ts`.
- [ ] **Step 5: Run and see it pass.**
  - Web: `pnpm e2e:web` → 1 passed, 1 skipped (the `desktopOnly` variant).
  - Desktop: `pnpm e2e:desktop` → 1 passing, 1 pending/skipped (the `webOnly` variant). Run desktop 3× (Review Focus 4).
  - Skipped scenarios must appear in both reports (Review Focus 2).
- [ ] **Step 6: Commit** `test(e2e): screenplay support, targets and first core-flow scenario`

---

### Task 3: The remaining three scenarios

**Files:**

- Create: `screenplay/saves/elements.ts`, `tasks.ts`, `checks.ts`
- Modify: `screenplay/game/*`, `screenplay/shelf/*`, `screenplay/pause/elements.ts`, `scenarios/core-flow.scenario.ts`

**Interfaces:**

- Consumes the Task 2 interfaces.
- Produces:
  - `game/tasks.ts`: `ReachCounter(n: number): Task`.
  - `shelf/tasks.ts`: `OpenFromShelf(title: string): Interaction`, which clicks `[data-qa="game-run"]` in the card whose `[data-qa="game-title"]` text equals the title.
  - `saves/tasks.ts`: `ChooseSaveSlot(index: number): Task`, which clicks the visible `[data-qsp-save-command="save"]` or `"load"` button in slot `index` (whichever the panel shows), then waits until `[data-qsp="pause-screen"]` is not present.
  - `saves/checks.ts`: `SeeSlotEmpty(index: number): Task`, meaning the slot has `data-save-empty=""`. It checks only the attribute, not the "Empty" text, which is translated.

- [ ] **Step 1: Add the three scenarios.** Titles and steps as in the spike, with `SAVE_SLOT = 1` defined in the scenario file:
  - `actions update the game text`: `OpenFixture`, go to room → `room(0)`, increment → `room(1)`.
  - `loading a save restores the saved state`: `OpenFixture`, `ReachCounter(1)`, click Save action, `SeeSlotEmpty(1)`, `ChooseSaveSlot(1)`, increment → `room(2)`, click Load action, `ChooseSaveSlot(1)`, `SeeMainText(room(1))`.
  - `a game on the shelf can be reopened`: `OpenFixture`, `ReturnToShelf`, `OpenFromShelf(shelfTitle)`, `SeeMainText(start)`.
- [ ] **Step 2: Run, see them fail, implement the listed interfaces, run until they pass.** Web: 4 passed + 1 skipped. Desktop: 4 passing + 1 pending, 3 runs in a row.
- [ ] **Step 3: Deliberate break.** Change `loading a save…`'s final expectation to `room(2)`. On both targets, only that scenario fails, and the message shows `Expected … "ROOM counter=2"` / `Received … "ROOM counter=1"`. Revert.
- [ ] **Step 4: Failing open (Review Focus 3).** Temporarily make `OpenFixture` open `apps/player-e2e/project.json`. On web the scenario fails within about 5s with `Player shows an error alert: …`. On desktop, run only `actions update the game text` via `--spec` with a temporary launch-argument override in the desktop config, and expect the same. Revert both.
- [ ] **Step 5: No text lookups for controls (Review Focus 5).** Run `grep -rnE "'(Quit|Save|Load|Run|Clear)'|Game shelf is empty|Empty'" apps/player-e2e/screenplay`. Expected: no matches. The fixture's action labels `Save`/`Load` live in `fixtures/e2e-game.ts`, not in `screenplay/`.
- [ ] **Step 6: Commit** `test(e2e): migrate remaining core-flow scenarios to screenplay`

---

### Task 4: Remove phase 1, update docs

**Files:**

- Delete: `apps/player-e2e/web/`, `desktop/player.ts`, `desktop/core-flow.e2e.ts`, `shared/`, and any now-empty `desktop/` directory.
- Modify:
  - `apps/player-e2e/README.md`: replace the layout and run sections, and add a **Rules** section;
  - root `CLAUDE.md`: one line pointing to the README rules for E2E;
  - `tsconfig.lib.json` / `tsconfig.desktop.json` / `eslint.config.js`: drop the deleted paths.

The README Rules section contains:

- the placement table (area / element / task / check / new area / never per feature);
- naming;
- the locating rule (D1 included);
- `seeEventually` as the only check primitive;
- the `OperatePlayer` pattern;
- the tagged-variant rule from Task 2 Step 2;
- "themes: rules apply, machinery comes with phase 2".

- [ ] **Step 1: Delete the phase 1 files.** Run `grep -rn "core-flow.e2e\|shared/core-flow\|web/player\|desktop/player" apps/player-e2e package.json .github CLAUDE.md`. Expected: no matches.
- [ ] **Step 2: Write the README Rules section and the CLAUDE.md pointer.** Keep the existing prerequisites, failure artifacts and CI sections, with paths updated.
- [ ] **Step 3: Verify.** `CHROME_BIN=/usr/bin/chromium PATH="$HOME/.cargo/bin:$PATH" pnpm check:full` exits 0.
- [ ] **Step 4: Commit** `test(e2e): remove phase 1 tests, document e2e rules`

---

### Task 5: Lint enforcement

**Files:**

- Modify: `apps/player-e2e/eslint.config.js` (type-aware parser options for both tsconfigs, plus the rules below)
- Create: `apps/player-e2e/lint-rules.spec.ts` (Vitest; include it in the `player-e2e` Vitest project)

**Rules** (all `error`):

- **`scenarios/**`:** `no-restricted-imports` for `@playwright/test`, `playwright*`, `webdriverio`, `@wdio/*`, `@serenity-js/playwright*`, `@serenity-js/webdriverio`, `@serenity-js/web`, and `**/targets/**`.
- **`screenplay/**`:** `no-restricted-imports` for `**/targets/**`, `@playwright/test`, `playwright*`, `webdriverio`, `@wdio/*`.
- **`Ensure` outside `checks.ts` and `support/`:** banned.
- **`By` outside `elements.ts` and `support/`:** banned.
- **Inside `elements.ts`:** `no-restricted-syntax` on `By.css` string arguments that contain none of `[data-qsp`, `[data-qa`, `[role=`. Best effort.
- **Everywhere:** `no-restricted-syntax` for `Wait.for` calls.
- **`screenplay/**`:** `max-lines: 150`.
- **`apps/player-e2e/**`:** `@typescript-eslint/no-floating-promises` and `@typescript-eslint/no-misused-promises`.

- [ ] **Step 1: Write the failing tests.** In `lint-rules.spec.ts`, one test per rule runs `new ESLint({ cwd: <repo root> }).lintText(code, { filePath })` with a minimal violating snippet at a path that rule covers, and asserts the rule id appears among the messages. Required cases:
  - a scenario importing `@playwright/test` → `no-restricted-imports`;
  - a `screenplay/game/tasks.ts` snippet using `Ensure.that(...)` → restricted;
  - a `screenplay/game/tasks.ts` snippet with `By.css('[data-qsp="x"]')` → restricted;
  - `screenplay/game/elements.ts` with `By.css('.qsp-button')` → `no-restricted-syntax`;
  - any file with `Wait.for(Duration.ofSeconds(1))` → `no-restricted-syntax`;
  - a scenario with `player.attemptsTo(X())` and no `await` → `@typescript-eslint/no-floating-promises` (Review Focus 1);
  - a clean `elements.ts` snippet with `By.css('[data-qsp="main-content"]')` → no errors.
- [ ] **Step 2: Run to see them fail.** Run `pnpm exec vitest run --project player-e2e`. Expected: the rule cases FAIL. The clean case may pass.
- [ ] **Step 3: Implement the rules** in `apps/player-e2e/eslint.config.js`.
- [ ] **Step 4: Run to see them pass, and lint the real code.** `pnpm exec vitest run --project player-e2e` passes. `pnpm nx lint player-e2e` exits 0. If real code violates a rule, fix the code, not the rule.
- [ ] **Step 5: Verify.** `CHROME_BIN=/usr/bin/chromium PATH="$HOME/.cargo/bin:$PATH" pnpm check:full` exits 0.
- [ ] **Step 6: Commit** `test(e2e): enforce e2e conventions with lint`
