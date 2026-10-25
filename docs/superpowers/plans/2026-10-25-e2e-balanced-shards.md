# Balanced Desktop E2E Shards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut the desktop E2E wall clock in CI by running Linux in 3 shards and balancing every desktop shard (Linux and Windows) by measured spec-file time instead of wdio's equal-count slices.

**Architecture:** `run-desktop-e2e.mjs --shard i/n` stops forwarding `--shard` to wdio; it lists the main suite's spec files itself, splits them with a pure greedy bin-packing over a committed timings table (`shard-timings.json`, one column per platform), and passes the shard's files as `--spec`. A small CLI regenerates a platform's column from downloaded CI job logs. `checks.yml` turns `e2e-desktop` into a 3-shard matrix behind an aggregate job that keeps the required name `e2e-desktop`.

**Tech Stack:** Node 24 (`.mjs` runner importing `.ts` via type stripping, as `targets/smoke/run-smoke.mjs` already does), WebdriverIO 9, vitest (player-e2e harness unit tests), GitHub Actions.

**Spec:** approved in chat on 2026-10-25 (no design doc; the change was sized "small"). The approved description, verbatim in substance:

1. `run-desktop-e2e.mjs --shard i/n` splits the spec files using a committed timings table (greedy, largest first, each file to the least-loaded shard; a file missing from the table counts as the median) and passes the shard's files as `--spec`; `--shard` is no longer passed to wdio. Pure function with harness unit tests (every file in exactly one shard, deterministic, missing files handled). One table with a Linux and a Windows column.
2. A small script regenerates the table from a downloaded CI job log; the first table comes from the latest green `main` run.
3. Linux CI: `e2e-desktop` becomes a 3-shard matrix (`e2e-desktop (1/3)` …), each shard its own runner, per-shard artifact names; an aggregate job keeps the required name `e2e-desktop`, green only when every shard succeeded (same pattern as `e2e-desktop-windows`). `specFileRetries: 2` stays on Linux (#167).
4. Windows keeps 3 shards, now balanced the same way; update the "Revisit N" comment in `checks.yml`.
5. Local `pnpm e2e:desktop` stays unsharded; required-check list unchanged.
6. Proof is CI on the PR: no desktop shard job over ~7 min; shards' spec-file totals add up to all 25 files per platform; report before/after times.
   Out of scope: `e2e-web` sharding, the Windows slow-exit fix, the lived-in profile.

**Baseline (run 40121755341, `main` 6a82167):** Linux `e2e-desktop` 12m13 (wdio 10m41, 134 scenarios); Windows shards 6m38 / 6m56 / 9m43.

## Global Constraints

- Tasks run through NX/pnpm (`pnpm nx test player-e2e`, `pnpm nx run player-e2e:lint`, `pnpm nx run player-e2e:typecheck`), never vitest/wdio directly in scripts or CI.
- Plain branch `ci/e2e-balanced-shards` in the main checkout, no worktree. One committer at a time; stage only your own files (no `git add -A`). The controller pushes.
- Every support file ≤ 150 lines (eslint `max-lines`); run `pnpm nx run player-e2e:lint` yourself (lint-staged doesn't enforce it). Never bypass hooks.
- Match the surrounding comment style: a header comment saying what the file is for, JSDoc on exports, no restating comments.
- Never touch the real desktop session; never kill processes by name. Local desktop runs only through `run-desktop-e2e.mjs`, one at a time, with `$HOME/.cargo/bin` first on PATH.
- Never read or write the repo's `public/game/`.
- CI iteration: watch only the job being iterated on (`gh run view <run> --json jobs` filtered by name); never wait on the whole run or `gh pr checks`.

## Review Focus

1. **An empty shard** (more shards than files, or a tiny suite): the runner must exit 0 saying the shard has no files, never start wdio without `--spec` (that runs the whole suite). → Task 1 test `assignShards gives empty shards when n exceeds files`; Task 3 step checks `--shard 30/30` exits 0 without starting wdio.
2. **A new scenario file not yet in the table:** it still runs, weighted as the median. **A deleted file still in the table:** ignored. → Task 1 tests.
3. **Drift between the runner's file list and wdio's `specs`/`exclude`:** a file wdio would run that the runner never assigns would silently stop running in CI. → Task 1 shares the patterns: `wdio.conf.ts` imports them from `shards.ts`.
4. **Bad or conflicting arguments** (`0/3`, `4/3`, `a/b`, `--shard` with `--spec` or `--standalone`): refused with a clear message and a non-zero exit, not silently ignored. → Task 1 tests for `parseShard`; Task 3 handles the conflicts.
5. **Windows paths and retried files in logs** (`file:///D:/a/qspider/qspider/apps/player-e2e/scenarios/sound.scenario.ts`; a file run twice after a retry): parsed to the same key; a retried file takes its last successful time; a worker with failures is skipped. → Task 2 tests.

---

### Task 1: Shard assignment (pure) with spec patterns shared with wdio

**Files:**

- Create: `apps/player-e2e/targets/desktop/shards.ts`
- Create: `apps/player-e2e/targets/desktop/shards.spec.ts`
- Modify: `apps/player-e2e/targets/desktop/wdio.conf.ts:300-302` (use the shared patterns)

**Interfaces:**

- Produces:
  - `MAIN_SPECS: string[]` = `['../../scenarios/**/*.scenario.ts']` and `MAIN_EXCLUDE: string[]` = `['../../scenarios/standalone/**']`, both relative to `targets/desktop` (wdio.conf.ts's dir); wdio.conf.ts uses them for `specs`/`exclude`.
  - `interface Shard { current: number; total: number }`
  - `parseShard(arg: string): Shard`: accepts `^\d+/\d+$` with `1 ≤ current ≤ total`; otherwise throws `Error` whose message contains the bad value and `e.g. 1/3`.
  - `assignShards(files: string[], seconds: Record<string, number>, total: number): string[][]`: returns `total` arrays; every input file in exactly one; each array sorted by name.
  - `FILE_OVERHEAD_S = 2` (worker start per spec file, measured ~2 s on Linux CI).
  - `mainSpecFiles(desktopDir: string): string[]`: the main suite's spec files as paths relative to `apps/player-e2e/scenarios` (`'actions.scenario.ts'`, `'sub/x.scenario.ts'`), sorted, from `fs.globSync` over `MAIN_SPECS` with `MAIN_EXCLUDE` applied (same patterns, resolved against `desktopDir`).
  - `timingKey(path: string): string`: the part after the last `scenarios/` segment, forward slashes (used by Task 2 too).

- [ ] **Step 1: Write the failing tests** in `shards.spec.ts` (vitest, same style as `private-session.spec.ts`):
  - `parseShard accepts 1/3 and 3/3` → `{current:1,total:3}`, `{current:3,total:3}`.
  - `parseShard refuses 0/3, 4/3, a/b, 1/0, empty` → each throws, message matches `/e\.g\. 1\/3/`.
  - `assignShards puts every file in exactly one shard`: 10 files with distinct times, `total=3` → flattened result sorted equals input sorted, no duplicates.
  - `assignShards balances by time`: `{a:100,b:60,c:50,d:40,e:10}`, total 2 → loads (seconds + 2 per file) differ by ≤ the smallest file's weight; `a` alone or with the smallest.
  - `assignShards is deterministic`: same input in shuffled order → identical output.
  - `assignShards weighs a file missing from the table as the median`: table `{a:10,b:20,c:30}`, files `a,b,c,new` → `new` placed as a 20 s file (assert via a 2-shard case where that decides the bin).
  - `assignShards ignores table entries for deleted files`: table has `gone:500` → output contains only the given files and balance is unaffected.
  - `assignShards gives empty shards when n exceeds files`: 2 files, total 4 → 4 arrays, two empty.
  - `assignShards with an empty table weighs every file equally`: (median of nothing → every file weighs 1 + overhead) → 6 files, 3 shards → 2 each.
  - `timingKey strips everything up to scenarios/`: `file:///D:/a/qspider/qspider/apps/player-e2e/scenarios/sound.scenario.ts` → `sound.scenario.ts`; `file:///apps/player-e2e/scenarios/sub/x.scenario.ts` → `sub/x.scenario.ts`; a backslash path normalises the same.
  - `mainSpecFiles lists the scenarios and leaves out standalone`: run against the real `targets/desktop` dir → contains `core-flow.scenario.ts`, no entry starts with `standalone/`, length equals the count of `*.scenario.ts` directly under `scenarios/` plus any non-standalone subdirs.

- [ ] **Step 2: Run them, expect FAIL** (module missing): `pnpm nx test player-e2e -- shards`

- [ ] **Step 3: Implement `shards.ts`.** Greedy order: weight = `(seconds[f] ?? median) + FILE_OVERHEAD_S`, where median is over the table's values for the files being assigned that are present (lower middle for an even count; if none present, weight is 1 + overhead). Sort by weight descending, then name ascending; put each file in the shard with the smallest load, lowest index on ties; sort each shard by name. Then switch `wdio.conf.ts` to `specs: MAIN_SPECS, exclude: MAIN_EXCLUDE`, keeping its comment.

- [ ] **Step 4: Run the tests, expect PASS;** then `pnpm nx run player-e2e:lint` and `pnpm nx run player-e2e:typecheck` clean.

- [ ] **Step 5: Commit**

```bash
git add apps/player-e2e/targets/desktop/shards.ts apps/player-e2e/targets/desktop/shards.spec.ts apps/player-e2e/targets/desktop/wdio.conf.ts
git commit -m "feat(e2e): balanced shard assignment over measured spec times"
```

### Task 2: Timings from CI logs, the regen CLI and the first table

**Files:**

- Create: `apps/player-e2e/targets/desktop/spec-times.ts` (log parser)
- Create: `apps/player-e2e/targets/desktop/spec-times.spec.ts`
- Create: `apps/player-e2e/targets/desktop/shard-timings.mjs` (CLI)
- Create: `apps/player-e2e/targets/desktop/shard-timings.json`

**Interfaces:**

- Consumes: `timingKey(path)` from Task 1.
- Produces:
  - `parseSpecTimes(log: string): Record<string, number>`: spec file key → seconds.
  - `shard-timings.json` shape: `{ "linux": { "<key>": <seconds, 1 decimal> }, "windows": { … } }`, keys sorted.
  - CLI: `node apps/player-e2e/targets/desktop/shard-timings.mjs --platform linux|windows <log>...` rewrites only that platform's column (merging the logs; Windows has one log per shard) and prints how many files it wrote; refuses an unknown platform or a log with no spec times.

Log format (GitHub job logs; each line starts with an ISO timestamp and a space, which the parser strips):

- worker → file: `[0-5] RUNNING in undefined - file:///apps/player-e2e/scenarios/dialogs.scenario.ts` (Windows: `file:///D:/a/qspider/qspider/apps/player-e2e/scenarios/…`).
- worker time (spec reporter): `[wry 0.57 linux #0-5] 9 passing (29.6s)`; Windows `[webview2 155.0.4283.62 windows #0-6] 4 passing (51.5s)`; durations like `(4.2s)`, `(1m 19.3s)`, `(850ms)`.
- failures: `[… #0-6] 4 failing (13.9s)` → that worker is skipped.
- retries start a new worker id for the same file; the later worker wins.

- [ ] **Step 1: Write the failing tests** in `spec-times.spec.ts` with small inline log snippets:
  - `reads each worker's file and passing time` (two Linux workers, with timestamps) → `{ 'actions.scenario.ts': 17.9, 'dialogs.scenario.ts': 29.6 }`.
  - `parses minutes and milliseconds` → `(1m 19.3s)` = 79.3, `(850ms)` = 0.85.
  - `reads Windows drive-letter paths` → key `sound.scenario.ts`.
  - `skips a worker that has failures`.
  - `a retried file takes the later worker's time`.
  - `returns {} for a log with no spec reporter lines`.

- [ ] **Step 2: Run, expect FAIL:** `pnpm nx test player-e2e -- spec-times`

- [ ] **Step 3: Implement `spec-times.ts` and `shard-timings.mjs`** (the CLI is thin: args, read files, `parseSpecTimes` per log, merge, round to 0.1, sort keys, write JSON with 2-space indent and a trailing newline; header comment says what the file is and how to fetch logs: `gh api repos/QSPFoundation/qspider/actions/runs/<id>/logs > l.zip`, unzip, pass the job's `.txt` files).

- [ ] **Step 4: Run tests, expect PASS;** lint + typecheck clean.

- [ ] **Step 5: Generate the first table** from green `main` run 40121755341, already downloaded under `/tmp/claude-1000/-home-ruyu-projects-qspider/e8bff152-072f-4844-832b-9e61deb0a07a/scratchpad/r183/logs/` (re-download with the `gh api` command above if missing):

```bash
L=/tmp/claude-1000/-home-ruyu-projects-qspider/e8bff152-072f-4844-832b-9e61deb0a07a/scratchpad/r183/logs
node apps/player-e2e/targets/desktop/shard-timings.mjs --platform linux "$L/8_e2e-desktop.txt"
node apps/player-e2e/targets/desktop/shard-timings.mjs --platform windows "$L/6_e2e-desktop-windows-main (1_3) _ e2e.txt" "$L/3_e2e-desktop-windows-main (2_3) _ e2e.txt" "$L/4_e2e-desktop-windows-main (3_3) _ e2e.txt"
```

Expected: 25 entries in each column; the linux column sums to ~589 s (the spec reporter totals of that run, e.g. `saves.scenario.ts` 79.3). If a column has fewer than 25, find which file is missing and why (an unparsed line format) before going on. `pnpm format` the JSON.

- [ ] **Step 6: Commit**

```bash
git add apps/player-e2e/targets/desktop/spec-times.ts apps/player-e2e/targets/desktop/spec-times.spec.ts apps/player-e2e/targets/desktop/shard-timings.mjs apps/player-e2e/targets/desktop/shard-timings.json
git commit -m "feat(e2e): spec timings table from CI logs"
```

### Task 3: The runner splits `--shard` itself

**Files:**

- Modify: `apps/player-e2e/targets/desktop/run-desktop-e2e.mjs`
- Modify: `apps/player-e2e/README.md` (the desktop run / Windows-dispatch paragraphs that mention `--shard`, near line 311, plus a short "Shards" note: how the split works, the table, how to regenerate it and when: a desktop shard job nears ~7 min)

**Interfaces:**

- Consumes: `parseShard`, `assignShards`, `mainSpecFiles` (Task 1); `shard-timings.json` (Task 2).
- Produces: `node run-desktop-e2e.mjs --shard i/n` (also `--shard=i/n`) runs only that shard's files; the platform column is `windows` when `process.platform === 'win32'`, else `linux`.

- [ ] **Step 1: Implement.** In the runner, before building `wdio`:
  - pull `--shard` (both spellings) out of the args;
  - refuse (stderr message, exit code 2, no private dir created) when it is combined with `--standalone` or `--spec`, or when `parseShard` throws;
  - compute the shard with `assignShards(mainSpecFiles(desktopDir), timings[platform], total)[current - 1]`;
  - print `Shard i/n: k spec files (~S s): a, b, …` (S from the table plus overhead);
  - if the shard is empty, print that it has nothing to run and exit 0 **without starting wdio**;
  - otherwise append `--spec apps/player-e2e/scenarios/<file>` for each file to the wdio args.
    Update the header comment's usage line.

- [ ] **Step 2: Check the refusals and the empty shard** (no build needed, the runner exits before wdio):
  - `node apps/player-e2e/targets/desktop/run-desktop-e2e.mjs --shard 30/30` → prints nothing-to-run, exit 0, no `wdio`/`xvfb-run` started (check `pgrep -f wdio` is empty only for processes you started; never kill by name).
  - `… --shard 4/3`, `… --shard 1/3 --standalone`, `… --shard 1/3 --spec x` → each exits 2 with a message.

- [ ] **Step 3: Run one real Linux shard locally:** `export PATH=$HOME/.cargo/bin:$PATH; pnpm nx run player-e2e:build-desktop-e2e && node apps/player-e2e/targets/desktop/run-desktop-e2e.mjs --shard 1/3`. Expected: the printed file list matches `Spec Files: k passed, k total`, all green (a #167 retry is allowed and expected on Linux; report it).

- [ ] **Step 4: Lint, typecheck, unit tests, format check:** `pnpm nx run player-e2e:lint`, `pnpm nx run player-e2e:typecheck`, `pnpm nx test player-e2e`, `pnpm format:check`.

- [ ] **Step 5: Commit**

```bash
git add apps/player-e2e/targets/desktop/run-desktop-e2e.mjs apps/player-e2e/README.md
git commit -m "feat(e2e): run-desktop-e2e balances --shard by measured spec times"
```

### Task 4: Linux shards in CI, aggregate check, Windows note

**Files:**

- Modify: `.github/workflows/checks.yml` (the `e2e-desktop` job near line 214; the Windows "Revisit N" comment near line 121)
- Modify: `apps/player-e2e/README.md` (CI and branch protection section near lines 332–339: Linux shards, artifacts, the aggregate)

**Interfaces:**

- Consumes: `pnpm e2e:desktop --shard <i/n>` (pnpm appends the arg to the script's last command, `run-desktop-e2e.mjs`).
- Produces: matrix job `e2e-desktop-main` with `shard: [1/3, 2/3, 3/3]`, `fail-fast: false`, listed as `e2e-desktop-main (1/3)` …; artifacts `e2e-desktop-artifacts-<i>-of-<n>`; aggregate job `e2e-desktop` (`needs: [e2e-desktop-main]`, `if: always()`, `ubuntu-24.04`, `timeout-minutes: 5`, same jq step as `e2e-desktop-windows`, step named `Every Linux desktop shard succeeded`).

- [ ] **Step 1: Edit `checks.yml`.** Rename the existing job to `e2e-desktop-main` with the matrix and `name: e2e-desktop-main (${{ matrix.shard }})`; run `pnpm e2e:desktop --shard ${{ matrix.shard }}`; derive the artifact suffix as the Windows workflow does (`1/3` → `1-of-3`). Add the aggregate `e2e-desktop` job. Add a comment above the matrix like the Windows one: N = 3 and why (baseline 12m13 unsharded; target ≤ ~7 min per shard job), and that the split is by `shard-timings.json` (README "Shards"). Update the Windows comment: the split is now by measured time, the old 7m04/7m04/9m14 imbalance came from wdio's equal-count slices; revisit N or regenerate the table when a shard job nears ~7 min.

- [ ] **Step 2: Validate the workflow locally:** `pnpm format:check`; if `actionlint` is on PATH run it on `checks.yml`, otherwise say it wasn't available.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/checks.yml apps/player-e2e/README.md
git commit -m "ci(e2e): Linux desktop E2E in 3 balanced shards behind an e2e-desktop aggregate"
```

- [ ] **Step 4 (controller): push, open the PR, iterate on CI.** Watch only `e2e-desktop-main (*)` and `e2e-desktop-windows-main (*)` jobs. Acceptance:
  - every desktop shard job ≤ ~7 min (report each job's time against the baseline);
  - per platform, the shards' `Spec Files: … total` add up to 25 and each shard's printed list matches;
  - the `e2e-desktop` aggregate appears and is green; the required-check list in the ruleset (id 1173590) is unchanged and still satisfied.
