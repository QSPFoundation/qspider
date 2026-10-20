// The desktop run must stay inside the private session that run-desktop-e2e.mjs builds (Xvfb,
// a private session bus and a11y bus, private XDG dirs). Run directly, wdio would open the app on
// the real display, GTK would write the real dconf, and dialog.py would talk to the real a11y bus.
// Same checks as atspi/with-a11y-bus.sh and atspi/dialog.py.

export const PRIVATE_SESSION_HINT =
  'Run the desktop E2E with `pnpm e2e:desktop` (or `node apps/player-e2e/targets/desktop/run-desktop-e2e.mjs`), never `wdio run` directly.';

/** Why `env` is not the runner's private session on Linux, or undefined when it is. */
export function privateSessionProblem(env: NodeJS.ProcessEnv, uid: number): string | undefined {
  if (env['QSPIDER_E2E_PRIVATE_SESSION'] !== '1') return 'QSPIDER_E2E_PRIVATE_SESSION is not set';
  const bus = env['DBUS_SESSION_BUS_ADDRESS'];
  if (!bus) return 'DBUS_SESSION_BUS_ADDRESS is not set (not inside dbus-run-session?)';
  if (bus.includes(`/run/user/${uid}/bus`)) return `DBUS_SESSION_BUS_ADDRESS is the desktop session bus (${bus})`;
  return undefined;
}
