/** One start-up step of the player and when it was reached, in wall-clock ms (Date.now()). */
export interface StartupMark {
  step: string;
  at: number;
}

declare global {
  interface Window {
    /** E2E builds only: the start-up steps reached so far, read by the desktop E2E runner. */
    __qspiderStartup?: StartupMark[];
  }
}

/**
 * E2E builds only (see updater.ts): records that start-up reached `step`, so the desktop E2E runner
 * (apps/player-e2e/targets/desktop/startup-timeline.ts) can tell where a slow start spent its time.
 * Release builds never set the flag, so this does nothing there.
 */
export function markStartup(step: string): void {
  if (import.meta.env.VITE_QSPIDER_E2E !== 'true') return;
  (window.__qspiderStartup ??= []).push({ step, at: Date.now() });
}
