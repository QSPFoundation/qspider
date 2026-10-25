import { describe, expect, it } from 'vitest';
import { adjustHeightFor, clampToMonitor, windowPlatformName } from './window-geometry';

describe('windowPlatformName', () => {
  it.each([
    ['macos', 'Macintosh'],
    ['linux', 'Linux'],
    ['windows', 'Windows'],
  ])('names %s as %s', (os, name) => {
    expect(windowPlatformName(os)).toBe(name);
  });

  it('gives no name for an unknown OS', () => {
    expect(windowPlatformName('freebsd')).toBeUndefined();
  });
});

describe('clampToMonitor', () => {
  it('keeps a size that fits', () => {
    expect(clampToMonitor(800, 1920)).toBe(800);
  });

  it('keeps a size one pixel inside the monitor', () => {
    expect(clampToMonitor(1919, 1920)).toBe(1919);
  });

  it('cuts a size equal to or above the monitor to one pixel less', () => {
    expect(clampToMonitor(1920, 1920)).toBe(1919);
    expect(clampToMonitor(5000, 1920)).toBe(1919);
  });
});

describe('adjustHeightFor', () => {
  it('adds the 28px title bar on macos', () => {
    expect(adjustHeightFor('macos', 600)).toBe(628);
  });

  it('leaves the height alone elsewhere', () => {
    expect(adjustHeightFor('linux', 600)).toBe(600);
    expect(adjustHeightFor('windows', 600)).toBe(600);
  });
});
