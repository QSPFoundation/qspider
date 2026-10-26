import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearAdditionalResources, whenLoaded } from './resources';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  clearAdditionalResources();
});

/** Settles `promise` into a box, so a test can look at it between timer steps. */
function track<T>(promise: Promise<T>): { done: boolean; value?: T } {
  const box: { done: boolean; value?: T } = { done: false };
  void promise.then((value) => {
    box.done = true;
    box.value = value;
  });
  return box;
}

describe('whenLoaded', () => {
  it('answers null when the element loads', async () => {
    const link = document.createElement('link');
    const result = track(whenLoaded(link, 'game.css'));
    link.dispatchEvent(new Event('load'));
    await vi.advanceTimersByTimeAsync(0);
    expect(result).toEqual({ done: true, value: null });
  });

  it('answers the path when the element fails', async () => {
    const script = document.createElement('script');
    const result = track(whenLoaded(script, 'game.js'));
    script.dispatchEvent(new Event('error'));
    await vi.advanceTimersByTimeAsync(0);
    expect(result).toEqual({ done: true, value: 'game.js' });
  });

  it('answers the path when nothing is reported in 15 seconds', async () => {
    const link = document.createElement('link');
    const result = track(whenLoaded(link, 'slow.css'));
    await vi.advanceTimersByTimeAsync(14_999);
    expect(result.done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(result).toEqual({ done: true, value: 'slow.css' });
  });

  it('does not answer twice when the element loads after the answer', async () => {
    const link = document.createElement('link');
    const result = track(whenLoaded(link, 'late.css'));
    await vi.advanceTimersByTimeAsync(15_000);
    link.dispatchEvent(new Event('load'));
    await vi.advanceTimersByTimeAsync(0);
    expect(result.value).toBe('late.css');
  });

  it('cancels the timeout once the element has loaded', async () => {
    const link = document.createElement('link');
    whenLoaded(link, 'game.css');
    expect(vi.getTimerCount()).toBe(1);
    link.dispatchEvent(new Event('load'));
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('clearAdditionalResources', () => {
  it('removes the elements the player added and leaves the page own', () => {
    const own = document.createElement('link');
    own.rel = 'stylesheet';
    document.head.appendChild(own);
    const added = document.createElement('script');
    added.dataset['qspiderResource'] = 'script';
    document.head.appendChild(added);
    const style = document.createElement('link');
    style.dataset['qspiderResource'] = 'style';
    document.head.appendChild(style);

    clearAdditionalResources();

    expect(document.querySelectorAll('[data-qspider-resource]')).toHaveLength(0);
    expect(document.head.contains(own)).toBe(true);
    own.remove();
  });

  it('does nothing when no resource was added', () => {
    expect(() => clearAdditionalResources()).not.toThrow();
  });
});
