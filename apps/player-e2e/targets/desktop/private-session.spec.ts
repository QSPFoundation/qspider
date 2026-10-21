import { describe, expect, it } from 'vitest';
import { privateSessionProblem } from './private-session';

const PRIVATE_BUS = 'unix:path=/tmp/dbus-abc123,guid=1';
const ok = { QSPIDER_E2E_PRIVATE_SESSION: '1', DBUS_SESSION_BUS_ADDRESS: PRIVATE_BUS };

describe('privateSessionProblem', () => {
  it('accepts the runner session: marker set, a private bus', () => {
    expect(privateSessionProblem(ok, 1000)).toBeUndefined();
  });
  it('refuses without the marker', () => {
    expect(privateSessionProblem({ DBUS_SESSION_BUS_ADDRESS: PRIVATE_BUS }, 1000)).toMatch(
      /QSPIDER_E2E_PRIVATE_SESSION/,
    );
    expect(privateSessionProblem({ ...ok, QSPIDER_E2E_PRIVATE_SESSION: 'true' }, 1000)).toMatch(
      /QSPIDER_E2E_PRIVATE_SESSION/,
    );
  });
  it('refuses without a session bus', () => {
    expect(privateSessionProblem({ QSPIDER_E2E_PRIVATE_SESSION: '1' }, 1000)).toMatch(/not set/);
  });
  it("refuses the desktop's own session bus", () => {
    expect(privateSessionProblem({ ...ok, DBUS_SESSION_BUS_ADDRESS: 'unix:path=/run/user/1000/bus' }, 1000)).toMatch(
      /desktop session bus/,
    );
  });
});
