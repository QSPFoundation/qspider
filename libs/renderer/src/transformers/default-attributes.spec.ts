import { describe, expect, it } from 'vitest';
import { layerIndex, menuOffset, variableIndex } from './default-attributes';

describe('menuOffset', () => {
  it('reads pixels', () => {
    expect(menuOffset('15')).toBe(15);
  });

  it('ignores a px suffix', () => {
    expect(menuOffset('15px')).toBe(15);
  });

  it('keeps a negative offset', () => {
    expect(menuOffset('-8')).toBe(-8);
  });

  it('is 0 when missing or empty', () => {
    expect(menuOffset(undefined)).toBe(0);
    expect(menuOffset('')).toBe(0);
  });
});

describe('variableIndex', () => {
  it('reads the array index', () => {
    expect(variableIndex('2')).toBe(2);
  });

  it('keeps index 0', () => {
    expect(variableIndex('0')).toBe(0);
  });

  it('leaves the default index when missing or empty', () => {
    expect(variableIndex(undefined)).toBeUndefined();
    expect(variableIndex('')).toBeUndefined();
  });
});

describe('layerIndex', () => {
  it('reads the z-index', () => {
    expect(layerIndex('10')).toBe(10);
  });

  it('is NaN when the index is missing, which the browser ignores as a z-index', () => {
    expect(layerIndex(undefined)).toBeNaN();
  });
});
