import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { atom } from 'xoid';
import {
  driveCounter,
  isPaused$,
  pauseCounter,
  resetCounterPauses,
  resumeCounter,
  withCounterPaused,
} from './counter-pauses';

// A live subscriber, as the counter driver is in the app: a derived atom read without one can be stale.
isPaused$.subscribe(() => undefined);
const pausedAtLoad = isPaused$.value;

beforeEach(() => {
  resetCounterPauses();
});

describe('pause reasons', () => {
  it('starts paused because no game is running', () => {
    expect(pausedAtLoad).toBe(true);
  });

  it('pauses while any reason is active', () => {
    pauseCounter('menu');
    expect(isPaused$.value).toBe(true);
  });

  it('stays paused until every reason is resumed', () => {
    pauseCounter('menu');
    pauseCounter('msg');
    resumeCounter('menu');
    expect(isPaused$.value).toBe(true);
    resumeCounter('msg');
    expect(isPaused$.value).toBe(false);
  });

  it('counts a reason paused twice once', () => {
    pauseCounter('wait');
    pauseCounter('wait');
    resumeCounter('wait');
    expect(isPaused$.value).toBe(false);
  });

  it('ignores resuming a reason that is not active', () => {
    pauseCounter('input');
    resumeCounter('menu');
    expect(isPaused$.value).toBe(true);
  });

  it('replaces every reason on reset', () => {
    pauseCounter('menu');
    pauseCounter('pause-screen');
    resetCounterPauses('no-game');
    resumeCounter('menu');
    resumeCounter('pause-screen');
    expect(isPaused$.value).toBe(true);
    resumeCounter('no-game');
    expect(isPaused$.value).toBe(false);
  });
});

describe('withCounterPaused', () => {
  it('pauses while the callback runs and resumes after it', async () => {
    const during: boolean[] = [];
    await withCounterPaused(async () => {
      during.push(isPaused$.value);
    });
    expect(during).toEqual([true]);
    expect(isPaused$.value).toBe(false);
  });

  it('resumes when the callback throws', async () => {
    await expect(
      withCounterPaused(async () => {
        throw new Error('fetch failed');
      }),
    ).rejects.toThrow('fetch failed');
    expect(isPaused$.value).toBe(false);
  });

  it('keeps the counter paused while another run is still going', async () => {
    let finishFirst = (): void => undefined;
    const first = withCounterPaused(
      () =>
        new Promise<void>((resolve) => {
          finishFirst = resolve;
        }),
    );
    await withCounterPaused(async () => undefined);
    expect(isPaused$.value).toBe(true);
    finishFirst();
    await first;
    expect(isPaused$.value).toBe(false);
  });

  it('does not override a named reason', async () => {
    pauseCounter('msg');
    await withCounterPaused(async () => undefined);
    expect(isPaused$.value).toBe(true);
  });
});

describe('driveCounter', () => {
  let ticks: number;
  let stop: () => void;
  const delay$ = atom(500);
  const tick = (): void => {
    ticks += 1;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    ticks = 0;
    delay$.set(500);
  });

  afterEach(() => {
    stop();
    vi.useRealTimers();
  });

  it('ticks every delay while not paused', () => {
    stop = driveCounter(delay$, tick);
    vi.advanceTimersByTime(499);
    expect(ticks).toBe(0);
    vi.advanceTimersByTime(1);
    expect(ticks).toBe(1);
    vi.advanceTimersByTime(1000);
    expect(ticks).toBe(3);
  });

  it('does not tick while paused', () => {
    pauseCounter('no-game');
    stop = driveCounter(delay$, tick);
    vi.advanceTimersByTime(5000);
    expect(ticks).toBe(0);
  });

  it('drops the pending tick on pause and starts a full delay on resume', () => {
    stop = driveCounter(delay$, tick);
    vi.advanceTimersByTime(400);
    pauseCounter('msg');
    vi.advanceTimersByTime(400);
    expect(ticks).toBe(0);
    resumeCounter('msg');
    vi.advanceTimersByTime(499);
    expect(ticks).toBe(0);
    vi.advanceTimersByTime(1);
    expect(ticks).toBe(1);
  });

  it('restarts with the new delay when the delay changes', () => {
    stop = driveCounter(delay$, tick);
    vi.advanceTimersByTime(400);
    delay$.set(1000);
    vi.advanceTimersByTime(999);
    expect(ticks).toBe(0);
    vi.advanceTimersByTime(1);
    expect(ticks).toBe(1);
    vi.advanceTimersByTime(1000);
    expect(ticks).toBe(2);
  });

  it('does not start ticking when the delay changes while paused', () => {
    pauseCounter('wait');
    stop = driveCounter(delay$, tick);
    delay$.set(100);
    vi.advanceTimersByTime(1000);
    expect(ticks).toBe(0);
    resumeCounter('wait');
    vi.advanceTimersByTime(100);
    expect(ticks).toBe(1);
  });

  it('stops ticking once stopped', () => {
    stop = driveCounter(delay$, tick);
    stop();
    vi.advanceTimersByTime(5000);
    expect(ticks).toBe(0);
  });
});
