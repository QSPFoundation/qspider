import { describe, expect, it } from 'vitest';
import { mainScrollStep, statsScrollStep } from './scroll-step';

describe('mainScrollStep', () => {
  it('resets to -1 on a new location', () => {
    expect(mainScrollStep(true, 4)).toBe(-1);
  });

  it('counts up from 0 when the step is still -1 after a reset', () => {
    expect(mainScrollStep(false, -1)).toBe(1);
  });

  it('counts up from the current step', () => {
    expect(mainScrollStep(false, 3)).toBe(4);
  });
});

describe('statsScrollStep', () => {
  it('counts up when the new stats extend the previous ones', () => {
    expect(statsScrollStep('HP: 10\n', 'HP: 10\nMP: 5\n', 2)).toBe(3);
  });

  it('counts up from 0 when the step was reset', () => {
    expect(statsScrollStep('HP: 10\n', 'HP: 10\nMP: 5\n', -1)).toBe(1);
  });

  it('resets to -1 when the stats are replaced', () => {
    expect(statsScrollStep('HP: 10\n', 'HP: 9\n', 2)).toBe(-1);
  });

  it('resets to -1 when the stats did not change', () => {
    expect(statsScrollStep('HP: 10\n', 'HP: 10\n', 2)).toBe(-1);
  });

  it('resets to -1 for the first stats, with nothing before them', () => {
    expect(statsScrollStep(undefined, 'HP: 10\n', 0)).toBe(-1);
  });

  it('resets to -1 when the previous stats were empty', () => {
    expect(statsScrollStep('', 'HP: 10\n', 0)).toBe(-1);
  });
});
