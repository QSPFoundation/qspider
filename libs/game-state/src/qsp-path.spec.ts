import type { QspTuple } from '@qsp/wasm-engine';
import { describe, expect, it } from 'vitest';
import { QSP_NAME } from './debug-hover-logic';
import { formatQspPath, parseQspPath, walkFields } from './qsp-path';
import { applyTypePrefix } from './variable-logic';

function record(entries: Array<[string, unknown]>): QspTuple {
  const tuple = entries.map(([, v]) => v) as QspTuple;
  tuple.names = entries.map(([n]) => n);
  return tuple;
}

describe('parseQspPath', () => {
  it('reads a name, a literal index and fields', () => {
    expect(parseQspPath("a['k'].b")).toEqual({ name: 'A', index: 'k', fields: [{ name: 'B' }] });
  });

  it('reads a tuple key', () => {
    expect(parseQspPath('$a[1, "x"]')).toEqual({ name: '$A', index: [1, 'x'], fields: [] });
  });

  it('reads a negative number key', () => {
    expect(parseQspPath('a[-1]')).toEqual({ name: 'A', index: -1, fields: [] });
  });

  it('reads prefixed and quoted fields, upper-casing names', () => {
    expect(parseQspPath("a.$name.'some Field'")).toEqual({
      name: 'A',
      fields: [{ name: 'NAME', prefix: '$' }, { name: 'SOME FIELD' }],
    });
  });

  it('reads a Cyrillic name', () => {
    expect(parseQspPath('ПЕРЕМЕННАЯ')).toEqual({ name: 'ПЕРЕМЕННАЯ', fields: [] });
  });

  it.each(['a[i].b', 'a[i + 1]', "a.'x<<y>>'", '1a', '', 'a[]', 'a.', 'a[1', "a['x"])('rejects %j', (text) => {
    expect(parseQspPath(text)).toBeNull();
  });
});

describe('formatQspPath', () => {
  it('writes one canonical text', () => {
    expect(formatQspPath(parseQspPath("a[ 'k' ].b")!)).toBe("A['K'].B");
    expect(formatQspPath(parseQspPath('A["K"].B')!)).toBe("A['K'].B");
  });

  it('doubles quotes inside keys', () => {
    expect(formatQspPath(parseQspPath("a['it''s']")!)).toBe("A['IT''S']");
  });

  it('writes tuple keys, numbers and quoted fields', () => {
    expect(formatQspPath(parseQspPath('a[1,"x"]')!)).toBe("A[1, 'X']");
    expect(formatQspPath(parseQspPath('a[-3]')!)).toBe('A[-3]');
    expect(formatQspPath(parseQspPath("a.$'some Field'")!)).toBe("A.$'SOME FIELD'");
  });

  it.each(["a['k'].b", '$a[1, "x"]', "a.$name.'some Field'", 'ПЕРЕМЕННАЯ', "a['it''s']", "a.'1'", 'a[-1].b.c'])(
    'round trips %j through the parser',
    (text) => {
      const path = parseQspPath(text)!;
      const formatted = formatQspPath(path);
      const again = parseQspPath(formatted);
      expect(again).not.toBeNull();
      expect(formatQspPath(again!)).toBe(formatted);
    },
  );
});

describe('walkFields', () => {
  const rec = record([['B', record([['C', 42]])]]);

  it('follows fields by upper-cased name', () => {
    expect(walkFields(rec, [{ name: 'B' }, { name: 'C' }])).toBe(42);
    expect(walkFields(record([['x', 1]]), [{ name: 'X' }])).toBe(1);
  });

  it('is undefined for a missing field or a non-tuple step', () => {
    expect(walkFields(rec, [{ name: 'Z' }])).toBeUndefined();
    expect(walkFields(5, [{ name: 'B' }])).toBeUndefined();
    expect(walkFields(rec, [{ name: 'B' }, { name: 'C' }, { name: 'D' }])).toBeUndefined();
  });

  it('returns the value itself for no fields', () => {
    expect(walkFields(5, [])).toBe(5);
  });
});

describe('applyTypePrefix', () => {
  it('turns a mismatched prefix into the empty value of that type', () => {
    expect(applyTypePrefix('$', 5)).toBe('');
    expect(applyTypePrefix('#', 'x')).toBe(0);
    expect(applyTypePrefix('%', 1)).toEqual([]);
  });

  it('keeps a matching or absent prefix', () => {
    expect(applyTypePrefix(undefined, 1)).toBe(1);
    expect(applyTypePrefix('$', 'x')).toBe('x');
  });
});

describe('QSP_NAME', () => {
  it('accepts names, with an optional prefix', () => {
    for (const name of ['ПЕРЕМЕННАЯ', '$ИМЯ', 'A_B']) expect(QSP_NAME.test(name)).toBe(true);
  });

  it('rejects a leading digit, a dot and a space', () => {
    for (const name of ['1A', 'A.B', 'A B']) expect(QSP_NAME.test(name)).toBe(false);
  });
});
