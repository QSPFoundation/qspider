import { describe, expect, it } from 'vitest';
import { formatBytes } from './formatters';

describe('formatBytes', () => {
  it('writes zero as 0 Bytes', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('keeps sizes below a kilobyte in bytes', () => {
    expect(formatBytes(1023)).toBe('1023 Bytes');
  });

  it('switches to KB at 1024', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('keeps fractions up to two decimals', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('rounds to the requested decimals', () => {
    expect(formatBytes(1536, 0)).toBe('2 KB');
  });

  it('scales up to GB', () => {
    expect(formatBytes(5 * 1024 ** 3)).toBe('5 GB');
  });
});
