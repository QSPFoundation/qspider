import { describe, expect, it } from 'vitest';
import { breakpointsAfterToggle, describeBreakpoints } from './line-breakpoints';

describe('breakpointsAfterToggle', () => {
  it('adds an enabled breakpoint to a line without one', () => {
    expect(breakpointsAfterToggle({ enabled: [5], disabled: [] }, 3)).toEqual({ enabled: [3, 5], disabled: [] });
  });

  it('disables an enabled breakpoint and enables a disabled one', () => {
    expect(breakpointsAfterToggle({ enabled: [3], disabled: [7] }, 3)).toEqual({ enabled: [], disabled: [3, 7] });
    expect(breakpointsAfterToggle({ enabled: [], disabled: [3] }, 3)).toEqual({ enabled: [3], disabled: [] });
  });
});

describe('describeBreakpoints', () => {
  it('lists enabled and disabled lines in order', () => {
    expect(describeBreakpoints({ enabled: [3, 1], disabled: [5] })).toBe('enabled 1, 3; disabled 5');
  });

  it('says none when there is none', () => {
    expect(describeBreakpoints({ enabled: [], disabled: [] })).toBe('none');
  });
});
