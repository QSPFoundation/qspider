import { invoke } from '@tauri-apps/api/core';
import { currentGameEntry$, mainContent$, startupFinished$ } from '@qspider/game-state';
import { dueE2eMarks } from './e2e-mark-steps';

export type E2eMark = (marker: string, detail: string) => Promise<void>;

const invokeMark: E2eMark = (marker, detail) => invoke('e2e_mark', { marker, detail });

/**
 * E2E builds only: reports startup, the running game and its first main text through the
 * `e2e_mark` command, which prints them on stdout, so a launch can be checked without WebDriver.
 * Each marker is sent once, in this order. Returns a function that stops the reporting.
 */
export function startE2eMarks(mark: E2eMark = invokeMark): () => void {
  let stage = 0;
  const update = (): void => {
    const due = dueE2eMarks(stage, {
      startupFinished: startupFinished$.value,
      gameId: currentGameEntry$.value?.id ?? null,
      mainHtml: mainContent$.value,
    });
    stage = due.stage;
    for (const [marker, detail] of due.marks) {
      mark(marker, detail).catch((err) => console.error('E2E mark failed', marker, err));
    }
  };
  const unsubscribes = [startupFinished$, currentGameEntry$, mainContent$].map((atom$) => atom$.subscribe(update));
  update();
  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
}
