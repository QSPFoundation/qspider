// Balanced desktop E2E shards: spec files are dealt out by measured time (seconds per file, from the
// timings table), not by file count. Pure, and importable by plain Node (run-desktop-e2e.mjs strips types).
// wdio.conf.ts takes its spec patterns from here, so the runner and wdio list the same files.
import { globSync } from 'node:fs';
import { relative, resolve } from 'node:path';

/** Main suite specs, relative to this directory (wdio.conf.ts's). */
export const MAIN_SPECS = ['../../scenarios/**/*.scenario.ts'];
/** The standalone scenarios run only against the standalone build (wdio.standalone.conf.ts). */
export const MAIN_EXCLUDE = ['../../scenarios/standalone/**'];
/** Worker start per spec file, measured ~2 s on Linux CI. */
export const FILE_OVERHEAD_S = 2;

export interface Shard {
  current: number;
  total: number;
}

/** Parses `--shard` as `current/total` (e.g. 1/3), 1 <= current <= total. */
export function parseShard(arg: string): Shard {
  const m = /^(\d+)\/(\d+)$/.exec(arg);
  const current = m ? Number(m[1]) : 0;
  const total = m ? Number(m[2]) : 0;
  if (current < 1 || current > total) {
    throw new Error(`Invalid shard "${arg}": expected current/total with 1 <= current <= total, e.g. 1/3`);
  }
  return { current, total };
}

/** Timing-table key of a spec path: the part after the last `scenarios/`, forward slashes. */
export function timingKey(path: string): string {
  const p = path.replaceAll('\\', '/');
  const i = p.lastIndexOf('scenarios/');
  return i < 0 ? p : p.slice(i + 'scenarios/'.length);
}

/**
 * Deals `files` into `total` shards, longest first into the lightest shard (ties: lowest index).
 * A file missing from `seconds` weighs the median of the known ones; table entries for other files are ignored.
 */
export function assignShards(files: string[], seconds: Record<string, number>, total: number): string[][] {
  const known = files
    .filter((f) => f in seconds)
    .map((f) => seconds[f] as number)
    .sort((a, b) => a - b);
  const median = known.length ? (known[(known.length - 1) >> 1] as number) : 1;
  const weight = (f: string) => (seconds[f] ?? median) + FILE_OVERHEAD_S;
  const order = files.slice().sort((a, b) => weight(b) - weight(a) || (a < b ? -1 : a > b ? 1 : 0));
  const shards: string[][] = Array.from({ length: total }, () => []);
  const loads: number[] = new Array(total).fill(0);
  for (const f of order) {
    const i = loads.indexOf(Math.min(...loads));
    (shards[i] as string[]).push(f);
    loads[i] = (loads[i] as number) + weight(f);
  }
  return shards.map((s) => s.sort());
}

/** The main suite's spec files relative to `scenarios/`, sorted. `desktopDir` is `targets/desktop`. */
export function mainSpecFiles(desktopDir: string): string[] {
  const exclude = MAIN_EXCLUDE.map((p) => resolve(desktopDir, p));
  const files = MAIN_SPECS.flatMap((p) => globSync(p, { cwd: desktopDir }))
    .map((f) => resolve(desktopDir, f))
    .filter((f) => !exclude.some((e) => matchesExclude(e, f)));
  return files.map((f) => timingKey(relative(desktopDir, f))).sort();
}

// `dir/**` exclude: everything below dir.
function matchesExclude(pattern: string, file: string): boolean {
  return file.startsWith(pattern.replace(/\*\*$/, ''));
}
