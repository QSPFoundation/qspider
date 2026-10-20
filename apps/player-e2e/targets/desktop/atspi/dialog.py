#!/usr/bin/env python3
"""Drives the qSpider desktop app's native GTK file chooser through AT-SPI (accessibility).

No keystrokes: the chooser's show_location action reveals the location entry, the entry's
EditableText takes the path, and the entry's activate action (Return) confirms. Clicking the Open
button through AT-SPI does not confirm a path typed into the location entry, so it is not used.

Usage: dialog.py open <path> [timeout_s]   choose <path> and confirm; exit 1 with a message on failure
       dialog.py dump [timeout_s]           print the dialog's accessible tree (debugging)
Needs: an AT-SPI bus and registry in the session, GTK on X11. No dependence on UI language.
"""
import sys
import time

import gi

gi.require_version("Atspi", "2.0")
from gi.repository import Atspi  # noqa: E402

APP_NAME = "qspider"
POLL_S = 0.1


def fail(message):
    print(message, file=sys.stderr)
    raise SystemExit(1)


def poll(find, timeout, what):
    deadline = time.time() + timeout
    while True:
        found = find()
        if found is not None:
            return found
        if time.time() > deadline:
            fail(f"{what} did not appear within {timeout}s")
        time.sleep(POLL_S)


def children(node):
    for i in range(node.get_child_count() if node is not None else 0):
        child = node.get_child_at_index(i)
        if child is not None:
            yield child


def descendants(node):
    for child in children(node):
        yield child
        yield from descendants(child)


def showing(node):
    return node.get_state_set().contains(Atspi.StateType.SHOWING)


def find_dialog():
    for app in children(Atspi.get_desktop(0)):
        if APP_NAME in (app.get_name() or "").lower():
            for win in children(app):
                if win.get_role() == Atspi.Role.FILE_CHOOSER:
                    return win
    return None


def action_index(node, name):
    if "Action" not in node.get_interfaces():
        return None
    act = node.get_action_iface()
    for i in range(act.get_n_actions()):
        if act.get_action_name(i) == name:
            return i
    return None


def entry_text(entry):
    # Called through Atspi.Text: on the Accessible, get_text resolves to an unrelated method.
    return Atspi.Text.get_text(entry, 0, Atspi.Text.get_character_count(entry))


def do_action(node, name):
    index = action_index(node, name)
    if index is None:
        fail(f"{node.get_role_name()} {node.get_name()!r} has no {name!r} action")
    node.get_action_iface().do_action(index)


def open_path(path, timeout):
    dialog = poll(find_dialog, timeout, "The native file dialog")
    widget = next((n for n in descendants(dialog) if action_index(n, "show_location") is not None), None)
    if widget is None:
        fail("The file chooser exposes no show_location action")
    do_action(widget, "show_location")
    entry = poll(
        lambda: next(
            (n for n in descendants(dialog) if "EditableText" in n.get_interfaces() and showing(n)), None
        ),
        timeout,
        "The file chooser's location entry",
    )
    entry.get_editable_text_iface().set_text_contents(path)
    # GTK's location entry autocompletes: the first activation (Return) may only accept the
    # completion, so activate until the dialog closes, at most 3 times. Before each, the entry must
    # still hold `path`: a completion that changed it would open a different file.
    for _ in range(3):
        if find_dialog() is None:
            break
        try:
            text = entry_text(entry)
        except Exception:
            if find_dialog() is None:  # it closed between the check and the read
                break
            raise
        if text != path:
            fail(f"The native file dialog changed the path {path} to {text}")
        do_action(entry, "activate")
        deadline = time.time() + 1
        while find_dialog() is not None and time.time() < deadline:
            time.sleep(POLL_S)
    if find_dialog() is not None:
        fail(f"The native file dialog did not accept {path}")


def dump(node, depth=0):
    actions = ""
    if "Action" in node.get_interfaces():
        act = node.get_action_iface()
        actions = " actions=" + "/".join(act.get_action_name(i) for i in range(act.get_n_actions()))
    state = "visible" if showing(node) else "hidden"
    print(f"{'  ' * depth}{node.get_role_name()} name={node.get_name()!r} [{state}]{actions}")
    for child in children(node):
        dump(child, depth + 1)


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    if mode == "open" and len(sys.argv) >= 3:
        open_path(sys.argv[2], float(sys.argv[3]) if len(sys.argv) > 3 else 15)
    elif mode == "dump":
        dump(poll(find_dialog, float(sys.argv[2]) if len(sys.argv) > 2 else 15, "The native file dialog"))
    else:
        fail(__doc__)
