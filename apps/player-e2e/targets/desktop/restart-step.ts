// What a restart (fresh-app.ts) does first, decided from what it finds under tauri-driver.

/**
 * - `end-session`: an app runs; close it, end its session and wait for its processes to exit.
 * - `end-dead-session`: the app already exited, as the previous scenario expected (a game that quit); only
 *   its dead session is ended.
 * - `start-only`: the previous restart already ended the session but failed while waiting for the exit;
 *   nothing is left to end (that restart killed what its wait left), so this restart only starts the new app.
 *   That failure stays with the scenario whose restart it was, instead of failing every later scenario too.
 * - `fail`: no app runs and nothing explains why: it crashed.
 */
export type RestartStep = 'end-session' | 'end-dead-session' | 'start-only' | 'fail';

export function restartStep(appRunning: boolean, exitExpected: boolean, sessionAlreadyEnded: boolean): RestartStep {
  if (appRunning) return 'end-session';
  if (sessionAlreadyEnded) return 'start-only';
  if (exitExpected) return 'end-dead-session';
  return 'fail';
}
