import { describe, expect, it } from 'vitest';
import type { Proc } from './index';
import { pollUntilExited } from './wait-for-exit';

const app: Proc = { pid: 10, ppid: 1, start: 's', name: 'qspider.exe' };
const webview: Proc = { pid: 11, ppid: 10, start: 's', name: 'msedgewebview2.exe' };

describe('pollUntilExited', () => {
  it('resolves once nothing is alive', async () => {
    let polls = 0;
    await pollUntilExited([app], (left) => (++polls < 3 ? left : []), 1_000, 1);
    expect(polls).toBe(3);
  });

  it('fails with the names of the stuck processes and when they exited after the timeout', async () => {
    const exitAt = Date.now() + 60;
    const alive = (left: Proc[]): Proc[] => (Date.now() < exitAt ? left : []);
    await expect(pollUntilExited([app, webview], alive, 20, 5)).rejects.toThrow(
      /still running 20ms after the session ended: 10 qspider\.exe, 11 msedgewebview2\.exe \(all exited \d+ms after/,
    );
  });
});
