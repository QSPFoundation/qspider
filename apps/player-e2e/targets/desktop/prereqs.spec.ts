import { describe, expect, it } from 'vitest';
import { ATSPI_PREREQ, atspiDaemonPrereq, findMissingPrereqs, type AtspiProbes } from './prereqs';

const all = (c: string): string => `/usr/bin/${c}`;
const ok: AtspiProbes = { canImportAtspi: () => true, findMissingAtspiDaemons: () => [] };
const noAtspi: AtspiProbes = {
  canImportAtspi: () => false,
  findMissingAtspiDaemons: () => ['at-spi-bus-launcher', 'at-spi2-registryd'],
};
const missingOnly = (tool: string) => (c: string) => (c === tool ? null : all(c));

describe('findMissingPrereqs', () => {
  it('names every missing tool on linux', () => {
    expect(findMissingPrereqs('linux', () => null, ok)).toEqual([
      'tauri-driver',
      'WebKitWebDriver',
      'xvfb-run',
      'dbus-run-session',
      'dbus-send',
      'python3',
    ]);
  });
  it('returns empty when all present; no display is needed on linux (Xvfb provides it)', () => {
    expect(findMissingPrereqs('linux', all, ok)).toEqual([]);
  });
  it.each(['xvfb-run', 'dbus-run-session', 'dbus-send'])('names %s on linux', (tool) => {
    expect(findMissingPrereqs('linux', missingOnly(tool), ok)).toEqual([tool]);
  });
  it('names Atspi on linux when python3 cannot import it', () => {
    expect(findMissingPrereqs('linux', all, { ...ok, canImportAtspi: () => false })).toEqual([ATSPI_PREREQ]);
  });
  it('names python3 alone when it is missing, without probing Atspi', () => {
    let probed = false;
    const canImportAtspi = (): boolean => {
      probed = true;
      return false;
    };
    expect(findMissingPrereqs('linux', missingOnly('python3'), { ...ok, canImportAtspi })).toEqual(['python3']);
    expect(probed).toBe(false);
  });
  it('names each missing AT-SPI daemon on linux', () => {
    expect(findMissingPrereqs('linux', all, { ...ok, findMissingAtspiDaemons: () => ['at-spi2-registryd'] })).toEqual([
      atspiDaemonPrereq('at-spi2-registryd'),
    ]);
    expect(findMissingPrereqs('linux', all, { ...noAtspi, canImportAtspi: () => true })).toEqual([
      'at-spi-bus-launcher (in /usr/libexec or /usr/lib)',
      'at-spi2-registryd (in /usr/libexec or /usr/lib)',
    ]);
  });
  it('names msedgedriver on windows', () => {
    expect(findMissingPrereqs('win32', (c) => (c === 'tauri-driver' ? 'C:\\tauri-driver.exe' : null), noAtspi)).toEqual(
      ['msedgedriver'],
    );
  });
  it('checks neither display nor AT-SPI on windows or macos', () => {
    expect(findMissingPrereqs('win32', (c) => `C:\\${c}.exe`, noAtspi)).toEqual([]);
    expect(findMissingPrereqs('darwin', () => null, noAtspi)).toEqual([]);
  });
});
