import { describe, expect, it } from 'vitest';
import { findMissingPrereqs } from './prereqs';

describe('findMissingPrereqs', () => {
  it('names every missing tool on linux', () => {
    expect(findMissingPrereqs('linux', () => null)).toEqual(['tauri-driver', 'WebKitWebDriver']);
  });
  it('returns empty when all present', () => {
    expect(findMissingPrereqs('linux', (c) => `/usr/bin/${c}`)).toEqual([]);
  });
  it('names msedgedriver on windows', () => {
    expect(findMissingPrereqs('win32', (c) => (c === 'tauri-driver' ? 'C:\\tauri-driver.exe' : null))).toEqual([
      'msedgedriver',
    ]);
  });
});
