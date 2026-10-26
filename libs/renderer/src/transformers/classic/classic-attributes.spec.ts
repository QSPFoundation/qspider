import { describe, expect, it } from 'vitest';
import { dockAttributes, elementChildren, paneAttributes, tableDimensions } from './classic-attributes';

describe('tableDimensions', () => {
  it('defaults to border 0, cellspacing 0 and cellpadding 1', () => {
    expect(tableDimensions({})).toEqual({ border: 0, cellspacing: 0, cellpadding: 1 });
  });

  it('reads the written numbers', () => {
    expect(tableDimensions({ border: '2', cellspacing: '3', cellpadding: '4' })).toEqual({
      border: 2,
      cellspacing: 3,
      cellpadding: 4,
    });
  });

  it('defaults only the attributes that are missing', () => {
    expect(tableDimensions({ border: '1' })).toEqual({ border: 1, cellspacing: 0, cellpadding: 1 });
  });
});

describe('elementChildren', () => {
  it('drops the whitespace text between table rows', () => {
    expect(elementChildren(['\n  ', { tag: 'tr' }, '\n', { tag: 'tr' }])).toEqual([{ tag: 'tr' }, { tag: 'tr' }]);
  });

  it('keeps nothing when only text is left', () => {
    expect(elementChildren(['a', 'b'])).toEqual([]);
  });
});

describe('dockAttributes', () => {
  it('defaults to the centre with size 0', () => {
    expect(dockAttributes(null, null, null)).toEqual({ place: 'center', visibility: null, size: 0 });
  });

  it('reads place, visibility and size', () => {
    expect(dockAttributes('left', 'objects|actions', '200')).toEqual({
      place: 'left',
      visibility: 'objects|actions',
      size: 200,
    });
  });

  it('defaults an empty place to the centre', () => {
    expect(dockAttributes('', null, null).place).toBe('center');
  });
});

describe('paneAttributes', () => {
  it('defaults to proportion 1', () => {
    expect(paneAttributes(null, null)).toEqual({ visibility: null, proportion: 1 });
  });

  it('reads visibility and a fractional proportion', () => {
    expect(paneAttributes('stats', '0.5')).toEqual({ visibility: 'stats', proportion: 0.5 });
  });
});
