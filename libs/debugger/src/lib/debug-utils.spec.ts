import { describe, expect, it } from 'vitest';
import { decodePanelBitmask, formatEventArgs, formatListItems } from './debug-utils';

describe('decodePanelBitmask', () => {
  it('reports an empty mask as unknown', () => {
    expect(decodePanelBitmask(0)).toBe('Unknown(0)');
  });

  it('names a single panel bit', () => {
    expect(decodePanelBitmask(4)).toBe('ACTS');
  });

  it('joins several panel bits in ascending bit order', () => {
    expect(decodePanelBitmask(1 | 8 | 32)).toBe('MAIN | OBJS | VIEW');
  });

  it('reports a mask with only unknown bits as unknown', () => {
    expect(decodePanelBitmask(64)).toBe('Unknown(64)');
  });

  it('ignores unknown bits next to known ones', () => {
    expect(decodePanelBitmask(64 | 2)).toBe('VARS');
  });
});

describe('formatListItems', () => {
  it('formats an empty list as brackets', () => {
    expect(formatListItems([])).toBe('[]');
  });

  it('formats a non-array as brackets', () => {
    expect(formatListItems(undefined as unknown as unknown[])).toBe('[]');
  });

  it('formats plain values as JSON with their index', () => {
    expect(formatListItems(['a', 2, null])).toBe('[\n  0: "a",\n  1: 2,\n  2: null\n]');
  });

  it('formats a named object with its name quoted', () => {
    expect(formatListItems([{ name: 'Sword' }])).toBe('[\n  0: "Sword"\n]');
  });

  it('adds a title only when it differs from the name', () => {
    expect(
      formatListItems([
        { name: 'Sword', title: 'Rusty blade' },
        { name: 'Shield', title: 'Shield' },
      ]),
    ).toBe('[\n  0: "Sword" (Rusty blade),\n  1: "Shield"\n]');
  });

  it('adds the image after the title', () => {
    expect(formatListItems([{ name: 'Key', title: 'Old key', image: 'img/key.png' }])).toBe(
      '[\n  0: "Key" (Old key) [img: img/key.png]\n]',
    );
  });

  it('serialises an object without a name as JSON', () => {
    expect(formatListItems([{ id: 1 }])).toBe('[\n  0: {"id":1}\n]');
  });

  it('lists every item of a long list without truncating', () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ name: `item${i}` }));
    const lines = formatListItems(items).split('\n');
    expect(lines).toHaveLength(52);
    expect(lines[50]).toBe('  49: "item49"');
  });
});

describe('formatEventArgs', () => {
  it('maps args to the signature names of a known event', () => {
    expect(formatEventArgs('open_game', ['game.qsp', true])).toEqual([
      { name: 'path', value: '"game.qsp"' },
      { name: 'isNewGame', value: 'true' },
    ]);
  });

  it('names args of an unknown event by position', () => {
    expect(formatEventArgs('custom', [1, 'x'])).toEqual([
      { name: 'arg0', value: '1' },
      { name: 'arg1', value: '"x"' },
    ]);
  });

  it('names args beyond the signature by position', () => {
    expect(formatEventArgs('msg', ['hi', 5])).toEqual([
      { name: 'text', value: '"hi"' },
      { name: 'arg1', value: '5' },
    ]);
  });

  it('returns only the given args when fewer than the signature', () => {
    expect(formatEventArgs('play_file', ['a.mp3'])).toEqual([{ name: 'path', value: '"a.mp3"' }]);
  });

  it('returns nothing for no args', () => {
    expect(formatEventArgs('msg', [])).toEqual([]);
  });

  it('decodes the panel type of panel_visibility', () => {
    expect(formatEventArgs('panel_visibility', [3, false])).toEqual([
      { name: 'type', value: 'MAIN | VARS' },
      { name: 'isShown', value: 'false' },
    ]);
  });

  it('formats actions and objects arrays as lists', () => {
    expect(formatEventArgs('actions_changed', [[{ name: 'Go' }]])).toEqual([
      { name: 'actions', value: '[\n  0: "Go"\n]' },
    ]);
    expect(formatEventArgs('objects_changed', [[]])).toEqual([{ name: 'objects', value: '[]' }]);
  });

  it('formats menu items as a list and a non-array as a string', () => {
    expect(formatEventArgs('menu', [[{ name: 'A' }]])).toEqual([{ name: 'items', value: '[\n  0: "A"\n]' }]);
    expect(formatEventArgs('menu', [undefined])).toEqual([{ name: 'items', value: 'undefined' }]);
  });

  it('formats primitives, null, functions, arrays and objects', () => {
    const fn = () => 1;
    expect(formatEventArgs('custom', [null, undefined, fn, [1, 2], { a: 1 }, Symbol.for('s')])).toEqual([
      { name: 'arg0', value: 'null' },
      { name: 'arg1', value: 'undefined' },
      { name: 'arg2', value: '[Function]' },
      { name: 'arg3', value: '[2 items]' },
      { name: 'arg4', value: '{"a":1}' },
      { name: 'arg5', value: 'Symbol(s)' },
    ]);
  });

  it('falls back to a placeholder for an object that cannot be serialised', () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(formatEventArgs('custom', [cyclic])).toEqual([{ name: 'arg0', value: '[Complex Object]' }]);
  });
});
