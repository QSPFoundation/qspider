import { invoke } from '@tauri-apps/api/core';
import { currentGameEntry$, mainContent$, startupFinished$ } from '@qspider/game-state';

export type E2eMark = (marker: string, detail: string) => Promise<void>;

const invokeMark: E2eMark = (marker, detail) => invoke('e2e_mark', { marker, detail });

function plainText(html: string): string {
  const text = new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
  return text.replace(/\s*[\r\n]+\s*/g, ' ').trim();
}

/**
 * E2E builds only: reports startup, the running game and its first main text through the
 * `e2e_mark` command, which prints them on stdout, so a launch can be checked without WebDriver.
 * Each marker is sent once, in this order. Returns a function that stops the reporting.
 */
export function startE2eMarks(mark: E2eMark = invokeMark): () => void {
  let stage = 0;
  const send = (marker: string, detail: string): void => {
    stage++;
    mark(marker, detail).catch((err) => console.error('E2E mark failed', marker, err));
  };
  const update = (): void => {
    if (stage === 0 && startupFinished$.value) send('startup-finished', '');
    const game = currentGameEntry$.value;
    if (stage === 1 && game) send('game-running', game.id);
    if (stage === 2) {
      const text = plainText(mainContent$.value);
      if (text) send('main-text', text);
    }
  };
  const unsubscribes = [startupFinished$, currentGameEntry$, mainContent$].map((atom$) => atom$.subscribe(update));
  update();
  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
}
