import { describe, expect, it } from 'vitest';
import { convertColor, getContrastColor, invertColor } from './colors';

describe('convertColor', () => {
  it('returns null for zero', () => {
    expect(convertColor(0)).toBeNull();
    expect(convertColor(0, false)).toBeNull();
  });

  it('reads the integer as [alpha, blue, green, red] bytes', () => {
    expect(convertColor(0xff0000ff)).toBe('rgba(255,0,0,1)');
    expect(convertColor(0x0a_ff_00_00)).toBe(`rgba(0,0,255,${10 / 255})`);
  });

  it('keeps an alpha byte of 1 as fully opaque', () => {
    expect(convertColor(0x01_00_00_ff)).toBe('rgba(255,0,0,1)');
  });

  it('scales other alpha bytes to a 0..1 fraction', () => {
    expect(convertColor(0x80_00_00_ff)).toBe(`rgba(255,0,0,${128 / 255})`);
  });

  it('drops the alpha channel when withAlpha is false', () => {
    expect(convertColor(0xff0000ff, false)).toBe('rgb(255,0,0)');
    expect(convertColor(0x00_33_22_11, false)).toBe('rgb(17,34,51)');
  });
});

describe('invertColor', () => {
  it('inverts white to black', () => {
    expect(invertColor('#ffffff')).toBe('#000000');
  });

  it('inverts each channel', () => {
    expect(invertColor('#102030')).toBe('#EFDFCF');
  });
});

describe('getContrastColor', () => {
  it('picks black on a light background', () => {
    expect(getContrastColor('#ffffff')).toBe('black');
  });

  it('picks white on a dark background', () => {
    expect(getContrastColor('#000000')).toBe('white');
  });
});
