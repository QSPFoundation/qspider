import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getStorage } from '@qspider/env';
import { games$, pendingWrites$ } from './game-shelf';

vi.mock('@qspider/game-state', () => ({}));
vi.mock('history/browser', () => ({ default: { listen: vi.fn(), push: vi.fn() } }));
vi.mock('@qspider/env', () => ({ getStorage: vi.fn() }));

const entry = { id: 'g', title: 'G' } as never;
const deferred = () => {
  let resolve!: () => void;
  let reject!: (e: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
const storageWith = (addGame: () => Promise<void>) => vi.mocked(getStorage).mockReturnValue({ addGame } as never);
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('pendingWrites$ (tracked storage writes)', () => {
  beforeEach(() => {
    pendingWrites$.set(0);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('counts a write until it resolves', async () => {
    const write = deferred();
    storageWith(() => write.promise);
    games$.actions.add('g', entry);
    expect(pendingWrites$.value).toBe(1);
    write.resolve();
    await settle();
    expect(pendingWrites$.value).toBe(0);
  });

  it('still decrements when the write rejects', async () => {
    const write = deferred();
    storageWith(() => write.promise);
    games$.actions.add('g', entry);
    write.reject(new Error('disk full'));
    await settle();
    expect(pendingWrites$.value).toBe(0);
    expect(console.error).toHaveBeenCalled();
  });

  it('counts concurrent writes independently', async () => {
    const first = deferred();
    const second = deferred();
    const writes = [first, second];
    storageWith(() => writes.shift()!.promise);
    games$.actions.add('a', entry);
    games$.actions.add('b', entry);
    expect(pendingWrites$.value).toBe(2);
    first.resolve();
    await settle();
    expect(pendingWrites$.value).toBe(1);
    second.resolve();
    await settle();
    expect(pendingWrites$.value).toBe(0);
  });
});
