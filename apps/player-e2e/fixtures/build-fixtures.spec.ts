import { existsSync, readFileSync } from 'node:fs';
import { readQsp } from '@qsp/converters';
import { beforeAll, describe, expect, it } from 'vitest';
import { ARCHIVES } from './archives';
import { unzipSync } from 'fflate';
import { buildFixtures } from './build-fixtures';
import { DIALOGS } from './dialogs-game';
import { GAME_HTML } from './game-html-game';

const bytes = (path: string): Uint8Array => new Uint8Array(readFileSync(path));
const startsWith = (path: string, magic: number[]): boolean => magic.every((b, i) => bytes(path)[i] === b);

describe('buildFixtures', () => {
  beforeAll(async () => {
    await buildFixtures();
  }, 60_000);

  it('writes every archive', () => {
    for (const { path } of Object.values(ARCHIVES)) expect(existsSync(path), path).toBe(true);
  });

  it('writes zips with the ZIP magic', () => {
    for (const { path } of [
      ARCHIVES.singleZip,
      ARCHIVES.multiZip,
      ARCHIVES.includerZip,
      ARCHIVES.dialogsZip,
      ARCHIVES.gameHtmlZip,
    ]) {
      expect(startsWith(path, [0x50, 0x4b]), path).toBe(true);
    }
  });

  it('writes the 7z with the 7z magic', () => {
    expect(startsWith(ARCHIVES.sevenZip.path, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c])).toBe(true);
  });

  it('writes a .qsp that parses back to the source location', () => {
    const data = bytes(ARCHIVES.qspBinary.path);
    expect(data.length).toBeGreaterThan(0);
    const locations = readQsp(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer);
    expect(locations.map((l) => l.name)).toEqual(['start']);
  });

  it('packs the dialogs game with its view image and a valid PNG', () => {
    expect(DIALOGS.path).toBe(ARCHIVES.dialogsZip.path);
    const files = unzipSync(bytes(ARCHIVES.dialogsZip.path));
    expect(Object.keys(files).sort()).toEqual(['dialogs.qsps', 'game.cfg', DIALOGS.viewImage].sort());
    expect([...files[DIALOGS.viewImage].slice(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it('packs the game-html game with its image', () => {
    expect(GAME_HTML.path).toBe(ARCHIVES.gameHtmlZip.path);
    const files = unzipSync(bytes(ARCHIVES.gameHtmlZip.path));
    expect(Object.keys(files).sort()).toEqual(['game-html.qsps', 'game.cfg', GAME_HTML.image].sort());
  });
});
