import { describe, expect, it } from 'vitest';
import type { File, FileDir } from './utils';
import { findRootDescriptorFolder, findRootGameFileFolder, getGameFolder } from './archive-tree';

const file = (name: string, data: number[] = []): File => ({ type: 'file', name, data: new Uint8Array(data) });
const dir = (name: string, ...content: Array<FileDir | File>): FileDir => ({ type: 'dir', name, content });

describe('findRootDescriptorFolder', () => {
  it('finds the descriptor at the archive root', () => {
    const root = dir('', file('game.qsp'), file('game.cfg', [1, 2]));
    const found = findRootDescriptorFolder(root);
    expect(found?.[0]).toBe(root);
    expect(Array.from(found?.[1] ?? [])).toEqual([1, 2]);
  });

  it('returns the folder that holds a descriptor found only in a nested folder', () => {
    const inner = dir('b', file('game.cfg', [7]));
    const root = dir('', dir('a', inner), file('readme.txt'));
    const found = findRootDescriptorFolder(root);
    expect(found?.[0]).toBe(inner);
    expect(Array.from(found?.[1] ?? [])).toEqual([7]);
  });

  it('prefers the root descriptor over a nested one', () => {
    const root = dir('', dir('a', file('game.cfg', [2])), file('game.cfg', [1]));
    const found = findRootDescriptorFolder(root);
    expect(found?.[0]).toBe(root);
    expect(Array.from(found?.[1] ?? [])).toEqual([1]);
  });

  it('returns null when there is no descriptor', () => {
    expect(findRootDescriptorFolder(dir('', file('game.qsp'), dir('a', file('b.txt'))))).toBeNull();
  });
});

describe('findRootGameFileFolder', () => {
  it('prefers a .qsp file over a .qsps file at the same level', () => {
    const root = dir('', file('game.qsps'), file('game.qsp'));
    expect(findRootGameFileFolder(root)).toEqual([root, 'game.qsp']);
  });

  it('accepts a .gam file as a binary game', () => {
    const root = dir('', file('game.qsps'), file('old.gam'));
    expect(findRootGameFileFolder(root)).toEqual([root, 'old.gam']);
  });

  it('takes a .qsps file when it is the only game file', () => {
    const root = dir('', file('readme.txt'), file('game.qsps'));
    expect(findRootGameFileFolder(root)).toEqual([root, 'game.qsps']);
  });

  it('descends into the first folder that has a game file', () => {
    const second = dir('second', file('b.qsp'));
    const first = dir('first', dir('deep', file('a.qsp')));
    const root = dir('', dir('empty', file('x.txt')), first, second);
    const found = findRootGameFileFolder(root);
    expect(found?.[0]).toBe(first.content[0]);
    expect(found?.[1]).toBe('a.qsp');
  });

  it('finds a game file in a subfolder', () => {
    const sub = dir('sub', file('game.qsp'));
    expect(findRootGameFileFolder(dir('', sub))).toEqual([sub, 'game.qsp']);
  });

  it('returns null when there is no game file', () => {
    expect(findRootGameFileFolder(dir('', file('readme.txt'), dir('a', file('b.png'))))).toBeNull();
  });
});

describe('getGameFolder', () => {
  it('returns the root for a game file at the root', () => {
    const root = dir('', file('game.qsp'));
    expect(getGameFolder(root, 'game.qsp')).toBe(root);
  });

  it('returns the nested folder for a game file in a subfolder', () => {
    const inner = dir('inner', file('game.qsp'));
    const root = dir('', dir('sub', inner));
    expect(getGameFolder(root, 'sub/inner/game.qsp')).toBe(inner);
  });

  it('throws when a folder of the path is missing', () => {
    const root = dir('', dir('other'));
    expect(() => getGameFolder(root, 'sub/game.qsp')).toThrow('Failed to find game file sub/game.qsp in archvive');
  });

  it('does not treat a file as a folder', () => {
    const root = dir('', file('sub'));
    expect(() => getGameFolder(root, 'sub/game.qsp')).toThrow('Failed to find game file sub/game.qsp in archvive');
  });
});
