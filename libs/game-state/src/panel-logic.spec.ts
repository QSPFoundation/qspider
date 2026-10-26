import { beforeEach, describe, expect, it } from 'vitest';
import {
  isActionIndex,
  layerFlag,
  NO_ACTION,
  readAll,
  regionText,
  selectedAction$,
  view$,
  withLayer,
} from './panel-logic';

describe('isActionIndex', () => {
  it('accepts the indexes of the actions and nothing else', () => {
    expect(isActionIndex(0, 3)).toBe(true);
    expect(isActionIndex(2, 3)).toBe(true);
    expect(isActionIndex(3, 3)).toBe(false);
    expect(isActionIndex(-1, 3)).toBe(false);
  });

  it('accepts no index when there are no actions', () => {
    expect(isActionIndex(0, 0)).toBe(false);
  });
});

describe('layerFlag', () => {
  it('shows a layer the game set to anything but 0', () => {
    expect(layerFlag(1)).toBe(true);
    expect(layerFlag(-1)).toBe(true);
    expect(layerFlag('x')).toBe(true);
  });

  it('hides a layer the game set to 0 or never set', () => {
    expect(layerFlag(0)).toBe(false);
    expect(layerFlag(undefined)).toBe(false);
    expect(layerFlag(null)).toBe(false);
  });
});

describe('regionText', () => {
  it('is the text the game keeps, or empty when it keeps none', () => {
    expect(regionText('<b>hi</b>')).toBe('<b>hi</b>');
    expect(regionText('')).toBe('');
    expect(regionText(undefined)).toBe('');
    expect(regionText(null)).toBe('');
  });
});

describe('readAll', () => {
  it('reads every name once into a record', () => {
    const read: string[] = [];
    const state = readAll(['top', 'side'], (name) => {
      read.push(name);
      return name.length;
    });
    expect(state).toEqual({ top: 3, side: 4 });
    expect(read).toEqual(['top', 'side']);
  });

  it('is empty for no names', () => {
    expect(readAll([], () => 1)).toEqual({});
  });
});

describe('view$', () => {
  beforeEach(() => {
    view$.actions.clear();
  });

  it('starts closed, with no path and not modal', () => {
    expect(view$.value).toEqual({ isOpen: false, path: '', isModal: false });
  });

  it('opens a path', () => {
    view$.actions.open('pic.png');
    expect(view$.value).toEqual({ isOpen: true, path: 'pic.png', isModal: false });
  });

  it('opens with the modal flag set before it', () => {
    view$.actions.setIsModal(true);
    view$.actions.open('pic.png');
    expect(view$.value).toEqual({ isOpen: true, path: 'pic.png', isModal: true });
  });

  it('closes but keeps the path and the modal flag', () => {
    view$.actions.setIsModal(true);
    view$.actions.open('pic.png');
    view$.actions.close();
    expect(view$.value).toEqual({ isOpen: false, path: 'pic.png', isModal: true });
  });

  it('keeps the previous modal flag when it opens again', () => {
    view$.actions.setIsModal(true);
    view$.actions.open('a.png');
    view$.actions.close();
    view$.actions.open('b.png');
    expect(view$.value).toEqual({ isOpen: true, path: 'b.png', isModal: true });
  });

  it('clears everything, the modal flag too', () => {
    view$.actions.setIsModal(true);
    view$.actions.open('pic.png');
    view$.actions.clear();
    expect(view$.value).toEqual({ isOpen: false, path: '', isModal: false });
  });
});

describe('selectedAction$', () => {
  it('starts with no action selected', () => {
    expect(selectedAction$.value).toBe(NO_ACTION);
    expect(NO_ACTION).toBe(-1);
  });
});

describe('withLayer', () => {
  it('adds a layer and keeps the others', () => {
    expect(withLayer({ a: true }, 'b', false)).toEqual({ a: true, b: false });
  });

  it('replaces the flag of a registered layer without touching the original', () => {
    const layers = { a: false };
    expect(withLayer(layers, 'a', true)).toEqual({ a: true });
    expect(layers).toEqual({ a: false });
  });
});
