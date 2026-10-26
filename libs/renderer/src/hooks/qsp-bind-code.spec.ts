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
    expect(bindAssignment('$name', '', 0, 'Bob')).toBe('$name = "Bob"');
  });

  it('assigns to an array element by key', () => {
    expect(bindAssignment('arr', 'k', 0, '5')).toBe('arr["k"] = 5');
  });

  it('assigns to an array element by index', () => {
    expect(bindAssignment('arr', '', 2, '5')).toBe('arr[2] = 5');
  });

  it('assigns 0 to a numeric variable when the input is empty', () => {
    expect(bindAssignment('n', '', 0, '')).toBe('n = 0');
  });

  // Defect pending a maintainer decision: the text is emitted as QSP code (`n = abc`).
  it.fails('treats non-numeric text in a numeric variable as 0, like an empty input: n = 0', () => {
    expect(bindAssignment('n', '', 0, 'abc')).toBe('n = 0');
  });
});
