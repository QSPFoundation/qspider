import { describe, expect, it } from 'vitest';
import { conditionValue, formatQspValue, nextRefCount, sameValue, scalarOrUnset, variableKey } from './variable-logic';

describe('variableKey', () => {
  it('upper-cases the name, keeps the prefix, key wins over index', () => {
    expect(variableKey('fcolor', '', 0)).toBe(variableKey('FCOLOR', '', 0));
    expect(variableKey('$x', '', 0)).not.toBe(variableKey('x', '', 0));
    expect(variableKey('a', 'k', 3)).toBe(variableKey('A', 'k', 0));
    expect(variableKey('a', '', 1)).not.toBe(variableKey('a', '', 2));
    expect(variableKey('a', 'K', 0)).not.toBe(variableKey('a', 'k', 0));
  });
});

describe('sameValue', () => {
  it('compares deeply', () => {
    expect(sameValue([1, 'a'], [1, 'a'])).toBe(true);
    expect(sameValue([1, [2]], [1, [3]])).toBe(false);
    const named = Object.assign([1], { names: ['A'] });
    expect(sameValue(named, [1])).toBe(false);
    expect(sameValue('5', 5)).toBe(false);
    expect(sameValue(undefined, undefined)).toBe(true);
  });
});

describe('scalarOrUnset / conditionValue', () => {
  it('maps tuples and unset values', () => {
    expect(scalarOrUnset([1])).toBeUndefined();
    expect(scalarOrUnset('a')).toBe('a');
    expect(conditionValue(undefined)).toBe(0);
    expect(conditionValue([1])).toBe(0);
    expect(conditionValue('x')).toBe('x');
  });
});

describe('formatQspValue', () => {
  it('prints the QSP text form', () => {
    expect(formatQspValue([1, "a'b", [2, 'c'], -3])).toBe("[1, 'a''b', [2, 'c'], -3]");
    expect(formatQspValue('text')).toBe('text');
    expect(formatQspValue(7)).toBe('7');
    expect(formatQspValue(undefined)).toBe('');
  });
});

describe('nextRefCount', () => {
  it('never goes below zero', () => {
    expect(nextRefCount(0, -1)).toBe(0);
    expect(nextRefCount(1, 1)).toBe(2);
  });
});
