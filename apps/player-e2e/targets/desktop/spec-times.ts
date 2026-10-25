// Spec timings from a GitHub Actions job log of a desktop E2E run: seconds per spec file, read from the
// wdio spec reporter. Feeds shard-timings.json (see shard-timings.mjs). Pure; strip-only TS for plain Node.
import { timingKey } from './shards.ts';

const STAMP = /^\d{4}-\d\d-\d\dT[\d:.]+Z /;
const RUNNING = /^\[(\d+-\d+)\] RUNNING in \S+ - file:\/\/(.+)$/;
const PASSED = /^\[(\d+-\d+)\] PASSED in /;
const RESULT = /^\[[^\]]*#(\d+-\d+)\] (\d+) (passing|failing) \((.+)\)$/;

/** Seconds of `4.2s`, `1m 19.3s` or `850ms`; NaN when the text is none of these. */
function seconds(text: string): number {
  const m = /^(?:(\d+)m )?(?:([\d.]+)s|([\d.]+)ms)$/.exec(text.trim());
  if (!m) return NaN;
  return Number(m[1] ?? 0) * 60 + (m[3] ? Number(m[3]) / 1000 : Number(m[2]));
}

/**
 * Spec file key (see `timingKey`) to seconds, from one job log. A worker with failures is skipped;
 * when a file ran on several workers (retries) the last one wins. A worker that PASSED without a summary
 * (every test skipped on desktop, e.g. web-only specs) counts 0 s.
 */
export function parseSpecTimes(log: string): Record<string, number> {
  const fileOf = new Map<string, string>();
  const time = new Map<string, number>();
  const failed = new Set<string>();
  const passed = new Set<string>();
  for (const raw of log.split('\n')) {
    const line = raw.replace(STAMP, '').trimEnd();
    const run = RUNNING.exec(line);
    if (run) {
      fileOf.set(run[1] as string, timingKey(run[2] as string));
      continue;
    }
    const ok = PASSED.exec(line);
    if (ok) passed.add(ok[1] as string);
    const res = RESULT.exec(line);
    if (!res) continue;
    const worker = res[1] as string;
    if (res[3] === 'failing') failed.add(worker);
    else time.set(worker, seconds(res[4] as string));
  }
  const out: Record<string, number> = {};
  for (const [worker, file] of fileOf) {
    const t = time.get(worker) ?? (passed.has(worker) ? 0 : undefined);
    if (t !== undefined && !Number.isNaN(t) && !failed.has(worker)) out[file] = t;
    else delete out[file];
  }
  return out;
}
