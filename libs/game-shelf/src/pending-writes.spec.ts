import { beforeEach, describe, expect, it } from 'vitest';
import { pendingWrites$, trackWrite } from './pending-writes';

const deferred = () => {
  let resolve!: () => void;
  let reject!: (e: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('pendingWrites$ (tracked storage writes)', () => {
  beforeEach(() => {
    pendingWrites$.set(0);
  });

  it('counts a write until it resolves', async () => {
    const write = deferred();
    trackWrite(write.promise);
    expect(pendingWrites$.value).toBe(1);
    write.resolve();
    await settle();
    expect(pendingWrites$.value).toBe(0);
  });

  it('still decrements when the write rejects', async () => {
    const write = deferred();
    trackWrite(write.promise);
    write.reject(new Error('disk full'));
    await settle();
    expect(pendingWrites$.value).toBe(0);
  });

  it('counts concurrent writes independently', async () => {
    const first = deferred();
    const second = deferred();
    trackWrite(first.promise);
    trackWrite(second.promise);
    expect(pendingWrites$.value).toBe(2);
    first.resolve();
    await settle();
    expect(pendingWrites$.value).toBe(1);
    second.resolve();
    await settle();
    expect(pendingWrites$.value).toBe(0);
  });
});
