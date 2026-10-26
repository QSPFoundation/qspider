import { describe, expect, it } from 'vitest';
import { menuPlacement } from './menu-placement';

describe('menuPlacement', () => {
  it('opens a mouse menu at the click coordinates, below and aligned to the start', () => {
    expect(menuPlacement('mouse', undefined, 5, 6, { x: 120, y: 80 })).toEqual({
      triggerStyle: { position: 'fixed', left: 120, top: 80 },
      align: 'start',
      side: 'bottom',
    });
  });

  it('opens a mouse menu at 0, 0 when there was no click', () => {
    expect(menuPlacement('mouse', undefined, 0, 0, {}).triggerStyle).toEqual({ position: 'fixed', left: 0, top: 0 });
  });

  it('ignores show-at for a mouse menu', () => {
    expect(menuPlacement('mouse', 'right bottom', 5, 6, { x: 1, y: 2 })).toEqual({
      triggerStyle: { position: 'fixed', left: 1, top: 2 },
      align: 'start',
      side: 'bottom',
    });
  });

  it('defaults a fixed menu to the left top corner with the offsets', () => {
    expect(menuPlacement('fixed', undefined, 10, 20, {})).toEqual({
      triggerStyle: { position: 'fixed', left: 10, top: 20 },
      align: 'start',
      side: 'bottom',
    });
  });

  it('places a fixed menu at the right bottom corner, aligned to the end and opening upwards', () => {
    expect(menuPlacement('fixed', 'right bottom', 10, 20, {})).toEqual({
      triggerStyle: { position: 'fixed', right: 10, bottom: 20 },
      align: 'end',
      side: 'top',
    });
  });

  it('centres a fixed menu, shifting by the offsets', () => {
    expect(menuPlacement('fixed', 'center center', 10, 20, {})).toEqual({
      triggerStyle: { position: 'fixed', left: 'calc(50% - 10px)', top: 'calc(50% - 20px)' },
      align: 'center',
      side: 'left',
    });
  });

  it('leaves an axis unset when its word is unknown', () => {
    expect(menuPlacement('fixed', 'middle top', 10, 20, {})).toEqual({
      triggerStyle: { position: 'fixed', top: 20 },
      align: 'start',
      side: 'bottom',
    });
  });
});
