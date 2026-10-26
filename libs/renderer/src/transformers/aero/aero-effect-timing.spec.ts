import { describe, expect, it } from 'vitest';
import { aeroEffectConfig, aeroStepDuration } from './aero-effect-timing';

describe('aeroEffectConfig', () => {
  it('finds the transition of a named effect', () => {
    expect(aeroEffectConfig('fade')).toEqual({
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
    });
  });

  it('gives no effect for an empty name', () => {
    expect(aeroEffectConfig('')).toEqual({});
  });

  it('gives no effect for a name the theme does not know', () => {
    expect(aeroEffectConfig('swirl')).toEqual({});
  });
});

describe('aeroStepDuration', () => {
  it('keeps the whole time for a single-step effect', () => {
    expect(aeroStepDuration(500, aeroEffectConfig('fade'))).toBe(500);
  });

  it('splits the time between the steps of a multi-step effect', () => {
    expect(aeroStepDuration(900, aeroEffectConfig('quake'))).toBe(100);
  });

  it('keeps the whole time when there is no effect', () => {
    expect(aeroStepDuration(500, aeroEffectConfig('swirl'))).toBe(500);
  });
});
