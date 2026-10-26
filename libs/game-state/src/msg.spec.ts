import { beforeEach, describe, expect, it } from 'vitest';
import { isPaused$, resetCounterPauses } from './counter-pauses';
import { msg$ } from './msg';

isPaused$.subscribe(() => undefined);

const initial = msg$.value;

/** A plain callback that counts its calls. */
function recorder(): { calls: number[]; onclosed: () => void } {
  const calls: number[] = [];
  return { calls, onclosed: () => calls.push(calls.length + 1) };
}

beforeEach(() => {
  msg$.set(initial);
  resetCounterPauses();
});

describe('msg$', () => {
  it('opens with its text and pauses the counter', () => {
    const { onclosed } = recorder();
    msg$.actions.open('DIALOG MESSAGE', onclosed);
    expect(msg$.value).toEqual({ isOpen: true, content: 'DIALOG MESSAGE', onclosed });
    expect(isPaused$.value).toBe(true);
  });

  it('calls back once on close and resumes the counter', () => {
    const { calls, onclosed } = recorder();
    msg$.actions.open('DIALOG MESSAGE', onclosed);
    msg$.actions.close();
    msg$.actions.close();
    expect(calls).toEqual([1]);
    expect(msg$.value.isOpen).toBe(false);
    expect(isPaused$.value).toBe(false);
  });

  it('calls back on clear and empties the box', () => {
    const { calls, onclosed } = recorder();
    msg$.actions.open('DIALOG MESSAGE', onclosed);
    msg$.actions.clear();
    expect(calls).toEqual([1]);
    expect(msg$.value).toEqual({ isOpen: false, content: '', onclosed: null });
    expect(isPaused$.value).toBe(false);
  });

  it('does not call back on clear when closed', () => {
    const { calls, onclosed } = recorder();
    msg$.actions.open('DIALOG MESSAGE', onclosed);
    msg$.actions.close();
    msg$.actions.clear();
    expect(calls).toEqual([1]);
    expect(msg$.value).toEqual({ isOpen: false, content: '', onclosed: null });
  });

  describe('a message opened from its own callback (D18)', () => {
    const second = recorder();
    const openNext = (): void => msg$.actions.open('NEXT MESSAGE', second.onclosed);

    beforeEach(() => {
      second.calls.length = 0;
    });

    it('keeps the new message and its handler after close', () => {
      msg$.actions.open('DIALOG MESSAGE', openNext);
      msg$.actions.close();
      expect(msg$.value.content).toBe('NEXT MESSAGE');
      expect(isPaused$.value).toBe(true);
      msg$.actions.close();
      expect(second.calls).toEqual([1]);
    });

    it('keeps the new message and its handler after clear', () => {
      msg$.actions.open('DIALOG MESSAGE', openNext);
      msg$.actions.clear();
      expect(msg$.value.isOpen).toBe(true);
      expect(msg$.value.content).toBe('NEXT MESSAGE');
      expect(isPaused$.value).toBe(true);
      msg$.actions.close();
      expect(second.calls).toEqual([1]);
    });
  });
});
