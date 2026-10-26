import { describe, expect, it } from 'vitest';
import { aeroPosition, dialogClassName, menuClassName } from './aero-position';

const mouse = { x: 310, y: 142 };

describe('aeroPosition', () => {
  it('uses the given point when both coordinates are set', () => {
    expect(aeroPosition(200, 165, mouse)).toEqual({ x: 200, y: 165, atMouse: false });
  });

  it('treats 0, 0 as a real point', () => {
    expect(aeroPosition(0, 0, mouse)).toEqual({ x: 0, y: 0, atMouse: false });
  });

  it('opens at the mouse when x is negative', () => {
    expect(aeroPosition(-1, 165, mouse)).toEqual({ x: 310, y: 142, atMouse: true });
  });

  it('opens at the mouse when only y is negative', () => {
    expect(aeroPosition(200, -1, mouse)).toEqual({ x: 310, y: 142, atMouse: true });
  });

  it('opens at the menu default of -1, -1 at the mouse', () => {
    expect(aeroPosition(-1, -1, mouse)).toEqual({ x: 310, y: 142, atMouse: true });
  });
});

describe('dialogClassName', () => {
  it('marks a dialog opened at the mouse', () => {
    expect(dialogClassName(true)).toBe('qsp-dialog-container at-mouse');
  });

  it('leaves a positioned dialog unmarked', () => {
    expect(dialogClassName(false)).toBe('qsp-dialog-container');
  });
});

describe('menuClassName', () => {
  it('appends the fixed-size marker to the theme class', () => {
    expect(menuClassName('qsp-menu', true)).toBe('qsp-menu aero-fixed-menu');
  });

  it('leaves the theme class alone for a free-size menu', () => {
    expect(menuClassName('qsp-menu', false)).toBe('qsp-menu');
  });

  it('gives the bare marker with a leading space when the menu has no class, so callers trim it', () => {
    expect(menuClassName(undefined, true)).toBe(' aero-fixed-menu');
    expect(menuClassName(undefined, false)).toBe('');
  });
});
