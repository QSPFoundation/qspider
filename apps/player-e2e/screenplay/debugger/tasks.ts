import { Task } from '@serenity-js/core';
import { Key, Press } from '@serenity-js/web';
import { ClickWhenPresent, waitUntilAbsent, waitUntilPresent } from '../support/presence';
import {
  DebugBreakpointButton,
  DebugCloseButton,
  DebugCodeTab,
  DebugDockButton,
  DebugEventsClearButton,
  DebugEventsTab,
  DebugLocation,
  DebugPanel,
  DebugResumeButton,
  DebugStepButton,
  DebugToggle,
  PauseOnLinksToggle,
} from './elements';

/** Presses F12 and waits until the debugger panel shows. */
export const OpenDebugger = (): Task =>
  Task.where('#actor opens the debugger with F12', Press.the(Key.F12), waitUntilPresent(DebugPanel));

/** Presses F12 and waits until the debugger panel is gone (from an open debugger). */
export const PressF12ToClose = (): Task =>
  Task.where('#actor closes the debugger with F12', Press.the(Key.F12), waitUntilAbsent(DebugPanel));

/** Clicks the close button and waits until the debugger panel is gone. */
export const CloseDebugger = (): Task =>
  Task.where('#actor closes the debugger', ClickWhenPresent(DebugCloseButton), waitUntilAbsent(DebugPanel));

export const DockDebugger = (dock: 'left' | 'bottom' | 'right'): Task =>
  Task.where(`#actor docks the debugger ${dock}`, ClickWhenPresent(DebugDockButton(dock)));

export const SelectLocation = (name: string): Task =>
  Task.where(`#actor selects the location "${name}"`, ClickWhenPresent(DebugLocation(name)));

export const SelectCodeTab = (type: 'location' | 'description' | 'action'): Task =>
  Task.where(`#actor opens the ${type} code tab`, ClickWhenPresent(DebugCodeTab(type)));

/** Turns debug mode on (the toggle reads Enable while it is off). */
export const EnableDebugging = (): Task => Task.where('#actor enables debug mode', ClickWhenPresent(DebugToggle));

/** Toggles the location breakpoint of `name`. */
export const ToggleLocationBreakpoint = (name: string): Task =>
  Task.where(`#actor toggles the breakpoint on "${name}"`, ClickWhenPresent(DebugBreakpointButton(name)));

export const StepDebugger = (): Task => Task.where('#actor steps', ClickWhenPresent(DebugStepButton));

export const ResumeDebugger = (): Task => Task.where('#actor resumes', ClickWhenPresent(DebugResumeButton));

/** Toggles pausing on links (available once debug mode is on). */
export const TogglePauseOnLinks = (): Task =>
  Task.where('#actor toggles pause on links', ClickWhenPresent(PauseOnLinksToggle));

export const OpenEventsTab = (): Task => Task.where('#actor opens the events tab', ClickWhenPresent(DebugEventsTab));

export const ClearEvents = (): Task =>
  Task.where('#actor clears the event log', ClickWhenPresent(DebugEventsClearButton));
