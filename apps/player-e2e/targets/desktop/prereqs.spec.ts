import { describe, expect, it } from 'vitest';
import { ATSPI_PREREQ, findMissingPrereqs } from './prereqs';

const all = (c: string): string => `/usr/bin/${c}`;
const atspi = (): boolean => true;
const noAtspi = (): boolean => false;

describe('findMissingPrereqs', () => {
  it('names every missing tool on linux', () => {
    expect(findMissingPrereqs('linux', () => null, atspi)).toEqual([
      'tauri-driver',
      'WebKitWebDriver',
      'xvfb-run',
      'dbus-run-session',
      'python3',
    ]);
  });
  it('returns empty when all present; no display is needed on linux (Xvfb provides it)', () => {
    expect(findMissingPrereqs('linux', all, atspi)).toEqual([]);
  });
  it('names xvfb-run on linux', () => {
    expect(findMissingPrereqs('linux', (c) => (c === 'xvfb-run' ? null : all(c)), atspi)).toEqual(['xvfb-run']);
  });
  it('names dbus-run-session on linux', () => {
    expect(findMissingPrereqs('linux', (c) => (c === 'dbus-run-session' ? null : all(c)), atspi)).toEqual([
      'dbus-run-session',
    ]);
  });
  it('names Atspi on linux when python3 cannot import it', () => {
    expect(findMissingPrereqs('linux', all, noAtspi)).toEqual([ATSPI_PREREQ]);
  });
  it('names python3 alone when it is missing, without probing Atspi', () => {
    let probed = false;
    const probe = (): boolean => {
      probed = true;
      return false;
    };
    expect(findMissingPrereqs('linux', (c) => (c === 'python3' ? null : all(c)), probe)).toEqual(['python3']);
    expect(probed).toBe(false);
  });
  it('names msedgedriver on windows', () => {
    expect(findMissingPrereqs('win32', (c) => (c === 'tauri-driver' ? 'C:\\tauri-driver.exe' : null), noAtspi)).toEqual(
      ['msedgedriver'],
    );
  });
  it('checks neither display nor Atspi on windows or macos', () => {
    expect(findMissingPrereqs('win32', (c) => `C:\\${c}.exe`, noAtspi)).toEqual([]);
    expect(findMissingPrereqs('darwin', () => null, noAtspi)).toEqual([]);
  });
});
