import { describe, expect, it } from 'vitest';
import { restartStep } from './restart-step';

describe('restartStep', () => {
  it('ends the session of a running app', () => {
    expect(restartStep(true, false, false)).toBe('end-session');
    expect(restartStep(true, true, false)).toBe('end-session');
  });

  it('only ends the dead session of an app that quit as expected', () => {
    expect(restartStep(false, true, false)).toBe('end-dead-session');
  });

  it('only starts the new app after a restart that ended the session and then failed', () => {
    expect(restartStep(false, false, true)).toBe('start-only');
    expect(restartStep(false, true, true)).toBe('start-only');
  });

  it('fails when the app is gone and nothing explains it', () => {
    expect(restartStep(false, false, false)).toBe('fail');
  });
});
