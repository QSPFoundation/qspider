import type { QspTuple, QspVariableValue } from '@qsp/wasm-engine';
import { describe, expect, it } from 'vitest';
import {
  addWatch,
  afterRunMode,
  changedNames,
  describeChange,
  indexText,
  itemWindow,
  parseWatchList,
  removeWatch,
  serializeWatchList,
  showValue,
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

  it('gives equivalent paths one canonical key', () => {
    const key = watchKey("a[ 'k' ].b");
    expect(key).toBe("A['K'].B");
    expect(watchKey('A["K"].B')).toBe(key);
    expect(watchKey("a['K'].B")).toBe(key);
  });

  it('is empty for text that is not a variable, item or field', () => {
    expect(watchKey('a[i]')).toBe('');
    expect(watchKey('')).toBe('');
  });
});

describe('addWatch and removeWatch', () => {
  it('ignores an entry that is not a path', () => {
    const list = ['A'];
    expect(addWatch(list, 'a[i]')).toBe(list);
  });

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

  it('drops stored entries that are not paths and keeps bare names', () => {
    expect(parseWatchList('["gold","a[i]"]')).toEqual(['GOLD']);
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

describe('afterRunMode', () => {
  it('consumes the change baseline only when the engine is neither held at a stop nor waiting inside a run', () => {
    expect(afterRunMode({ stopHeld: false, dialogPending: false })).toBe('consume');
  });

  it('only refreshes the shown values while a dialog or WAIT is pending inside a run', () => {
    expect(afterRunMode({ stopHeld: false, dialogPending: true })).toBe('display');
  });

  it('ignores a report while a debug stop is held', () => {
    expect(afterRunMode({ stopHeld: true, dialogPending: false })).toBe('ignore');
    expect(afterRunMode({ stopHeld: true, dialogPending: true })).toBe('ignore');
  });
});

describe('describeChange', () => {
  it('names a path entry by its path', () => {
    expect(describeChange("A['K'].B", scalar(1), scalar(2))).toEqual({ name: "A['K'].B", from: '1', to: '2' });
  });

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
    expect(describeChange('$INV', before, after)).toEqual({ name: "$INV['key']", from: "'brass'", to: "'iron'" });
  });

  it('describes a size change past the item cap', () => {
    const items = Array.from({ length: WATCH_ITEM_CAP }, (_, i) => ({ key: undefined, value: i }));
    const before: WatchValue = { value: 0, size: 120, items };
    const after: WatchValue = { value: 0, size: 121, items };
    expect(describeChange('$A', before, after)).toEqual({ name: '$A', from: '120 items', to: '121 items' });
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
    expect(describeChange('$A', before, after)).toEqual({ name: '$A[1]', from: '(empty)', to: "'b'" });
  });
});

describe('showValue', () => {
  it('quotes strings, doubling a quote', () => {
    expect(showValue('Ann')).toBe("'Ann'");
    expect(showValue("it's")).toBe("'it''s'");
    expect(showValue('')).toBe("''");
  });

  it('leaves numbers bare and says an unset value is empty', () => {
    expect(showValue(70)).toBe('70');
    expect(showValue(undefined)).toBe('(empty)');
  });
});

describe('indexText', () => {
  it('prints a long tuple key in full', () => {
    expect(indexText(tuple([1, 2, 3, 4, 5, 6, 7]), 0)).toBe('1, 2, 3, 4, 5, 6, 7');
  });
});
