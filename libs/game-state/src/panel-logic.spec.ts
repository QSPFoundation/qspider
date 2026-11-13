import { beforeEach, describe, expect, it } from 'vitest';
import { isActionIndex, NO_ACTION, selectedAction$, view$ } from './panel-logic';

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
