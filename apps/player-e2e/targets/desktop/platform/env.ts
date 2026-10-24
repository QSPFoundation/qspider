// How a WDIO worker's tauri-driver is handed to fresh-app.ts and the platform code: wdio.conf.ts
// (startDriver) sets these in the worker process, which reads them back.

/** The PID of the worker's tauri-driver. */
export const ENV_DRIVER_PID = 'QSPIDER_E2E_DRIVER_PID';
/** JSON list of the dirs fresh-app.ts empties between scenarios (DesktopPlatform.appDataDirs). */
export const ENV_APP_DATA_DIRS = 'QSPIDER_E2E_APP_DATA_DIRS';

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set; run the desktop tests through targets/desktop/wdio.conf.ts`);
  return value;
}

/**
 * Why the worker's tauri-driver did not start. WDIO only logs an error thrown in beforeSession, so
 * startDriver records it here and fresh-app.ts rethrows it at the first restart.
 */
export const ENV_DRIVER_START_ERROR = 'QSPIDER_E2E_DRIVER_START_ERROR';

/** Throws the recorded tauri-driver start error, if any. */
export function assertDriverStarted(): void {
  const error = process.env[ENV_DRIVER_START_ERROR];
  if (error) throw new Error(`tauri-driver did not start for this worker: ${error}`);
}

/** The worker's tauri-driver PID (ENV_DRIVER_PID). */
export const driverPid = (): number => Number(requireEnv(ENV_DRIVER_PID));
