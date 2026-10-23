// Generated binary assets of the resources game (resources-game/): a quiet WAV and a one-glyph TTF.
// No binary is committed. Runs at setup only (build-fixtures.ts).

/**
 * RIFF PCM WAV, 8 kHz mono 8-bit: a very quiet square wave (amplitude 3 of 127) of the given frequency.
 * The sound is long (never heard to the end) so "is it still playing" checks cannot race its end.
 */
export function quietWav(seconds: number, frequency: number): Uint8Array {
  const rate = 8000;
  const samples = rate * seconds;
  const out = Buffer.alloc(44 + samples);
  out.write('RIFF', 0, 'ascii');
  out.writeUInt32LE(36 + samples, 4);
  out.write('WAVEfmt ', 8, 'ascii');
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20); // PCM
  out.writeUInt16LE(1, 22); // mono
  out.writeUInt32LE(rate, 24);
  out.writeUInt32LE(rate, 28); // byte rate
  out.writeUInt16LE(1, 32); // block align
  out.writeUInt16LE(8, 34); // bits
  out.write('data', 36, 'ascii');
  out.writeUInt32LE(samples, 40);
  for (let i = 0; i < samples; i++) out[44 + i] = 128 + (Math.floor((i * frequency * 2) / rate) % 2 ? 3 : -3);
  return new Uint8Array(out);
}

const u16 = (...values: number[]): Buffer => {
  const out = Buffer.alloc(values.length * 2);
  values.forEach((v, i) => out.writeUInt16BE(v & 0xffff, i * 2));
  return out;
};
const i16 = (...values: number[]): Buffer => {
  const out = Buffer.alloc(values.length * 2);
  values.forEach((v, i) => out.writeInt16BE(v, i * 2));
  return out;
};
const u32 = (...values: number[]): Buffer => {
  const out = Buffer.alloc(values.length * 4);
  values.forEach((v, i) => out.writeUInt32BE(v >>> 0, i * 4));
  return out;
};
const padded = (data: Buffer): Buffer => Buffer.concat([data, Buffer.alloc((4 - (data.length % 4)) % 4)]);
const checksum = (data: Buffer): number => {
  let sum = 0;
  const bytes = padded(data);
  for (let i = 0; i < bytes.length; i += 4) sum = (sum + bytes.readUInt32BE(i)) >>> 0;
  return sum;
};

/**
 * A minimal valid TrueType font (about 1 KB): .notdef plus one glyph, a filled square, for "A" (family "E2eFont").
 * Generated rather than committed: it is the smallest font the browsers' sanitizer accepts and needs no licence.
 */
export function squareFont(): Uint8Array {
  const glyph = padded(
    Buffer.concat([
      i16(1, 0, 0, 500, 700), // one contour, bounding box
      u16(3, 0), // last point 3, no instructions
      Buffer.from([1, 1, 1, 1]), // on-curve, x and y as int16 deltas
      i16(0, 500, 0, -500), // x deltas
      i16(0, 0, 700, 0), // y deltas
    ]),
  );
  const name = (id: number, text: string): [number, Buffer] => [id, Buffer.from(text, 'utf16le').swap16()];
  const names = [name(1, 'E2eFont'), name(2, 'Regular'), name(4, 'E2eFont'), name(6, 'E2eFont')];
  let offset = 0;
  const records = names.map(([id, text]) => {
    const record = u16(3, 1, 0x409, id, text.length, offset);
    offset += text.length;
    return record;
  });
  const tables: Record<string, Buffer> = {
    'OS/2': Buffer.concat([
      u16(4, 600, 400, 5, 0),
      u16(650, 600, 0, 75, 650, 600, 0, 350, 50, 300, 0),
      Buffer.alloc(10), // panose
      u32(1, 0, 0, 0), // unicode ranges
      Buffer.from('E2E ', 'ascii'),
      u16(0x40, 0x41, 0x41),
      i16(800, -200, 0),
      u16(800, 200),
      u32(1, 0), // code pages
      u16(500, 700, 0, 0x20, 1),
    ]),
    cmap: Buffer.concat([
      u16(0, 1, 3, 1),
      u32(12),
      u16(4, 32, 0, 4, 4, 1, 0), // format 4, two segments
      u16(0x41, 0xffff, 0), // end codes, reserved pad
      u16(0x41, 0xffff), // start codes
      u16(1 - 0x41, 1), // id deltas
      u16(0, 0), // id range offsets
    ]),
    glyf: glyph,
    head: Buffer.concat([
      u32(0x00010000, 0x00010000, 0, 0x5f0f3cf5),
      u16(0x000b, 1000),
      Buffer.alloc(16), // created, modified
      i16(0, 0, 500, 700),
      u16(0, 8, 2, 0, 0),
    ]),
    hhea: Buffer.concat([
      u32(0x00010000),
      i16(800, -200, 0),
      u16(600),
      i16(0, 0, 500, 1, 0, 0),
      Buffer.alloc(8),
      u16(0, 2),
    ]),
    hmtx: Buffer.concat([u16(600), i16(0), u16(600), i16(0)]),
    loca: u16(0, 0, glyph.length / 2),
    maxp: Buffer.concat([u32(0x00010000), u16(2, 4, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0)]),
    name: Buffer.concat([u16(0, names.length, 6 + names.length * 12), ...records, ...names.map(([, text]) => text)]),
    post: Buffer.concat([u32(0x00030000, 0), i16(-100, 50), u32(0, 0, 0, 0, 0)]),
  };
  const tags = Object.keys(tables).sort();
  const directory = Buffer.alloc(12 + tags.length * 16);
  directory.writeUInt32BE(0x00010000, 0);
  directory.writeUInt16BE(tags.length, 4);
  directory.writeUInt16BE(128, 6); // searchRange: 8 * 16
  directory.writeUInt16BE(3, 8);
  directory.writeUInt16BE(tags.length * 16 - 128, 10);
  let position = directory.length;
  tags.forEach((tag, i) => {
    const table = tables[tag];
    directory.write(tag, 12 + i * 16, 'ascii');
    directory.writeUInt32BE(checksum(table), 16 + i * 16);
    directory.writeUInt32BE(position, 20 + i * 16);
    directory.writeUInt32BE(table.length, 24 + i * 16);
    position += padded(table).length;
  });
  const font = Buffer.concat([directory, ...tags.map((tag) => padded(tables[tag]))]);
  const headAt = directory.readUInt32BE(20 + tags.indexOf('head') * 16);
  font.writeUInt32BE((0xb1b0afba - checksum(font)) >>> 0, headAt + 8);
  return new Uint8Array(font);
}
