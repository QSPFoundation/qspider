import { describe, expect, it } from 'vitest';
import { assertLaunchFixture, LAUNCH_FIXTURE } from './launch-fixture';

describe('assertLaunchFixture', () => {
  it('accepts the launch fixture', () => {
    expect(() => assertLaunchFixture(LAUNCH_FIXTURE)).not.toThrow();
  });
  it('accepts the launch fixture by an equivalent path', () => {
    expect(() => assertLaunchFixture('/games/./x/../e2e.qsps', '/games/e2e.qsps')).not.toThrow();
  });
  it('rejects any other file, naming the launch fixture', () => {
    expect(() => assertLaunchFixture('/games/other.qsps', '/games/e2e.qsps')).toThrow(
      'Desktop opens only the launch fixture /games/e2e.qsps, not /games/other.qsps; per-scenario fixtures need a launch-argument change',
    );
  });
});
