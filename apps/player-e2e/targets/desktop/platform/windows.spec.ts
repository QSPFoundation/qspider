import { describe, expect, it } from 'vitest';
import {
  appTree,
  assertHostSessionAllowed,
  parseCimProcesses,
  windowsAppDataDirs,
  windowsWebviewOptions,
} from './windows';

const cim = (pid: number, ppid: number, created: string | null | { value: string }): object => ({
  ProcessId: pid,
  ParentProcessId: ppid,
  CreationDate: created,
});
const at = (ms: number): string => `/Date(${ms})/`;

describe('parseCimProcesses', () => {
  it('maps ProcessId, ParentProcessId and CreationDate (as start) from an array', () => {
    const json = JSON.stringify([cim(10, 4, at(1000)), cim(11, 10, '2026-10-24T10:00:00.5+02:00')]);
    expect(parseCimProcesses(json)).toEqual([
      { pid: 10, ppid: 4, start: at(1000) },
      { pid: 11, ppid: 10, start: '2026-10-24T10:00:00.5+02:00' },
    ]);
  });
  it('keeps the process Name when the query has it', () => {
    const json = JSON.stringify([{ ...cim(10, 4, at(1)), Name: 'conhost.exe' }]);
    expect(parseCimProcesses(json)).toEqual([{ pid: 10, ppid: 4, start: at(1), name: 'conhost.exe' }]);
  });
  it('accepts a single object (ConvertTo-Json does not wrap one result in an array)', () => {
    expect(parseCimProcesses(JSON.stringify(cim(10, 4, at(1000))))).toEqual([{ pid: 10, ppid: 4, start: at(1000) }]);
  });
  it('reads a CreationDate serialized as an object with a value, and a missing one as empty', () => {
    const json = JSON.stringify([cim(10, 4, { value: at(5) }), cim(0, 0, null)]);
    expect(parseCimProcesses(json)).toEqual([
      { pid: 10, ppid: 4, start: at(5) },
      { pid: 0, ppid: 0, start: '' },
    ]);
  });
  it('fails on output that is not a process list', () => {
    expect(() => parseCimProcesses('oops')).toThrow();
    expect(() => parseCimProcesses('[{"Name":"x"}]')).toThrow(/ProcessId/);
  });
});

describe('appTree', () => {
  // tauri-driver (100) → msedgedriver (101) → app (200) → msedgewebview2 (201) → renderers (202, 203)
  const procs = [
    { pid: 4, ppid: 0, start: at(1) },
    { pid: 100, ppid: 4, start: at(10) },
    { pid: 101, ppid: 100, start: at(11) },
    { pid: 200, ppid: 101, start: at(20) },
    { pid: 201, ppid: 200, start: at(21) },
    { pid: 202, ppid: 201, start: at(22) },
    { pid: 203, ppid: 201, start: at(23) },
    { pid: 300, ppid: 4, start: at(30) }, // unrelated
  ];
  const pids = (list: { pid: number }[]): number[] => list.map((p) => p.pid).sort((a, b) => a - b);

  it("returns every descendant of the driver's child, neither the driver nor its child", () => {
    expect(pids(appTree(procs, 100))).toEqual([200, 201, 202, 203]);
  });
  it('returns nothing when no app runs under the native driver', () => {
    expect(appTree(procs.slice(0, 3), 100)).toEqual([]);
  });
  it('returns nothing when the driver is not running', () => {
    expect(appTree(procs, 999)).toEqual([]);
  });
  it('ignores a process whose parent PID was reused: it was created before its supposed parent', () => {
    const stale = { pid: 400, ppid: 200, start: at(15) }; // its real parent exited; PID 200 is now the app
    expect(pids(appTree([...procs, stale], 100))).toEqual([200, 201, 202, 203]);
  });
  it("ignores a console host among msedgedriver's own children, not one under the app", () => {
    const driverConsole = { pid: 500, ppid: 101, start: at(12), name: 'CONHOST.EXE' };
    const appConsole = { pid: 501, ppid: 200, start: at(24), name: 'conhost.exe' };
    expect(pids(appTree([...procs, driverConsole, appConsole], 100))).toEqual([200, 201, 202, 203, 501]);
    expect(appTree([...procs.slice(0, 3), driverConsole], 100)).toEqual([]);
  });
  it('ignores a process that names itself as its parent (System Idle, PID 0)', () => {
    expect(appTree([{ pid: 0, ppid: 0, start: '' }], 0)).toEqual([]);
  });
});

describe('windowsAppDataDirs', () => {
  it('lists the Roaming and Local dirs of both app identifiers', () => {
    const env = { APPDATA: 'C:\\Users\\ci\\AppData\\Roaming', LOCALAPPDATA: 'C:\\Users\\ci\\AppData\\Local' };
    expect(windowsAppDataDirs(env)).toEqual([
      'C:\\Users\\ci\\AppData\\Roaming\\org.qsp.qspider',
      'C:\\Users\\ci\\AppData\\Local\\org.qsp.qspider',
      'C:\\Users\\ci\\AppData\\Roaming\\org.qsp.e2e.standalone',
      'C:\\Users\\ci\\AppData\\Local\\org.qsp.e2e.standalone',
    ]);
  });
  it('fails when APPDATA or LOCALAPPDATA is not an absolute path', () => {
    expect(() => windowsAppDataDirs({ APPDATA: 'AppData\\Roaming', LOCALAPPDATA: 'C:\\l' })).toThrow(/absolute/);
    expect(() => windowsAppDataDirs({ APPDATA: 'C:\\a', LOCALAPPDATA: '.' })).toThrow(/absolute/);
  });
  it('fails when APPDATA or LOCALAPPDATA is not set', () => {
    expect(() => windowsAppDataDirs({ APPDATA: 'C:\\a' })).toThrow(/LOCALAPPDATA/);
    expect(() => windowsAppDataDirs({ LOCALAPPDATA: 'C:\\l' })).toThrow(/APPDATA/);
  });
});

describe('assertHostSessionAllowed', () => {
  it('throws on a developer machine: neither CI nor QSPIDER_E2E_HOST_SESSION=1', () => {
    expect(() => assertHostSessionAllowed({})).toThrow(/QSPIDER_E2E_HOST_SESSION=1/);
    expect(() => assertHostSessionAllowed({ CI: '' })).toThrow();
    expect(() => assertHostSessionAllowed({ CI: 'false' })).toThrow();
    expect(() => assertHostSessionAllowed({ QSPIDER_E2E_HOST_SESSION: 'yes' })).toThrow();
  });
  it('allows CI and an explicit host session', () => {
    expect(() => assertHostSessionAllowed({ CI: 'true' })).not.toThrow();
    expect(() => assertHostSessionAllowed({ CI: '1' })).not.toThrow();
    expect(() => assertHostSessionAllowed({ QSPIDER_E2E_HOST_SESSION: '1' })).not.toThrow();
  });
});

describe('windowsWebviewOptions', () => {
  it("pins the user data folder to the app's Local app data dir", () => {
    expect(windowsWebviewOptions('org.qsp.qspider', { LOCALAPPDATA: 'C:\\Users\\ci\\AppData\\Local' })).toEqual({
      userDataFolder: 'C:\\Users\\ci\\AppData\\Local\\org.qsp.qspider',
    });
  });
  it('fails when LOCALAPPDATA is missing or relative', () => {
    expect(() => windowsWebviewOptions('org.qsp.qspider', {})).toThrow(/LOCALAPPDATA/);
    expect(() => windowsWebviewOptions('org.qsp.qspider', { LOCALAPPDATA: 'AppData' })).toThrow(/absolute/);
  });
});
