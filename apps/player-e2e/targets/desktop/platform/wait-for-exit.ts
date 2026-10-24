// Shared by the platforms' waitForExit.
import type { Proc } from './index';

/**
 * A timed-out wait keeps watching, only to report when (or whether) the processes did exit, until this long
 * after the wait began: well inside the 45 s scenario timeout, even for a restart in mid-scenario.
 */
const DIAGNOSTIC_LIMIT_MS = 25_000;

const describe = (procs: Proc[]): string => procs.map((p) => (p.name ? `${p.pid} ${p.name}` : `${p.pid}`)).join(', ');

/**
 * Polls `alive` until it lists nothing; fails with the processes still alive after `timeoutMs`. A timed-out
 * wait still fails, but first watches on (up to DIAGNOSTIC_LIMIT_MS from the start), so the error says
 * whether the processes were slow to exit (and how slow) or stayed up.
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
    if (left.length === 0) {
      // A slow exit that still made it: logged, so a budget that gets tight shows before it fails.
      const took = Date.now() - started;
      if (took > timeoutMs / 2) console.warn(`App processes took ${took}ms to exit (budget ${timeoutMs}ms)`);
      return;
    }
    if (Date.now() > deadline) {
      const stuck = describe(left);
      // Logged at once, so it survives whatever stops the wait below.
      console.warn(`App processes still running ${timeoutMs}ms after the session ended: ${stuck}`);
      const limit = started + Math.max(timeoutMs, DIAGNOSTIC_LIMIT_MS);
      let after = alive(left);
      while (after.length > 0 && Date.now() < limit) {
        await poll();
        after = alive(after);
      }
      const outcome =
        after.length === 0
          ? `all exited ${Date.now() - started}ms after the session ended`
          : `still running ${Date.now() - started}ms after the session ended: ${describe(after)}`;
      throw new Error(`App processes still running ${timeoutMs}ms after the session ended: ${stuck} (${outcome})`);
    }
    await poll();
  }
}
