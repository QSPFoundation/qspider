// The debugger on actions: the actions picker, the current actions list, and dynamic actions (their own code and line numbers, line breakpoints, jumps back into the location).
// Shared steps: debugger-steps.ts.
import {
  SeeActionName,
  SeeDebugStatus,
  SeeExecutionInCurrentAction,
  SeeExecutionLine,
} from '../screenplay/debugger/checks';
import {
  SeeCurrentLineText,
  SeeNoCurrentLine,
  SeeEditorCode,
  SeeEditorTitle,
} from '../screenplay/debugger/editor/checks';
import { SeeCurrentActionRunning, SeeCurrentActions } from '../screenplay/debugger/current-actions/checks';
import { SelectCurrentAction, ToggleCurrentActions } from '../screenplay/debugger/current-actions/tasks';
import {
  EnableDebugging,
  OpenActionPicker,
  OpenDebugger,
  ResumeDebugger,
  SelectCodeTab,
  SelectLocation,
  StepDebugger,
  ToggleLocationBreakpoint,
} from '../screenplay/debugger/tasks';
import { ToggleLineBreakpoint } from '../screenplay/debugger/editor/tasks';
import { SeeMainTextContaining } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { scenario } from '../screenplay/support/scenario';
import { LOCATION, ACTION, ACTS, LOOP, OpenDebuggerGame, InActs, InLoop, StepTimes } from './debugger-steps';

scenario('the actions picker lists each action by its name', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    SelectLocation(LOCATION.start),
    SelectCodeTab('action'),
    OpenActionPicker(),
    ...Object.values(ACTION).map((name) => SeeActionName(name)),
  );
});

scenario('the current actions list shows the actions the player sees and their code', async (player) => {
  await player.attemptsTo(
    ...InActs(),
    OpenDebugger(),
    SeeCurrentActions([ACTS.placed.name, ACTS.detached.name, ACTS.back.name]),
    SelectCurrentAction(ACTS.detached.name),
    SeeEditorTitle(`Current action: ${ACTS.detached.name}`),
    SeeEditorCode(ACTS.detached.first.code),
    ToggleCurrentActions(),
    SeeCurrentActions([]),
    ToggleCurrentActions(),
  );
});

scenario('stepping in a dynamic action follows into its code past a cla and a multi-line string', async (player) => {
  await player.attemptsTo(
    ...InActs(),
    OpenDebugger(),
    EnableDebugging(),
    ToggleLocationBreakpoint(LOCATION.acts),
    ClickAction(ACTS.detached.name),
    SeeDebugStatus('paused'),
    SeeExecutionInCurrentAction(ACTS.detached.name, ACTS.detached.first.line),
    SeeCurrentActionRunning(ACTS.detached.name, true),
    SeeCurrentLineText(ACTS.detached.first.code),
    StepDebugger(),
    SeeCurrentLineText(ACTS.detached.cla.code),
    StepDebugger(),
    SeeExecutionInCurrentAction(ACTS.detached.name, ACTS.detached.note.line), // list is empty now
    SeeEditorTitle(`Current action: ${ACTS.detached.name}`),
    StepDebugger(),
    SeeCurrentLineText(ACTS.detached.last.code),
    ResumeDebugger(),
    SeeMainTextContaining(ACTS.detached.done),
  );
});

scenario('after a dynamic action ends its last line is not shown as a line of the location', async (player) => {
  await player.attemptsTo(
    ...InActs(),
    OpenDebugger(),
    EnableDebugging(),
    ToggleLocationBreakpoint(LOCATION.acts),
    ClickAction(ACTS.detached.name),
    SeeDebugStatus('paused'),
    SeeExecutionInCurrentAction(ACTS.detached.name, ACTS.detached.first.line),
    ToggleLocationBreakpoint(LOCATION.acts), // off: it would pause on every step left
    ResumeDebugger(),
    SeeMainTextContaining(ACTS.detached.done),
    SelectLocation(LOCATION.acts),
    SeeEditorTitle(`Location: ${LOCATION.acts}`),
    SeeEditorCode(ACTS.startLine.code),
    SeeNoCurrentLine(),
  );
});

scenario('a line breakpoint on the location does not fire for a dynamic action', async (player) => {
  await player.attemptsTo(
    ...InActs(),
    OpenDebugger(),
    EnableDebugging(),
    SelectLocation(LOCATION.acts),
    ToggleLineBreakpoint(ACTS.placed.line),
    ClickAction(ACTS.detached.name),
    SeeMainTextContaining(ACTS.detached.done),
    SeeDebugStatus('running'),
  );
});

scenario('an act written in a location is followed in the location code', async (player) => {
  await player.attemptsTo(
    ...InActs(),
    OpenDebugger(),
    EnableDebugging(),
    SelectLocation(LOCATION.acts),
    ToggleLineBreakpoint(ACTS.placed.line),
    ClickAction(ACTS.placed.name),
    SeeDebugStatus('paused'),
    SeeExecutionLine(LOCATION.acts, ACTS.placed.line),
    SeeCurrentLineText(ACTS.placed.code),
    SeeEditorTitle(`Location: ${LOCATION.acts}`),
    ResumeDebugger(),
    SeeMainTextContaining(ACTS.placed.done),
    SeeCurrentActionRunning(ACTS.placed.name, false),
  );
});

scenario('a dynamic action that jumps back into its location still hits its line breakpoints', async (player) => {
  await player.attemptsTo(
    ...InActs(),
    OpenDebugger(),
    EnableDebugging(),
    SelectLocation(LOCATION.acts),
    ToggleLineBreakpoint(ACTS.startLine.line),
    ClickAction(ACTS.back.name),
    SeeDebugStatus('paused'),
    SeeExecutionLine(LOCATION.acts, ACTS.startLine.line),
    SeeCurrentLineText(ACTS.startLine.code),
    SeeEditorTitle(`Location: ${LOCATION.acts}`),
    ResumeDebugger(),
    SeeMainTextContaining(ACTS.start),
  );
});

scenario('a dynamic action that jumps back into its location stops at a location line it shares', async (player) => {
  await player.attemptsTo(
    ...InLoop(),
    OpenDebugger(),
    EnableDebugging(),
    SelectLocation(LOCATION.loop),
    ToggleLineBreakpoint(LOOP.again.line),
    ClickAction(LOOP.again.name),
    SeeDebugStatus('paused'),
    SeeExecutionLine(LOCATION.loop, LOOP.again.line),
    SeeCurrentLineText(LOOP.again.code),
    SeeEditorTitle(`Location: ${LOCATION.loop}`),
    ResumeDebugger(),
    SeeMainTextContaining(LOOP.again.after),
  );
});

scenario('a running dynamic action keeps its code when another action takes its place in the list', async (player) => {
  await player.attemptsTo(
    ...InLoop(),
    OpenDebugger(),
    EnableDebugging(),
    ToggleLocationBreakpoint(LOCATION.loop),
    ClickAction(LOOP.swap.name),
    SeeDebugStatus('paused'),
    SeeExecutionInCurrentAction(LOOP.swap.name, LOOP.swap.cla.line),
    SeeCurrentLineText(LOOP.swap.cla.code),
    ...StepTimes(LOOP.swap.swapped.line - LOOP.swap.cla.line), // past `act one`, `act other` and the `wait`
    SeeCurrentActions([...LOOP.swap.replaced]),
    SeeExecutionInCurrentAction(LOOP.swap.name, LOOP.swap.swapped.line),
    SeeEditorTitle(`Current action: ${LOOP.swap.name}`),
    SeeCurrentLineText(LOOP.swap.swapped.code),
    ToggleLocationBreakpoint(LOCATION.loop), // off: it would pause on every step left
    ResumeDebugger(),
    SeeMainTextContaining(LOOP.swap.done),
  );
});
