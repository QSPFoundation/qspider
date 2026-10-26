import { describe, expect, it } from 'vitest';
import { boundChecked, parseBindIndex } from './qsp-bind-props';

describe('parseBindIndex', () => {
  it('reads the index', () => {
    expect(parseBindIndex('3')).toBe(3);
  });

  it('is 0 when the attribute is missing', () => {
    expect(parseBindIndex(undefined)).toBe(0);
  });

  it('is 0 when the attribute is empty', () => {
    expect(parseBindIndex('')).toBe(0);
  });

  it('reads the leading number of the text', () => {
    expect(parseBindIndex('2nd')).toBe(2);
  });
});

describe('boundChecked', () => {
  it('checks a radio whose value equals the variable', () => {
    expect(boundChecked('radio', 'hard', 'hard')).toBe(true);
  });

  it('leaves a radio with another value unchecked', () => {
    expect(boundChecked('radio', 'easy', 'hard')).toBe(false);
  });

  it('leaves a radio without a value unchecked', () => {
    expect(boundChecked('radio', 'easy', undefined)).toBe(false);
  });

  it('checks a checkbox when the variable has a value', () => {
    expect(boundChecked('checkbox', '1', 'on')).toBe(true);
  });

  it('leaves a checkbox unchecked when the variable is empty', () => {
    expect(boundChecked('checkbox', '', 'on')).toBe(false);
  });

  it('checks a checkbox whatever its own value is', () => {
    expect(boundChecked('checkbox', 'yes', undefined)).toBe(true);
  });
});
