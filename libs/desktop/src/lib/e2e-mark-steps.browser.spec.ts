import { describe, expect, it } from 'vitest';
import { dueE2eMarks, plainText, type E2eMarkState } from './e2e-mark-steps';

const idle: E2eMarkState = { startupFinished: false, gameId: null, mainHtml: '' };

/** Feeds states through dueE2eMarks the way startE2eMarks does, carrying the stage along. */
function replay(states: E2eMarkState[]): [string, string][] {
  let stage = 0;
  const sent: [string, string][] = [];
  for (const state of states) {
    const due = dueE2eMarks(stage, state);
    stage = due.stage;
    sent.push(...due.marks);
  }
  return sent;
}

describe('dueE2eMarks', () => {
  it('emits startup-finished, game-running and main-text once each, in order', () => {
    const started = { ...idle, startupFinished: true };
    const running = { ...started, gameId: 'g1' };
    const sent = replay([
      { ...idle, mainHtml: '<p>E2E START</p>' },
      { ...started, mainHtml: '<p>E2E START</p>' },
      { ...running, mainHtml: '<p>E2E START</p>' },
      { ...running, mainHtml: '<p>E2E\n START</p>' },
      { ...running, mainHtml: '<p>E2E START</p>' },
      { ...idle, gameId: 'g1', mainHtml: '<p>E2E START</p>' },
      { ...running, mainHtml: '<p>E2E START</p>' },
    ]);

    expect(sent).toEqual([
      ['startup-finished', ''],
      ['game-running', 'g1'],
      ['main-text', 'E2E START'],
    ]);
  });

  it('does not emit main-text for empty or whitespace-only content', () => {
    const running = { startupFinished: true, gameId: 'g1' };
    const sent = replay([
      { ...running, mainHtml: '' },
      { ...running, mainHtml: '<p>   </p>' },
      { ...running, mainHtml: ' \n\t ' },
      { ...running, mainHtml: '' },
    ]);

    expect(sent).toEqual([
      ['startup-finished', ''],
      ['game-running', 'g1'],
    ]);
  });

  it('emits nothing before startup, then all three marks in one call', () => {
    const early = { ...idle, gameId: 'g1', mainHtml: '<div>line one<br>\n  line two</div>' };

    expect(dueE2eMarks(0, early)).toEqual({ stage: 0, marks: [] });
    expect(dueE2eMarks(0, { ...early, startupFinished: true })).toEqual({
      stage: 3,
      marks: [
        ['startup-finished', ''],
        ['game-running', 'g1'],
        ['main-text', 'line one line two'],
      ],
    });
  });
});

describe('plainText', () => {
  it('joins block elements split by CRLF into one line', () => {
    expect(plainText('<p>a</p>\r\n<p>b</p>')).toBe('a b');
  });
});
