import { describe, expect, it } from 'vitest';
import { menuEntries } from './menu-entries';

describe('menuEntries', () => {
  it('numbers the items from 1', () => {
    expect(menuEntries([{ name: ['Go north'] }, { name: ['Go south'] }])).toEqual([
      { separator: false, displayIndex: 1 },
      { separator: false, displayIndex: 2 },
    ]);
  });

  it('marks a "-" item as a separator and skips it in the numbering', () => {
    expect(menuEntries([{ name: ['Look'] }, { name: ['-'] }, { name: ['Leave'] }])).toEqual([
      { separator: false, displayIndex: 1 },
      { separator: true },
      { separator: false, displayIndex: 2 },
    ]);
  });

  it('does not treat an item that only starts with a dash as a separator', () => {
    expect(menuEntries([{ name: ['-1 gold'] }])).toEqual([{ separator: false, displayIndex: 1 }]);
  });

  it('returns nothing for an empty menu', () => {
    expect(menuEntries([])).toEqual([]);
  });
});
