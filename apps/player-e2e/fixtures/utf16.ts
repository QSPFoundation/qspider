// UTF-16 LE encoding with a BOM, for game.cfg fixtures. Keep this module free of test-framework imports:
// the builder and the standalone staging script (plain Node TypeScript) both load it.
export function utf16(text: string): Buffer {
  return Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, 'utf16le')]);
}
