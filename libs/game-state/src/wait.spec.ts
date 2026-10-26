import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isPaused$, resetCounterPauses } from './counter-pauses';
import { finishWait, wait$ } from './wait';

isPaused$.subscribe(() => undefined);

let finished: number;
const finish = (): void => {
  finished += 1;
};

beforeEach(() => {
  vi.useFakeTimers();
  finished = 0;
  resetCounterPauses();
});

afterEach(() => {
  finishWait();
  vi.useRealTimers();
});

describe('wait', () => {
  it('pauses the counter while waiting', () => {
    wait$.set({ ms: 300, finish });
    expect(isPaused$.value).toBe(true);
  });

  it('finishes on its own after its time, once', () => {
    wait$.set({ ms: 300, finish });
    vi.advanceTimersByTime(299);
    expect(finished).toBe(0);
    vi.advanceTimersByTime(1);
    expect(finished).toBe(1);
    expect(wait$.value).toBe(null);
    expect(isPaused$.value).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(finished).toBe(1);
  });

  it('finishes early on finishWait and does not finish again when the time runs out', () => {
    wait$.set({ ms: 60000, finish });
    finishWait();
    expect(finished).toBe(1);
    expect(wait$.value).toBe(null);
    expect(isPaused$.value).toBe(false);
    vi.advanceTimersByTime(60000);
    expect(finished).toBe(1);
  });

  it('does nothing on finishWait with no wait', () => {
    finishWait();
    expect(finished).toBe(0);
    expect(isPaused$.value).toBe(false);
  });

  it('runs a wait started from the finish callback', () => {
    let second = 0;
    wait$.set({
      ms: 300,
      finish: () => {
        wait$.set({
          ms: 500,
          finish: () => {
            second += 1;
          },
        });
      },
    });
    vi.advanceTimersByTime(300);
    expect(isPaused$.value).toBe(true);
    vi.advanceTimersByTime(500);
    expect(second).toBe(1);
    expect(isPaused$.value).toBe(false);
  });
});
