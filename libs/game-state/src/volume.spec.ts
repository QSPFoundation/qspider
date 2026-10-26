import { describe, expect, it } from 'vitest';
import { getFileKey, normalizeVolume, stepVolume } from './volume';

describe('normalizeVolume', () => {
  // D14: the engine and the player both give 0..100, so 1 is one percent, not full volume.
  it('maps 1 to one percent', () => {
    expect(normalizeVolume(1)).toBe(0.01);
  });

  it('maps 0 to silence', () => {
    expect(normalizeVolume(0)).toBe(0);
  });

  it('maps 100 to full volume', () => {
    expect(normalizeVolume(100)).toBe(1);
  });

  it('maps 50 to half', () => {
    expect(normalizeVolume(50)).toBe(0.5);
  });
});

describe('stepVolume', () => {
  it('steps by ten', () => {
    expect(stepVolume(50, 1)).toBe(60);
    expect(stepVolume(50, -1)).toBe(40);
  });

  it('stops at 100', () => {
    expect(stepVolume(95, 1)).toBe(100);
    expect(stepVolume(100, 1)).toBe(100);
  });

  it('stops at 0', () => {
    expect(stepVolume(5, -1)).toBe(0);
    expect(stepVolume(0, -1)).toBe(0);
  });
});

describe('getFileKey', () => {
  it('is the same for backslashes, forward slashes and any case', () => {
    expect(getFileKey('snd\\B.wav')).toBe(getFileKey('SND/b.WAV'));
  });

  it('is upper case with forward slashes', () => {
    expect(getFileKey('snd\\b.wav')).toBe('SND/B.WAV');
  });
});
