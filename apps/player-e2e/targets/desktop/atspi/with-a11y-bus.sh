#!/bin/sh
# Usage (inside a D-Bus session): dbus-run-session -- with-a11y-bus.sh <command> [args...]
# Starts the AT-SPI accessibility bus and registry explicitly (a bare dbus-run-session has no
# systemd activation, so AT-SPI can't auto-start), waits until the bus answers, runs the command,
# then stops both daemons and exits with the command's status.
# Arch keeps the daemons in /usr/lib, Debian/Ubuntu in /usr/libexec.

find_daemon() {
  for dir in /usr/libexec /usr/lib; do
    if [ -x "$dir/$1" ]; then
      echo "$dir/$1"
      return 0
    fi
  done
  echo "with-a11y-bus.sh: $1 not found in /usr/libexec or /usr/lib (install at-spi2-core)" >&2
  return 1
}

launcher=$(find_daemon at-spi-bus-launcher) || exit 1
registry=$(find_daemon at-spi2-registryd) || exit 1

# The launcher names its socket $XDG_RUNTIME_DIR/at-spi/bus_<display>, the same path as the desktop
# session's own accessibility bus, which it would replace. A private runtime dir keeps them apart;
# clients find the bus through org.a11y.Bus.GetAddress, not the path.
runtime_dir=$(mktemp -d "${TMPDIR:-/tmp}/qspider-a11y.XXXXXX") || exit 1
launcher_pid=
registry_pid=
cleanup() {
  [ -n "$registry_pid" ] && kill "$registry_pid" 2>/dev/null
  [ -n "$launcher_pid" ] && kill "$launcher_pid" 2>/dev/null
  wait 2>/dev/null
  rm -rf "$runtime_dir"
}
trap 'cleanup; exit 130' INT
trap 'cleanup; exit 143' TERM

XDG_RUNTIME_DIR=$runtime_dir "$launcher" --launch-immediately >/dev/null 2>&1 &
launcher_pid=$!

# Poll (no fixed sleep) until the launcher owns org.a11y.Bus and answers; give up after about 10s.
# NameHasOwner first: calling org.a11y.Bus before it is owned would make D-Bus activate a second launcher.
a11y_bus_ready() {
  dbus-send --session --print-reply --dest=org.freedesktop.DBus /org/freedesktop/DBus \
    org.freedesktop.DBus.NameHasOwner string:org.a11y.Bus 2>/dev/null | grep -q 'boolean true' &&
    dbus-send --session --print-reply --dest=org.a11y.Bus /org/a11y/bus org.a11y.Bus.GetAddress >/dev/null 2>&1
}
i=0
until a11y_bus_ready; do
  i=$((i + 1))
  if [ "$i" -gt 200 ]; then
    echo "with-a11y-bus.sh: the accessibility bus ($launcher) did not answer within 10s" >&2
    cleanup
    exit 1
  fi
  sleep 0.05
done

XDG_RUNTIME_DIR=$runtime_dir "$registry" >/dev/null 2>&1 &
registry_pid=$!

"$@"
status=$?
cleanup
exit "$status"
