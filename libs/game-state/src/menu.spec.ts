import { beforeEach, describe, expect, it } from 'vitest';
import type { QspListItem } from '@qsp/wasm-engine';
import { isPaused$, resetCounterPauses } from './counter-pauses';
import { menu$ } from './menu';

isPaused$.subscribe(() => undefined);

const ITEMS: QspListItem[] = [
  { name: 'First item', image: '' },
  { name: 'Second item', image: 'icons/second.png' },
];
const SUBMENU: QspListItem[] = [{ name: 'Sub item', image: '' }];

const initial = menu$.value;

/** A plain callback that records every index it gets. */
function recorder(): { calls: number[]; onselect: (index: number) => void } {
  const calls: number[] = [];
  return { calls, onselect: (index) => calls.push(index) };
}

beforeEach(() => {
  menu$.set(initial);
  resetCounterPauses();
});

describe('menu$', () => {
  it('opens with its items and pauses the counter', () => {
    const { onselect } = recorder();
    menu$.actions.open(ITEMS, onselect);
    expect(menu$.value).toEqual({ isOpen: true, items: ITEMS, onselect });
    expect(isPaused$.value).toBe(true);
  });

  it('passes the selected index, closes and resumes the counter', () => {
    const { calls, onselect } = recorder();
    menu$.actions.open(ITEMS, onselect);
    menu$.actions.select(1);
    expect(calls).toEqual([1]);
    expect(menu$.value.isOpen).toBe(false);
    expect(isPaused$.value).toBe(false);
  });

  it('passes -1 when closed without a choice', () => {
    const { calls, onselect } = recorder();
    menu$.actions.open(ITEMS, onselect);
    menu$.actions.close();
    expect(calls).toEqual([-1]);
    expect(menu$.value.isOpen).toBe(false);
    expect(isPaused$.value).toBe(false);
  });

  it('answers the engine once when select and close both arrive', () => {
    const { calls, onselect } = recorder();
    menu$.actions.open(ITEMS, onselect);
    menu$.actions.select(0);
    menu$.actions.close();
    menu$.actions.select(1);
    expect(calls).toEqual([0]);
  });

  it('ignores select and close while closed', () => {
    menu$.actions.select(0);
    menu$.actions.close();
    expect(menu$.value).toEqual({ isOpen: false, items: [], onselect: null });
  });

  it('answers -1 on clear and empties the menu', () => {
    const { calls, onselect } = recorder();
    menu$.actions.open(ITEMS, onselect);
    menu$.actions.clear();
    expect(calls).toEqual([-1]);
    expect(menu$.value).toEqual({ isOpen: false, items: [], onselect: null });
    expect(isPaused$.value).toBe(false);
  });

  it('does not call back on clear when closed', () => {
    const { calls, onselect } = recorder();
    menu$.actions.open(ITEMS, onselect);
    menu$.actions.select(0);
    menu$.actions.clear();
    expect(calls).toEqual([0]);
  });

  describe('a menu opened from its own callback (D18)', () => {
    const second = recorder();
    const openSubmenu = (): void => menu$.actions.open(SUBMENU, second.onselect);

    beforeEach(() => {
      second.calls.length = 0;
    });

    it('keeps the new menu and its handler after select', () => {
      menu$.actions.open(ITEMS, openSubmenu);
      menu$.actions.select(0);
      expect(menu$.value.isOpen).toBe(true);
      expect(menu$.value.items).toEqual(SUBMENU);
      expect(isPaused$.value).toBe(true);
      menu$.actions.select(0);
      expect(second.calls).toEqual([0]);
    });

    it('keeps the new menu and its handler after close', () => {
      menu$.actions.open(ITEMS, openSubmenu);
      menu$.actions.close();
      expect(menu$.value.items).toEqual(SUBMENU);
      menu$.actions.select(0);
      expect(second.calls).toEqual([0]);
    });

    it('keeps the new menu and its handler after clear', () => {
      menu$.actions.open(ITEMS, openSubmenu);
      menu$.actions.clear();
      expect(menu$.value.isOpen).toBe(true);
      expect(menu$.value.items).toEqual(SUBMENU);
      expect(isPaused$.value).toBe(true);
      menu$.actions.select(0);
      expect(second.calls).toEqual([0]);
    });
  });
});
