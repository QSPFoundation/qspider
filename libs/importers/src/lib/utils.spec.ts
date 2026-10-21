import { describe, expect, it } from 'vitest';
import { is7zip, isRar, isSupportedArchive, isZip } from './utils';

const bytes = (...values: number[]) => new Uint8Array(values);
const toBuffer = (data: Uint8Array): ArrayBuffer => data.slice().buffer;

const ZIP_LOCAL_FILE = bytes(0x50, 0x4b, 0x03, 0x04, 0x14, 0x00);
const RAR_SIGNATURE = bytes(0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x01, 0x00);
const SEVEN_ZIP_SIGNATURE = bytes(0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c, 0x00, 0x04);
const PLAIN_TEXT = new TextEncoder().encode('Hello, this is not an archive');

describe('isZip', () => {
  it('detects the ZIP local-file signature', () => {
    expect(isZip(ZIP_LOCAL_FILE)).toBe(true);
  });

  it('detects the ZIP empty-archive and spanned signatures', () => {
    expect(isZip(bytes(0x50, 0x4b, 0x05, 0x06))).toBe(true);
    expect(isZip(bytes(0x50, 0x4b, 0x07, 0x08))).toBe(true);
  });

  it('rejects RAR, 7z and plain text', () => {
    expect(isZip(RAR_SIGNATURE)).toBe(false);
    expect(isZip(SEVEN_ZIP_SIGNATURE)).toBe(false);
    expect(isZip(PLAIN_TEXT)).toBe(false);
  });

  it('rejects data shorter than the signature', () => {
    expect(isZip(bytes(0x50, 0x4b))).toBe(false);
    expect(isZip(new Uint8Array())).toBe(false);
  });
});

describe('isRar', () => {
  it('detects the RAR signature', () => {
    expect(isRar(RAR_SIGNATURE)).toBe(true);
  });

  it('rejects ZIP, 7z and plain text', () => {
    expect(isRar(ZIP_LOCAL_FILE)).toBe(false);
    expect(isRar(SEVEN_ZIP_SIGNATURE)).toBe(false);
    expect(isRar(PLAIN_TEXT)).toBe(false);
  });

  it('rejects data shorter than the signature', () => {
    expect(isRar(bytes(0x52, 0x61, 0x72))).toBe(false);
  });
});

describe('is7zip', () => {
  it('detects the 7z signature', () => {
    expect(is7zip(SEVEN_ZIP_SIGNATURE)).toBe(true);
  });

  it('rejects ZIP, RAR and plain text', () => {
    expect(is7zip(ZIP_LOCAL_FILE)).toBe(false);
    expect(is7zip(RAR_SIGNATURE)).toBe(false);
    expect(is7zip(PLAIN_TEXT)).toBe(false);
  });

  it('rejects data shorter than the signature', () => {
    expect(is7zip(bytes(0x37, 0x7a, 0xbc, 0xaf, 0x27))).toBe(false);
  });
});

describe('isSupportedArchive', () => {
  it('accepts a ZIP buffer', () => {
    expect(isSupportedArchive(toBuffer(ZIP_LOCAL_FILE))).toBe(true);
  });

  it('accepts a RAR buffer', () => {
    expect(isSupportedArchive(toBuffer(RAR_SIGNATURE))).toBe(true);
  });

  it('accepts a 7z buffer', () => {
    expect(isSupportedArchive(toBuffer(SEVEN_ZIP_SIGNATURE))).toBe(true);
  });

  it('rejects plain text', () => {
    expect(isSupportedArchive(toBuffer(PLAIN_TEXT))).toBe(false);
  });
});
