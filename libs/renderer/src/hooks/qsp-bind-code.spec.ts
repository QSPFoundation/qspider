import { describe, expect, it } from 'vitest';
import { bindAssignment, boundInputValue, toQspString } from './qsp-bind-code';

describe('toQspString', () => {
  it('doubles a quote inside the literal', () => {
    expect(toQspString('a"b')).toBe('"a""b"');
  });

  it('cuts a double angle bracket so QSP does not expand it', () => {
    expect(toQspString('<<x>>')).toBe('"<" + "<x>>"');
  });

  it('joins LF and CRLF line breaks with chr(10)', () => {
    expect(toQspString('l1\nl2')).toBe('"l1" + chr(10) + "l2"');
    expect(toQspString('l1\r\nl2')).toBe('"l1" + chr(10) + "l2"');
  });
});

describe('boundInputValue', () => {
  it('gives an empty string for an unchecked checkbox', () => {
    expect(boundInputValue({ type: 'checkbox', checked: false, value: 'on' })).toBe('');
  });

  it('gives the value of a checked checkbox', () => {
    expect(boundInputValue({ type: 'checkbox', checked: true, value: 'on' })).toBe('on');
  });

  it('gives the value of a text input', () => {
    expect(boundInputValue({ type: 'text', checked: false, value: 'Bob' })).toBe('Bob');
  });
});

describe('bindAssignment', () => {
  it('assigns a quoted string to a string variable', () => {
    expect(bindAssignment('$name', '', 0, 'Bob', '')).toBe('$name = "Bob"');
  });

  it('assigns to an array element by key', () => {
    expect(bindAssignment('arr', 'k', 0, '5', 0)).toBe('arr["k"] = 5');
  });

  it('assigns to an array element by index', () => {
    expect(bindAssignment('arr', '', 2, '5', 0)).toBe('arr[2] = 5');
  });

  it('assigns 0 to a numeric variable when the input is empty', () => {
    expect(bindAssignment('n', '', 0, '', 0)).toBe('n = 0');
  });

  it.each([
    ['abc', 'n = 0'],
    ['5 apples', 'n = 5'],
    ["1 & gt 'x'", 'n = 1'],
    ['-3', 'n = -3'],
    ['  7', 'n = 7'],
    ['2.9', 'n = 2'],
  ])('takes only the leading number of %j for a numeric variable: %s', (text, expected) => {
    expect(bindAssignment('n', '', 0, text, 0)).toBe(expected);
  });

  it('takes the leading number for a numeric array element by key too', () => {
    expect(bindAssignment('arr', 'k', 0, "1 & gt 'x'", 0)).toBe('arr["k"] = 1');
  });

  it('writes unprefixed by the stored type', () => {
    expect(bindAssignment('x', '', 0, 'hi', 'old')).toBe('x = "hi"');
    expect(bindAssignment('x', '', 0, '12', 5)).toBe('x = 12');
    expect(bindAssignment('x', '', 0, '12', undefined)).toBe('x = 12');
    expect(bindAssignment('x', '', 0, 'hi', [1])).toBe('x = 0');
  });

  it('lets the prefix decide over the stored type', () => {
    expect(bindAssignment('$s', '', 0, 'hi', 5)).toBe('$s = "hi"');
  });

  it('escapes the key as a QSP string', () => {
    expect(bindAssignment('$s', 'a"b', 0, 'v', '')).toBe('$s["a""b"] = "v"');
  });
});
