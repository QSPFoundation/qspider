import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { throttle } from './throttle';

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls through on the first call', () => {
    const throttled = throttle((x: number) => x * 2, 100);
    expect(throttled(2)).toBe(4);
  });

  it('returns the first result for calls within the limit', () => {
    let calls = 0;
    const throttled = throttle((x: number) => (calls++, x), 100);
    expect(throttled(1)).toBe(1);
    vi.advanceTimersByTime(99);
    expect(throttled(2)).toBe(1);
    expect(calls).toBe(1);
  });

  it('calls again once the limit has passed', () => {
    let calls = 0;
    const throttled = throttle((x: number) => (calls++, x), 100);
    throttled(1);
    vi.advanceTimersByTime(100);
    expect(throttled(2)).toBe(2);
    expect(calls).toBe(2);
  });

  it('passes this and the arguments through', () => {
    const target = {
      factor: 3,
      scale: throttle(function (this: { factor: number }, a: number, b: number) {
        return (a + b) * this.factor;
      }, 100),
    };
    expect(target.scale(1, 2)).toBe(9);
  });
});
