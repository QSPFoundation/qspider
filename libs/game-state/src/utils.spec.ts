import { readQsp } from '@qsp/converters';
import type { QspListItem, QspObjectItem } from '@qsp/wasm-engine';
import { describe, expect, it } from 'vitest';
import { clamp, convertQsps, isHashPath, prepareContent, prepareList, prepareObjectList } from './utils';

describe('prepareContent', () => {
  it('rewrites a bare &gt in an exec link to QSP "& gt" (intended, keeps "gt \'loc\'" working)', () => {
    expect(prepareContent("exec: x = 1 &gt 'room'")).toBe("exec: x = 1 & gt  'room'");
  });

  it('keeps a proper &gt; entity', () => {
    expect(prepareContent('a &gt; b')).toBe('a &gt; b');
  });

  it('turns a backslash-escaped quote into &quot;', () => {
    expect(prepareContent('<a href=\\"exec: gt \'x\'\\">go</a>')).toBe("<a href=&quot;exec: gt 'x'&quot;>go</a>");
  });
});

describe('prepareList', () => {
  it('prepares the name and normalises the image path', () => {
    const list: QspListItem[] = [
      { name: 'Go &gt room', image: 'img\\go.png' },
      { name: 'Plain', image: '' },
    ];
    expect(prepareList(list)).toEqual([
      { name: 'Go & gt  room', image: 'img/go.png' },
      { name: 'Plain', image: '' },
    ]);
  });
});

describe('prepareObjectList', () => {
  it('prepares name and title and normalises the image path', () => {
    const list: QspObjectItem[] = [{ name: 'Key', image: 'obj\\key.png', title: '<b>\\"Key\\"</b>' }];
    expect(prepareObjectList(list)).toEqual([{ name: 'Key', image: 'obj/key.png', title: '<b>&quot;Key&quot;</b>' }]);
  });
});

describe('clamp', () => {
  it('returns the value inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it('limits to the minimum and maximum', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe('isHashPath', () => {
  it('is true only for a path starting with #', () => {
    expect(isHashPath('#/room')).toBe(true);
    expect(isHashPath('room#x')).toBe(false);
    expect(isHashPath('')).toBe(false);
  });
});

describe('convertQsps', () => {
  it('converts text qsps into binary qsp that reads back', () => {
    const source = new TextEncoder().encode("# start\n'main'\npl 'hi'\n---\n");
    const result = convertQsps(source.buffer as ArrayBuffer);
    const locations = readQsp(result);
    expect(locations).toHaveLength(1);
    expect(locations[0].name).toBe('start');
    expect(locations[0].code).toEqual(["'main'", "pl 'hi'"]);
  });
});
