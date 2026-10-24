// What differs per OS in the desktop target: how tauri-driver is started, which processes are the
// app, and which dirs hold its data. wdio.conf.ts, fresh-app.ts and cast.ts go through this.
import type { ChildProcess } from 'node:child_process';
import { linuxPlatform } from './linux';
import { windowsPlatform } from './windows';

/** A process, told apart from a later one with a reused PID by its start time. */
export interface Proc {
  pid: number;
  ppid: number;
  /** Start time as the OS reports it (Linux: clock ticks since boot; Windows: CreationDate). */
  start: string;
}

export interface DesktopPlatform {
  /** Env vars added for tauri-driver (and so the app) of one worker; `runDir` is the worker's private temp dir. */
  driverEnv(runDir: string): Record<string, string>;
  /** tauri-driver's arguments. */
  driverArgs(port: number): string[];
  /** Stops tauri-driver (started by wdio.conf.ts) and whatever it would otherwise leave running. */
  stopDriver(driver: ChildProcess): void;
  /** The app and its webview helper processes under tauri-driver `driverPid`. */
  appProcesses(driverPid: number): Proc[];
  /** Whether an app process runs under the worker's tauri-driver (ENV_DRIVER_PID). */
  appRunning(): boolean;
  /** Resolves once every one of `procs` has exited; fails after `timeoutMs`. */
  waitForExit(procs: Proc[], timeoutMs: number): Promise<void>;
  /** Deletes `dir` (one of appDataDirs) and creates it again, empty; throws when it cannot be deleted. */
  emptyDir(dir: string): void;
  /** Throws when the run must not start here (onPrepare): Linux outside the private session, Windows off CI. */
  checkRunAllowed(): void;
  /** The dirs that hold the app's data, emptied before the driver starts and between scenarios. */
  appDataDirs(runDir: string): string[];
}

/** The platform this run is on; fails on one the desktop E2E does not support. */
export function desktopPlatform(): DesktopPlatform {
  switch (process.platform) {
    case 'linux':
      return linuxPlatform;
    case 'win32':
      return windowsPlatform;
    default:
      throw new Error(`Desktop E2E isolation is implemented for Linux and Windows only, not ${process.platform}`);
  }
}
