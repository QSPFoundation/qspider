import { beforeEach, describe, expect, it } from 'vitest';
import { isPaused$, resetCounterPauses } from './counter-pauses';
import { input$ } from './input';

isPaused$.subscribe(() => undefined);

const initial = input$.value;

/** A plain callback that records every result it gets. */
function recorder(): { calls: string[]; onfinished: (result: string) => void } {
  const calls: string[] = [];
  return { calls, onfinished: (result) => calls.push(result) };
}

beforeEach(() => {
  input$.set(initial);
  resetCounterPauses();
});

describe('input$', () => {
  it('opens with its prompt and an empty entry, and pauses the counter', () => {
    const { onfinished } = recorder();
    input$.actions.open('DIALOG PROMPT', onfinished);
    expect(input$.value).toEqual({ isOpen: true, content: 'DIALOG PROMPT', entered: '', onfinished });
    expect(isPaused$.value).toBe(true);
  });

  it('clears the previous entry when opened again', () => {
    const { onfinished } = recorder();
    input$.actions.open('DIALOG PROMPT', onfinished);
    input$.actions.enter('hello');
    input$.actions.finish();
    input$.actions.open('DIALOG PROMPT', onfinished);
    expect(input$.value.entered).toBe('');
  });

  it('keeps the typed text', () => {
    const { onfinished } = recorder();
    input$.actions.open('DIALOG PROMPT', onfinished);
    input$.actions.enter('hel');
    input$.actions.enter('hello');
    expect(input$.value.entered).toBe('hello');
  });

  it('returns the typed text on finish and resumes the counter', () => {
    const { calls, onfinished } = recorder();
    input$.actions.open('DIALOG PROMPT', onfinished);
    input$.actions.enter('hello');
    input$.actions.finish();
    expect(calls).toEqual(['hello']);
    expect(input$.value.isOpen).toBe(false);
    expect(isPaused$.value).toBe(false);
  });

  it('returns empty text on close, whatever was typed', () => {
    const { calls, onfinished } = recorder();
    input$.actions.open('DIALOG PROMPT', onfinished);
    input$.actions.enter('hello');
    input$.actions.close();
    expect(calls).toEqual(['']);
    expect(input$.value.isOpen).toBe(false);
    expect(isPaused$.value).toBe(false);
  });

  it('answers the engine once when finish and close both arrive', () => {
    const { calls, onfinished } = recorder();
    input$.actions.open('DIALOG PROMPT', onfinished);
    input$.actions.enter('hello');
    input$.actions.finish();
    input$.actions.close();
    input$.actions.finish();
    expect(calls).toEqual(['hello']);
  });

  it('returns empty text on clear and empties the prompt', () => {
    const { calls, onfinished } = recorder();
    input$.actions.open('DIALOG PROMPT', onfinished);
    input$.actions.enter('hello');
    input$.actions.clear();
    expect(calls).toEqual(['']);
    expect(input$.value).toEqual({ isOpen: false, content: '', entered: '', onfinished: null });
    expect(isPaused$.value).toBe(false);
  });

  it('does not call back on clear when closed', () => {
    const { calls, onfinished } = recorder();
    input$.actions.open('DIALOG PROMPT', onfinished);
    input$.actions.finish();
    input$.actions.clear();
    expect(calls).toEqual(['']);
    expect(input$.value).toEqual({ isOpen: false, content: '', entered: '', onfinished: null });
  });

  it('resets silently: empties the prompt and resumes the counter without calling back', () => {
    const { calls, onfinished } = recorder();
    input$.actions.open('DIALOG PROMPT', onfinished);
    input$.actions.enter('hello');
    input$.actions.reset();
    expect(calls).toEqual([]);
    expect(input$.value).toEqual({ isOpen: false, content: '', entered: '', onfinished: null });
    expect(isPaused$.value).toBe(false);
    input$.actions.finish();
    expect(calls).toEqual([]);
  });

  describe('a prompt opened from its own callback (D18)', () => {
    const second = recorder();
    const openNext = (): void => input$.actions.open('NEXT PROMPT', second.onfinished);

    beforeEach(() => {
      second.calls.length = 0;
    });

    it('keeps the new prompt and its handler after finish', () => {
      input$.actions.open('DIALOG PROMPT', openNext);
      input$.actions.finish();
      expect(input$.value.content).toBe('NEXT PROMPT');
      expect(isPaused$.value).toBe(true);
      input$.actions.enter('again');
      input$.actions.finish();
      expect(second.calls).toEqual(['again']);
    });

    it('keeps the new prompt and its handler after close', () => {
      input$.actions.open('DIALOG PROMPT', openNext);
      input$.actions.close();
      expect(input$.value.content).toBe('NEXT PROMPT');
      input$.actions.close();
      expect(second.calls).toEqual(['']);
    });

    it('a prompt reopened from the clear callback does not outlive the stop', () => {
      input$.actions.open('DIALOG PROMPT', openNext);
      input$.actions.clear();
      expect(input$.value).toEqual({ isOpen: false, content: '', entered: '', onfinished: null });
      expect(isPaused$.value).toBe(false);
      input$.actions.finish();
      expect(second.calls).toEqual([]);
    });
  });
});
