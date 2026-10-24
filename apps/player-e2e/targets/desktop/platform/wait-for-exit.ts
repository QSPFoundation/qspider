// Shared by the platforms' waitForExit.
import type { Proc } from './index';

/** Polls `alive` until it lists nothing; fails with the PIDs still alive after `timeoutMs`. */
export async function pollUntilExited(
  procs: Proc[],
  alive: (procs: Proc[]) => Proc[],
  timeoutMs: number,
  intervalMs: number,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const left = alive(procs);
    if (left.length === 0) return;
    if (Date.now() > deadline) {
      throw new Error(
        `App processes still running ${timeoutMs}ms after the session ended: ${left.map((p) => p.pid).join(', ')}`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs)); // poll interval, not a fixed wait
  }
}
