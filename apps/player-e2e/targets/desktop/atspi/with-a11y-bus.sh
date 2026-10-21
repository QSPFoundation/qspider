#!/bin/sh
# Usage: dbus-run-session -- with-a11y-bus.sh <command> [args...]
# Started by run-desktop-e2e.mjs inside xvfb-run, with a private XDG_RUNTIME_DIR and home dirs; it
# refuses to run anywhere else (fails closed), so it can never touch the desktop session's a11y bus.
# Starts the AT-SPI accessibility bus and registry explicitly (a bare dbus-run-session has no
# systemd activation, so AT-SPI can't auto-start), waits until both answer, runs the command,
# then stops the two daemons it started and exits with the command's status.
# Daemon output goes to $QSPIDER_A11Y_LOG (default: apps/player-e2e/artifacts/desktop/a11y-bus.log).

me=with-a11y-bus.sh
script_dir=$(cd "$(dirname "$0")" && pwd) || exit 1
log_dest=${QSPIDER_A11Y_LOG:-$script_dir/../../../artifacts/desktop/a11y-bus.log}

# Never inherit a pointer to another accessibility bus.
unset AT_SPI_BUS_ADDRESS

refuse() {
  echo "$me: refusing to run: $1" >&2
  exit 1
}
[ "$QSPIDER_E2E_PRIVATE_SESSION" = 1 ] ||
  refuse "QSPIDER_E2E_PRIVATE_SESSION is not set; run it through apps/player-e2e/targets/desktop/run-desktop-e2e.mjs"
case "${DBUS_SESSION_BUS_ADDRESS:-}" in
  '') refuse "DBUS_SESSION_BUS_ADDRESS is not set (not inside dbus-run-session?)" ;;
  *"/run/user/$(id -u)/bus"*) refuse "DBUS_SESSION_BUS_ADDRESS is the desktop session bus ($DBUS_SESSION_BUS_ADDRESS)" ;;
esac

# Arch keeps the daemons in /usr/lib, Debian/Ubuntu in /usr/libexec.
find_daemon() {
  for dir in /usr/libexec /usr/lib; do
    if [ -x "$dir/$1" ]; then
      echo "$dir/$1"
      return 0
    fi
  done
  echo "$me: $1 not found in /usr/libexec or /usr/lib (install at-spi2-core)" >&2
  return 1
}

# NameHasOwner never triggers D-Bus activation (calling the name itself would).
has_owner() { # <bus option> <name>
  dbus-send "$1" --print-reply --dest=org.freedesktop.DBus /org/freedesktop/DBus \
    org.freedesktop.DBus.NameHasOwner "string:$2" 2>/dev/null | grep -q 'boolean true'
}

launcher=$(find_daemon at-spi-bus-launcher) || exit 1
registry=$(find_daemon at-spi2-registryd) || exit 1

# On the desktop's own session bus the a11y bus is already owned; starting another would replace it.
if has_owner --session org.a11y.Bus; then
  refuse "org.a11y.Bus already owned (not inside dbus-run-session?)"
fi

# The daemons get their own runtime dir too (the launcher names its socket after it) and no DISPLAY,
# so they can't publish anything on an X server.
daemon_dir=$(mktemp -d "${TMPDIR:-/tmp}/qspider-a11y.XXXXXX") || exit 1
log="$daemon_dir/a11y-bus.log"
launcher_pid=
registry_pid=

stop_pid() { # TERM, up to ~2s for it to exit, then KILL. Only PIDs this script started.
  [ -n "$1" ] || return 0
  kill "$1" 2>/dev/null || return 0
  n=0
  while kill -0 "$1" 2>/dev/null && ! ps -o stat= -p "$1" 2>/dev/null | grep -q Z; do
    n=$((n + 1))
    if [ "$n" -gt 40 ]; then
      save_log # before KILL, in case the shell does not get to the end of cleanup
      kill -9 "$1" 2>/dev/null
      break
    fi
    sleep 0.05
  done
  wait "$1" 2>/dev/null
}
save_log() {
  if mkdir -p "$(dirname "$log_dest")" 2>/dev/null; then cp "$log" "$log_dest" 2>/dev/null; fi
}
cleanup() {
  stop_pid "$registry_pid"
  stop_pid "$launcher_pid"
  registry_pid=
  launcher_pid=
  save_log
  rm -rf "$daemon_dir"
}
fail() {
  echo "$me: $1 (daemon log: $log_dest)" >&2
  cleanup
  exit 1
}
trap 'cleanup; exit 129' HUP
trap 'cleanup; exit 130' INT
trap 'cleanup; exit 143' TERM

XDG_RUNTIME_DIR=$daemon_dir env -u DISPLAY "$launcher" --launch-immediately >>"$log" 2>&1 &
launcher_pid=$!

# Poll (no fixed sleep): until the launcher owns org.a11y.Bus and returns its address; about 10s.
i=0
until has_owner --session org.a11y.Bus &&
  a11y_address=$(dbus-send --session --print-reply --dest=org.a11y.Bus /org/a11y/bus org.a11y.Bus.GetAddress 2>/dev/null |
    sed -n 's/^ *string "\(.*\)"$/\1/p') && [ -n "$a11y_address" ]; do
  i=$((i + 1))
  [ "$i" -gt 200 ] && fail "the accessibility bus ($launcher) did not answer within 10s"
  sleep 0.05
done

XDG_RUNTIME_DIR=$daemon_dir env -u DISPLAY "$registry" >>"$log" 2>&1 &
registry_pid=$!

# Poll (inside one python3, about 10s) until the registry owns org.a11y.atspi.Registry on the accessibility
# bus. Not dbus-send: with --address it skips Hello(), which the accessibility bus (dbus-broker) requires.
python3 -I -c '
import sys, time
from gi.repository import Gio, GLib
flags = Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION
bus = Gio.DBusConnection.new_for_address_sync(sys.argv[1], flags, None, None)
deadline = time.monotonic() + 10
while time.monotonic() < deadline:
    reply = bus.call_sync("org.freedesktop.DBus", "/org/freedesktop/DBus", "org.freedesktop.DBus", "NameHasOwner",
                          GLib.Variant("(s)", ("org.a11y.atspi.Registry",)), None, Gio.DBusCallFlags.NONE, 2000, None)
    if reply.unpack()[0]:
        sys.exit(0)
    time.sleep(0.05)
sys.exit(1)
' "$a11y_address" >>"$log" 2>&1 ||
  fail "the AT-SPI registry ($registry) did not register on the accessibility bus within 10s"

"$@"
status=$?
cleanup
exit "$status"
