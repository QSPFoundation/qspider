import { describe, expect, it } from 'vitest';
import { checkCondition } from './conditions';

describe('checkCondition', () => {
  it('equals and is compare as text', () => {
    expect(checkCondition('abc', ['equals', 'abc'])).toBe(true);
    expect(checkCondition('abc', ['is', 'abd'])).toBe(false);
    expect(checkCondition(12, ['equals', '12'])).toBe(true);
    expect(checkCondition(12, ['is', '13'])).toBe(false);
  });

  it('not-equals and is-not compare as text', () => {
    expect(checkCondition('abc', ['not-equals', 'abd'])).toBe(true);
    expect(checkCondition('abc', ['is-not', 'abc'])).toBe(false);
    expect(checkCondition(12, ['not-equals', '12'])).toBe(false);
    expect(checkCondition(12, ['is-not', '13'])).toBe(true);
  });

  it('contains and not-contains search a string', () => {
    expect(checkCondition('hello world', ['contains', 'lo w'])).toBe(true);
    expect(checkCondition('hello world', ['contains', 'xyz'])).toBe(false);
    expect(checkCondition('hello world', ['not-contains', 'xyz'])).toBe(true);
    expect(checkCondition('hello world', ['not-contains', 'hello'])).toBe(false);
  });

  it('contains and not-contains search a number as text', () => {
    expect(checkCondition(12, ['contains', '1'])).toBe(true);
    expect(checkCondition(12, ['contains', '3'])).toBe(false);
    expect(checkCondition(12, ['not-contains', '1'])).toBe(false);
    expect(checkCondition(12, ['not-contains', '3'])).toBe(true);
  });

  it('orders numbers numerically', () => {
    expect(checkCondition(10, ['greater', '9'])).toBe(true);
    expect(checkCondition(9, ['greater', '9'])).toBe(false);
    expect(checkCondition(9, ['less', '10'])).toBe(true);
    expect(checkCondition(10, ['less', '10'])).toBe(false);
    expect(checkCondition(9, ['greater-or-equal', '9'])).toBe(true);
    expect(checkCondition(8, ['greater-or-equal', '9'])).toBe(false);
    expect(checkCondition(9, ['less-or-equal', '9'])).toBe(true);
    expect(checkCondition(10, ['less-or-equal', '9'])).toBe(false);
  });

  it('keeps numeric comparison for a number against a non-numeric or empty string', () => {
    expect(checkCondition(10, ['less', 'abc'])).toBe(false);
    expect(checkCondition(10, ['greater', 'abc'])).toBe(false);
    expect(checkCondition(-1, ['greater', ''])).toBe(false);
    expect(checkCondition(1, ['greater', ''])).toBe(true);
  });

  it('orders non-numeric strings as strings', () => {
    expect(checkCondition('b', ['greater', 'a'])).toBe(true);
    expect(checkCondition('a', ['greater', 'b'])).toBe(false);
    expect(checkCondition('a', ['less', 'b'])).toBe(true);
    expect(checkCondition('b', ['less', 'a'])).toBe(false);
    expect(checkCondition('a', ['greater-or-equal', 'a'])).toBe(true);
    expect(checkCondition('a', ['less-or-equal', 'a'])).toBe(true);
    expect(checkCondition('b', ['less-or-equal', 'a'])).toBe(false);
  });

  it('orders numeric strings numerically when both sides are numeric', () => {
    expect(checkCondition('10', ['greater', '9'])).toBe(true);
    expect(checkCondition('9', ['less', '10'])).toBe(true);
    expect(checkCondition('10', ['greater-or-equal', '9'])).toBe(true);
    expect(checkCondition('9', ['less-or-equal', '10'])).toBe(true);
  });

  it('treats only decimal integers as numeric strings', () => {
    expect(checkCondition('Infinity', ['greater-or-equal', 'Infinity'])).toBe(true);
    expect(checkCondition('Infinity', ['less-or-equal', 'Infinity'])).toBe(true);
    expect(checkCondition('10', ['greater', '0x10'])).toBe(true);
    expect(checkCondition('1e3', ['less', '9'])).toBe(true);
    expect(checkCondition(' 12', ['greater', '9'])).toBe(true);
  });

  it('keeps string order when only one side is numeric', () => {
    expect(checkCondition('10', ['greater', 'abc'])).toBe(false);
    expect(checkCondition('abc', ['greater', '10'])).toBe(true);
  });

  it('gives false for an unknown op', () => {
    expect(checkCondition('a', ['starts-with', 'a'])).toBe(false);
  });
});
