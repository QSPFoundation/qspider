import type { QspTuple, QspVariableValue } from '@qsp/wasm-engine';
import { describe, expect, it } from 'vitest';
import { describeHover, describeSummary, hoverCodeBlock, hoverReadPlan, type HoverPlan } from './debug-hover-logic';

const tuple = (items: QspVariableValue[], names?: Array<string | undefined>): QspTuple => {
  const t = [...items] as QspTuple;
  if (names) t.names = names;
  return t;
};

const isKeyword = (word: string) => ['if', 'set', 'pl'].includes(word.toLowerCase());
const plan = (token: string, indexText?: string): HoverPlan => hoverReadPlan(token, indexText, isKeyword);

describe('hoverReadPlan', () => {
  it('reads the value of a name as written, with or without a prefix', () => {
    for (const name of ['GOLD', '$WHO', '#U', '%REC']) expect(plan(name)).toEqual({ kind: 'value', name });
  });

  it('gives none for a keyword', () => {
    expect(plan('IF')).toEqual({ kind: 'none' });
    expect(plan('pl', '1')).toEqual({ kind: 'none' });
  });

  it('keeps a prefixed word that looks like a keyword', () => {
    expect(plan('$IF')).toEqual({ kind: 'value', name: '$IF' });
  });

  it('reads a numeric item for a number literal', () => {
    expect(plan('$A', '0')).toEqual({ kind: 'item', name: '$A', key: 0 });
    expect(plan('$A', ' 12 ')).toEqual({ kind: 'item', name: '$A', key: 12 });
    expect(plan('$A', '-1')).toEqual({ kind: 'item', name: '$A', key: -1 });
  });

  it('reads a string item for a quoted string, undoing the doubled quote', () => {
    expect(plan('$A', "'key'")).toEqual({ kind: 'item', name: '$A', key: 'key' });
    expect(plan('$A', "'it''s'")).toEqual({ kind: 'item', name: '$A', key: "it's" });
    expect(plan('$A', '"k"')).toEqual({ kind: 'item', name: '$A', key: 'k' });
    expect(plan('$A', "''")).toEqual({ kind: 'item', name: '$A', key: '' });
  });

  it('reads a tuple key for comma-separated literals, keeping a comma inside a string', () => {
    expect(plan('$M', "1, 'x'")).toEqual({ kind: 'item', name: '$M', key: [1, 'x'] });
    expect(plan('$M', "'a,b', 2")).toEqual({ kind: 'item', name: '$M', key: ['a,b', 2] });
  });

  it('reads the index variable first for a single plain name', () => {
    expect(plan('$A', 'i')).toEqual({ kind: 'itemByVar', name: '$A', indexName: 'i' });
    expect(plan('$A', ' $k ')).toEqual({ kind: 'itemByVar', name: '$A', indexName: '$k' });
  });

  it('gives the summary for any other expression', () => {
    for (const text of ['i + 1', 'rand(1, 2)', '1, i', "'a' + 'b'", '', "'open", 'if', '1.5.2'])
      expect(plan('$A', text)).toEqual({ kind: 'summary', name: '$A' });
  });

  it('gives the summary for an array alone with a bare [] (append)', () => {
    expect(plan('A', '')).toEqual({ kind: 'summary', name: 'A' });
  });
});

describe('describeHover', () => {
  it('says a variable that was never set is not set', () => {
    expect(describeHover('FOO', undefined, undefined, 0)).toEqual(['FOO — not set']);
  });

  it('shows the typed value, a string quoted', () => {
    expect(describeHover('GOLD', 100, 100, 1)).toEqual(['GOLD = 100']);
    expect(describeHover('$WHO', 'Ann', 'Ann', 1)).toEqual(["$WHO = 'Ann'"]);
  });

  it('shows a record with its field names', () => {
    const rec = tuple(['Ann', 30], ['NAME', 'AGE']);
    expect(describeHover('%REC', rec, rec, 1)).toEqual(["%REC = [NAME: 'Ann', AGE: 30]"]);
  });

  it('truncates a long tuple', () => {
    const long = tuple(Array.from({ length: 12 }, (_, i) => i));
    const [line] = describeHover('%T', long, long, 1);
    expect(line).toBe('%T = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, …] (12 items)');
  });

  it('says what is stored when a prefix hides it', () => {
    expect(describeHover('#U', 0, '42', 1)).toEqual(['#U = 0', "stored value is a string: '42'"]);
    expect(describeHover('$N', '', 5, 1)).toEqual(["$N = ''", 'stored value is a number: 5']);
    const t = tuple([1, 2]);
    expect(describeHover('$T', '', t, 1)).toEqual(["$T = ''", 'stored value is a tuple: [1, 2]']);
  });

  it('is not a mismatch when the stored value equals the typed one', () => {
    const t = tuple([1, 2]);
    expect(describeHover('%T', tuple([1, 2]), t, 1)).toHaveLength(1);
  });

  it('is still a value when the cell is empty but the array has items', () => {
    expect(describeHover('A', undefined, undefined, 3)).toEqual(['A = (empty)']);
  });
});

describe('describeSummary', () => {
  it('lists the count and the first items with their keys', () => {
    expect(
      describeSummary('$A', 3, [
        { key: undefined, value: 'x' },
        { key: 'k', value: 'y' },
        { key: tuple([1, 2]), value: 'z' },
      ]),
    ).toEqual(['$A — 3 items', "[0] → 'x'", "['k'] → 'y'", "[1, 2] → 'z'"]);
  });

  it('says a variable with no items is not set', () => {
    expect(describeSummary('A', 0, [])).toEqual(['A — not set']);
  });

  it('marks that more items exist than shown', () => {
    expect(describeSummary('A', 9, [{ key: undefined, value: 1 }])).toEqual(['A — 9 items', '[0] → 1', '…']);
  });
});

describe('hoverCodeBlock', () => {
  it('wraps the lines in a fence, one per line', () => {
    expect(hoverCodeBlock(['A = 1', 'B = 2'])).toBe('```\nA = 1\nB = 2\n```');
  });

  it('uses a fence longer than any backtick run in the text', () => {
    const block = hoverCodeBlock(["$A = 'a``[x](command:foo)'"]);
    expect(block.startsWith('```\n')).toBe(true);
    const long = hoverCodeBlock(['x ```` y']);
    expect(long).toBe('`````\nx ```` y\n`````');
  });

  it('collapses a blank line and other line breaks inside a value', () => {
    const block = hoverCodeBlock(["$A = 'a\n\nb\r\nc'"]);
    expect(block).toBe("```\n$A = 'a  b c'\n```");
  });

  it('leaves link and HTML text inside the block as plain lines', () => {
    const lines = hoverCodeBlock(["$A = '[x](command:foo) <img src=x>'"]).split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe("$A = '[x](command:foo) <img src=x>'");
  });
});
