import { Task } from '@serenity-js/core';
import { equals, includes, isGreaterThan } from '@serenity-js/assertions';
import { Attribute, Text } from '@serenity-js/web';
import { PresenceOf } from '../support/presence';
import { seeEventually } from '../support/see-eventually';
import {
  ActionPickerOption,
  ChangeNotice,
  DebugCurrentExecution,
  DebugEventsCount,
  DebugPanel,
  DebugStatus,
  DebuggerLayout,
  PauseOnLinksStatus,
  WatchEntry,
  WatchInvalid,
  WatchRow,
  WatchValue,
} from './elements';

export const SeeDebuggerOpen = (): Task =>
  seeEventually(DebugPanel, (e) => PresenceOf(e), equals(true), '#actor sees the debugger open');

/** The layout's class list carries `debugger-<dock>`, which is how the panel's side is styled. */
export const SeeDebuggerDocked = (dock: 'left' | 'bottom' | 'right'): Task =>
  seeEventually(
    DebuggerLayout,
    (e) => Attribute.called('class').of(e),
    includes(`debugger-${dock}`),
    `#actor sees the debugger docked ${dock}`,
  );

/** The debug status is `disabled`, `running` or `paused`. */
export const SeeDebugStatus = (state: 'disabled' | 'running' | 'paused'): Task =>
  seeEventually(
    DebugStatus,
    (e) => Attribute.called('data-state').of(e),
    equals(state),
    `#actor sees the debug status ${state}`,
  );

export const SeePauseOnLinks = (state: 'on' | 'off'): Task =>
  seeEventually(
    PauseOnLinksStatus,
    (e) => Attribute.called('data-state').of(e),
    equals(state),
    `#actor sees pause on links ${state}`,
  );

/** The execution is at `location`, on any line. */
export const SeeExecutionAt = (location: string): Task =>
  seeEventually(
    DebugCurrentExecution,
    (e) => Attribute.called('data-location').of(e),
    equals(location),
    `#actor sees the execution at "${location}"`,
  );

/** The execution is at line `line` of `location`. */
export const SeeExecutionLine = (location: string, line: number): Task =>
  Task.where(
    `#actor sees the execution at line ${line} of "${location}"`,
    SeeExecutionAt(location),
    seeEventually(
      DebugCurrentExecution,
      (e) => Attribute.called('data-line').of(e),
      equals(String(line)),
      `#actor sees the current line be ${line}`,
    ),
  );

/** The execution is at line `line` of the current action `name` (a step the debugger placed in that action). */
export const SeeExecutionInCurrentAction = (name: string, line: number): Task =>
  Task.where(
    `#actor sees the execution at line ${line} of the current action "${name}"`,
    seeEventually(
      DebugCurrentExecution,
      (e) => Attribute.called('data-action').of(e),
      equals(name),
      `#actor sees the execution in "${name}"`,
    ),
    seeEventually(
      DebugCurrentExecution,
      (e) => Attribute.called('data-line').of(e),
      equals(String(line)),
      `#actor sees the current line be ${line}`,
    ),
  );

/** The event count (on the events tab) is above `n`. */
export const SeeEventsAbove = (n: number): Task =>
  seeEventually(
    DebugEventsCount,
    (e) => Attribute.called('data-count').of(e).as(Number),
    isGreaterThan(n),
    `#actor sees more than ${n} logged events`,
  );

export const SeeEventsCount = (n: number): Task =>
  seeEventually(
    DebugEventsCount,
    (e) => Attribute.called('data-count').of(e).as(Number),
    equals(n),
    `#actor sees ${n} logged events`,
  );

/** The watch entry `name` shows the value `text`. */
export const SeeWatchValue = (name: string, text: string): Task =>
  seeEventually(WatchValue(name), (e) => Text.of(e).trim(), equals(text), `#actor sees ${name} watched as ${text}`);

/** The watch entry `name` is (or is not) marked changed. */
export const SeeWatchChanged = (name: string, changed: boolean): Task =>
  seeEventually(
    WatchEntry(name),
    (e) => Attribute.called('data-changed').of(e),
    equals(String(changed)),
    `#actor sees ${name} ${changed ? 'marked' : 'not marked'} changed`,
  );

/** The change notice contains `text`. */
export const SeeChangeNotice = (text: string): Task =>
  seeEventually(
    ChangeNotice,
    (e) => Text.of(e).replace(/\s+/g, ' '),
    includes(text),
    `#actor sees the change notice contain ${text}`,
  );

/** The row `key` of the expanded watch entry `name` reads `key value`. */
export const SeeWatchRow = (name: string, key: string, value: string): Task =>
  seeEventually(
    WatchRow(name, key),
    (e) => Text.of(e).replace(/\s+/g, ' ').trim(),
    equals(`${key} ${value}`),
    `#actor sees ${name} row ${key} read ${value}`,
  );

/** The open Actions picker lists the action `name`. */
export const SeeActionName = (name: string): Task =>
  seeEventually(
    ActionPickerOption(name),
    (e) => PresenceOf(e),
    equals(true),
    `#actor sees the action "${name}" listed`,
  );

/** The watch panel says the entry it was given cannot be watched. */
export const SeeWatchInvalid = (): Task =>
  seeEventually(WatchInvalid, (e) => PresenceOf(e), equals(true), '#actor sees the watch entry rejected');
