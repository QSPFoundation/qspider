import { describe, expect, it } from 'vitest';
import { DISPLAY_PREREQ, findMissingPrereqs } from './prereqs';

const x11 = { DISPLAY: ':0' };

describe('findMissingPrereqs', () => {
  it('names every missing tool on linux', () => {
    expect(findMissingPrereqs('linux', () => null, x11)).toEqual(['tauri-driver', 'WebKitWebDriver']);
  });
  it('returns empty when all present', () => {
    expect(findMissingPrereqs('linux', (c) => `/usr/bin/${c}`, x11)).toEqual([]);
  });
  it('names msedgedriver on windows', () => {
    expect(findMissingPrereqs('win32', (c) => (c === 'tauri-driver' ? 'C:\\tauri-driver.exe' : null), {})).toEqual([
      'msedgedriver',
    ]);
  });
  it('names the display on linux when neither DISPLAY nor WAYLAND_DISPLAY is set', () => {
    expect(findMissingPrereqs('linux', (c) => `/usr/bin/${c}`, {})).toEqual([DISPLAY_PREREQ]);
  });
  it('treats empty display variables as unset', () => {
    expect(findMissingPrereqs('linux', (c) => `/usr/bin/${c}`, { DISPLAY: '', WAYLAND_DISPLAY: '' })).toEqual([
      DISPLAY_PREREQ,
    ]);
  });
  it('accepts a Wayland display alone', () => {
    expect(findMissingPrereqs('linux', (c) => `/usr/bin/${c}`, { WAYLAND_DISPLAY: 'wayland-1' })).toEqual([]);
  });
  it('reports missing tools and display together', () => {
    expect(findMissingPrereqs('linux', () => null, {})).toEqual(['tauri-driver', 'WebKitWebDriver', DISPLAY_PREREQ]);
  });
  it('does not require a display on windows or macos', () => {
    expect(findMissingPrereqs('win32', (c) => `C:\\${c}.exe`, {})).toEqual([]);
    expect(findMissingPrereqs('darwin', () => null, {})).toEqual([]);
  });
});
