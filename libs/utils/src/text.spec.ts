import { describe, expect, it } from 'vitest';
import { decodeText } from './text';

describe('decodeText', () => {
  it('decodes utf-16le when the bytes start with a BOM', () => {
    expect(decodeText(new Uint8Array([0xff, 0xfe, 0x68, 0, 0x69, 0]))).toBe('hi');
  });

  it('decodes plain ASCII as utf-8', () => {
    expect(decodeText(new Uint8Array([0x68, 0x69]))).toBe('hi');
  });

  it('decodes Cyrillic utf-8 bytes', () => {
    expect(decodeText(new Uint8Array([0xd0, 0x9f, 0xd1, 0x80, 0xd0, 0xb8, 0xd0, 0xb2, 0xd0, 0xb5, 0xd1, 0x82]))).toBe(
      'Привет',
    );
  });

  it('decodes an ArrayBuffer the same way', () => {
    expect(decodeText(new Uint8Array([0xff, 0xfe, 0x68, 0, 0x69, 0]).buffer)).toBe('hi');
  });
});
