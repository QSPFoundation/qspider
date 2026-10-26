export interface E2eMarkState {
  startupFinished: boolean;
  gameId: string | null;
  mainHtml: string;
}

export function plainText(html: string): string {
  const text = new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
  return text.replace(/\s*[\r\n]+\s*/g, ' ').trim();
}

/**
 * Marks due for the given state, in order, with the stage reached afterwards.
 * Stages: 0 waiting for startup, 1 waiting for a game, 2 waiting for main text, 3 done.
 */
export function dueE2eMarks(stage: number, state: E2eMarkState): { stage: number; marks: [string, string][] } {
  const marks: [string, string][] = [];
  if (stage === 0 && state.startupFinished) {
    marks.push(['startup-finished', '']);
    stage = 1;
  }
  if (stage === 1 && state.gameId !== null) {
    marks.push(['game-running', state.gameId]);
    stage = 2;
  }
  if (stage === 2) {
    const text = plainText(state.mainHtml);
    if (text) {
      marks.push(['main-text', text]);
      stage = 3;
    }
  }
  return { stage, marks };
}
