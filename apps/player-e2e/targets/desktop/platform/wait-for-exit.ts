// Shared by the platforms' waitForExit.
import type { Proc } from './index';

/** How long a timed-out wait keeps watching, only to report when (or whether) the processes did exit. */
const DIAGNOSTIC_GRACE_MS = 20_000;

const describe = (procs: Proc[]): string => procs.map((p) => (p.name ? `${p.pid} ${p.name}` : `${p.pid}`)).join(', ');

/**
 * Polls `alive` until it lists nothing; fails with the processes still alive after `timeoutMs`. A timed-out
 * wait still fails, but first watches for up to DIAGNOSTIC_GRACE_MS more, so the error says whether the
 * processes were slow to exit (and how slow) or stayed up.
 */
export async function pollUntilExited(
  procs: Proc[],
  alive: (procs: Proc[]) => Proc[],
  timeoutMs: number,
  intervalMs: number,
): Promise<void> {
  const started = Date.now();
  const deadline = started + timeoutMs;
  const poll = () => new Promise((resolve) => setTimeout(resolve, intervalMs)); // poll interval, not a fixed wait
  for (;;) {
    const left = alive(procs);
    if (left.length === 0) return;
    if (Date.now() > deadline) {
      const stuck = describe(left);
      let after = alive(left);
      while (after.length > 0 && Date.now() < deadline + DIAGNOSTIC_GRACE_MS) {
        await poll();
        after = alive(after);
      }
      const outcome =
        after.length === 0
          ? `all exited ${Date.now() - started}ms after the session ended`
          : `still running after ${timeoutMs + DIAGNOSTIC_GRACE_MS}ms: ${describe(after)}`;
      throw new Error(`App processes still running ${timeoutMs}ms after the session ended: ${stuck} (${outcome})`);
    }
    await poll();
  }
}
