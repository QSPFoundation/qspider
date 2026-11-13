import type { QspTuple, QspVariableValue } from '@qsp/wasm-engine';
import { describe, expect, it } from 'vitest';
import {
  addWatch,
  changedNames,
  describeChange,
  itemWindow,
  parseWatchList,
  removeWatch,
  serializeWatchList,
  WATCH_ITEM_CAP,
  watchKey,
  type WatchValue,
} from './debug-watch-logic';

const tuple = (items: QspVariableValue[], names?: Array<string | undefined>): QspTuple => {
  const t = [...items] as QspTuple;
  if (names) t.names = names;
  return t;
};

const scalar = (value: QspVariableValue): WatchValue => ({
  value,
  size: value === undefined ? 0 : 1,
  items: value === undefined ? [] : [{ key: undefined, value }],
});

describe('watchKey', () => {
  it('upper-cases the name and keeps the prefix', () => {
    expect(watchKey('gold')).toBe('GOLD');
    expect(watchKey('$who')).toBe('$WHO');
    expect(watchKey('$who')).not.toBe(watchKey('who'));
  });
});

describe('addWatch and removeWatch', () => {
  it('keeps the name upper-cased and deduplicates case-insensitively, the prefix counting', () => {
    expect(addWatch([], 'gold')).toEqual(['GOLD']);
    expect(addWatch(['GOLD'], 'gold')).toEqual(['GOLD']);
    expect(addWatch(['A'], 'a')).toEqual(['A']);
    expect(addWatch(['A'], '$a')).toEqual(['A', '$A']);
  });

  it('ignores a blank name and trims spaces', () => {
    expect(addWatch(['A'], '  ')).toEqual(['A']);
    expect(addWatch([], ' b ')).toEqual(['B']);
  });

  it('removes by the same identity', () => {
    expect(removeWatch(['A', '$A'], 'a')).toEqual(['$A']);
    expect(removeWatch(['A'], 'b')).toEqual(['A']);
  });
});

describe('parseWatchList and serializeWatchList', () => {
  it('round-trips a list', () => {
    const list = ['GOLD', '$WHO', '%REC'];
    expect(parseWatchList(serializeWatchList(list))).toEqual(list);
  });

  it('gives an empty list for missing or garbage input', () => {
    expect(parseWatchList(null)).toEqual([]);
    expect(parseWatchList('')).toEqual([]);
    expect(parseWatchList('{not json')).toEqual([]);
    expect(parseWatchList('{"a":1}')).toEqual([]);
    expect(parseWatchList('[1, "x"]')).toEqual([]);
  });

  it('deduplicates what it reads', () => {
    expect(parseWatchList('["a", "A", "$a"]')).toEqual(['A', '$A']);
  });
});

describe('itemWindow', () => {
  it('caps the item count to read', () => {
    expect(WATCH_ITEM_CAP).toBe(100);
    expect(itemWindow(5000, 100)).toBe(100);
    expect(itemWindow(3, 100)).toBe(3);
    expect(itemWindow(0, 100)).toBe(0);
    expect(itemWindow(-1, 100)).toBe(0);
  });
});

describe('changedNames', () => {
  it('gives nothing for a baseline', () => {
    expect(changedNames(null, { GOLD: scalar(100) })).toEqual([]);
  });

  it('names a changed scalar', () => {
    expect(changedNames({ GOLD: scalar(100), X: scalar(1) }, { GOLD: scalar(70), X: scalar(1) })).toEqual(['GOLD']);
  });

  it('names an array whose later item changed', () => {
    const before: WatchValue = {
      value: 'sword',
      size: 2,
      items: [
        { key: undefined, value: 'sword' },
        { key: 'key', value: 'brass' },
      ],
    };
    const after: WatchValue = { ...before, items: [before.items[0], { key: 'key', value: 'iron' }] };
    expect(changedNames({ $INV: before }, { $INV: after })).toEqual(['$INV']);
  });

  it('names an array that grew', () => {
    const before: WatchValue = { value: 'a', size: 1, items: [{ key: undefined, value: 'a' }] };
    const after: WatchValue = {
      value: 'a',
      size: 2,
      items: [
        { key: undefined, value: 'a' },
        { key: undefined, value: 'b' },
      ],
    };
    expect(changedNames({ $A: before }, { $A: after })).toEqual(['$A']);
  });

  it('keeps an equal tuple unchanged although it is another array', () => {
    const rec = () => scalar(tuple(['Ann', 30], ['NAME', 'AGE']));
    expect(changedNames({ '%REC': rec() }, { '%REC': rec() })).toEqual([]);
  });

  it('names a tuple key that changed', () => {
    const at = (key: QspTuple): WatchValue => ({ value: undefined, size: 1, items: [{ key, value: 'cell' }] });
    expect(changedNames({ $M: at(tuple([1, 2])) }, { $M: at(tuple([1, 2])) })).toEqual([]);
    expect(changedNames({ $M: at(tuple([1, 2])) }, { $M: at(tuple([2, 1])) })).toEqual(['$M']);
  });

  it('treats an entry missing from the previous snapshot as its own baseline', () => {
    expect(changedNames({}, { GOLD: scalar(1) })).toEqual([]);
  });
});

describe('describeChange', () => {
  it('formats the old and new values', () => {
    expect(describeChange('GOLD', scalar(100), scalar(70))).toEqual({ name: 'GOLD', from: '100', to: '70' });
  });

  it('formats a record the QSP way', () => {
    const before = scalar(tuple(['Ann', 30], ['NAME', 'AGE']));
    const after = scalar(tuple(['Ann', 31], ['NAME', 'AGE']));
    expect(describeChange('%REC', before, after)).toEqual({
      name: '%REC',
      from: "[NAME: 'Ann', AGE: 30]",
      to: "[NAME: 'Ann', AGE: 31]",
    });
  });

  it('names the item when only a later item changed', () => {
    const before: WatchValue = {
      value: 'sword',
      size: 2,
      items: [
        { key: undefined, value: 'sword' },
        { key: 'key', value: 'brass' },
      ],
    };
    const after: WatchValue = { ...before, items: [before.items[0], { key: 'key', value: 'iron' }] };
    expect(describeChange('$INV', before, after)).toEqual({ name: "$INV['key']", from: 'brass', to: 'iron' });
  });

  it('names an added item by its index', () => {
    const before: WatchValue = { value: 'a', size: 1, items: [{ key: undefined, value: 'a' }] };
    const after: WatchValue = {
      value: 'a',
      size: 2,
      items: [
        { key: undefined, value: 'a' },
        { key: undefined, value: 'b' },
      ],
    };
    expect(describeChange('$A', before, after)).toEqual({ name: '$A[1]', from: '', to: 'b' });
  });
});
