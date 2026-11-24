// The debugger's variable hover and watch panel: values, arrays, pins, change marks, break on change, prefixes and records.
// Shared steps: debugger-steps.ts.
import { DEBUGGER_GAME } from '../fixtures/debugger-game';
import { SeeGameStartedContaining, SeeStartupFinished } from '../screenplay/common/checks';
import {
  SeeDebugStatus,
  SeeChangeNotice,
  SeeExecutionLine,
  SeeWatchChanged,
  SeeWatchRow,
  SeeWatchValue,
} from '../screenplay/debugger/checks';
import { SeeEditorCode, SeeHoverText } from '../screenplay/debugger/editor/checks';
import {
  AddWatch,
  ExpandWatch,
  CloseDebugger,
  EnableDebugging,
  OpenDebugger,
  ResumeDebugger,
  SelectLocation,
  StepDebugger,
  ToggleLocationBreakpoint,
  ToggleWatchPause,
} from '../screenplay/debugger/tasks';
import { HoverToken, PinFromHover } from '../screenplay/debugger/editor/tasks';
import { DebugPanel } from '../screenplay/debugger/elements';
import { SeeMainTextContaining, SeeMainTextWithout } from '../screenplay/game/checks';
import { SeeMsg } from '../screenplay/msg/checks';
import { DismissMsg } from '../screenplay/msg/tasks';
import { ClickAction, ReturnToShelf } from '../screenplay/game/tasks';
import { SeeShelfIncludes, SeeShelfWritesSettled } from '../screenplay/shelf/checks';
import { OpenFromShelf } from '../screenplay/shelf/tasks';
import { waitUntilAbsent } from '../screenplay/support/presence';
import { RestartPlayer } from '../screenplay/support/operate-player';
import { PageClockAdvanced } from '../screenplay/support/page-clock';
import { scenario } from '../screenplay/support/scenario';
import {
  LOCATION,
  ACTION,
  TEXT,
  VARS,
  HITS,
  HOLD,
  PAST_COUNTER_RUNS,
  OpenDebuggerGame,
  StepTimes,
  PauseInVars,
  RestartFromPauseScreen,
} from './debugger-steps';

scenario('hovering a variable while paused shows its value', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    ...PauseInVars(),
    ...StepTimes(6), // the six assignments ran: the game stands at `GOLD -= 30`
    SeeExecutionLine(LOCATION.vars, VARS.changeLine),
    HoverToken(VARS.token.gold),
    SeeHoverText(VARS.hover.gold),
    HoverToken(VARS.token.who),
    SeeHoverText(VARS.hover.who),
    HoverToken(VARS.token.rec),
    SeeHoverText(VARS.hover.rec),
  );
});

// `$inv` holds two items, one keyed: hovered with no brackets (the last line of `vars` reads it whole) it shows the
// count and the items, not only its first cell.
scenario('hovering an array name shows its item count and items', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    SelectLocation(LOCATION.vars),
    SeeEditorCode(VARS.lastLine),
    ClickAction(ACTION.vars),
    SeeMainTextContaining(TEXT.varsEnd), // the array is set now
    HoverToken(VARS.token.inv, 'last'),
    SeeHoverText(VARS.hover.invCount),
    ...VARS.hover.invItems.map((item) => SeeHoverText(item)),
  );
});

scenario('a pinned variable updates on step and is marked changed', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    ...PauseInVars(),
    ...StepTimes(6),
    SeeExecutionLine(LOCATION.vars, VARS.changeLine),
    HoverToken(VARS.token.gold),
    SeeHoverText(VARS.hover.gold),
    PinFromHover(),
    StepDebugger(), // `GOLD -= 30` ran
    SeeWatchValue(VARS.token.gold, VARS.watch.after),
    SeeWatchChanged(VARS.token.gold, true),
  );
});

scenario('break on change pauses after the changing line and names it', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    ...PauseInVars(),
    ...StepTimes(6), // `gold = 100` ran: the watch starts from 100
    SeeExecutionLine(LOCATION.vars, VARS.changeLine),
    AddWatch(VARS.token.gold),
    ToggleWatchPause(VARS.token.gold),
    ToggleLocationBreakpoint(LOCATION.vars), // off: only the change may pause the game now
    ResumeDebugger(),
    SeeDebugStatus('paused'),
    SeeChangeNotice(VARS.change),
    SeeChangeNotice(VARS.changeAt),
  );
});

scenario('closing the panel releases a pause and stops pausing', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    ...PauseInVars(),
    CloseDebugger(), // the pause is released: the game runs on
    waitUntilAbsent(DebugPanel),
    SeeMainTextContaining(TEXT.varsEnd),
    ...RestartFromPauseScreen(),
    ClickAction(ACTION.vars), // the panel is closed: nothing pauses
    SeeMainTextContaining(TEXT.varsEnd),
    ...RestartFromPauseScreen(),
    OpenDebugger(), // debug mode comes back on, and with it the breakpoint
    ClickAction(ACTION.vars),
    SeeDebugStatus('paused'),
  );
});

scenario('the watch list survives a player restart', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    AddWatch(VARS.token.gold),
    SeeWatchChanged(VARS.token.gold, false),
    ReturnToShelf(),
    SeeShelfIncludes(DEBUGGER_GAME.title),
    SeeShelfWritesSettled(),
    RestartPlayer(),
    SeeStartupFinished(),
    OpenFromShelf(DEBUGGER_GAME.title),
    SeeGameStartedContaining(TEXT.start),
    OpenDebugger(),
    SeeWatchChanged(VARS.token.gold, false), // the entry is there
  );
});

scenario('a prefix that hides the stored value says so', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    ...PauseInVars(),
    ...StepTimes(6), // `u = '42'` ran
    SeeExecutionLine(LOCATION.vars, VARS.changeLine),
    HoverToken(VARS.token.numberU),
    SeeHoverText('0'),
    SeeHoverText(VARS.hover.hiddenByPrefix),
  );
});

scenario('with debug mode off, an action that changes a watched variable updates the watch panel', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    SeeDebugStatus('disabled'),
    AddWatch(HITS.token),
    SeeWatchChanged(HITS.token, false),
    ClickAction(ACTION.bump), // a run of one line, with no debug stop to read the value at
    SeeWatchValue(HITS.token, HITS.afterBump),
    SeeWatchChanged(HITS.token, true),
    PageClockAdvanced(PAST_COUNTER_RUNS),
    SeeWatchChanged(HITS.token, true), // the counter's clean runs since did not wipe the mark
  );
});

scenario('a change made by the last line of a run is reported and does not pause', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    EnableDebugging(),
    AddWatch(HITS.token),
    ToggleWatchPause(HITS.token), // it would pause if there were a stop left to pause at
    ClickAction(ACTION.bump),
    SeeWatchValue(HITS.token, HITS.afterBump),
    SeeChangeNotice(HITS.changeBump),
    SeeChangeNotice(HITS.at),
    SeeDebugStatus('running'),
    PageClockAdvanced(PAST_COUNTER_RUNS),
    SeeChangeNotice(HITS.changeBump), // the counter's clean runs since did not wipe the notice
    SeeWatchChanged(HITS.token, true),
  );
});

scenario('a change made before a msg pauses at the next stop and names its line', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    EnableDebugging(),
    AddWatch(HITS.token),
    ToggleWatchPause(HITS.token),
    ClickAction(ACTION.hold), // line 1: `hits += 1 & msg`; line 2 writes the text after it
    SeeMsg(HOLD.msg),
    SeeDebugStatus('running'), // the msg holds the run inside line 1: no stop yet, so no pause
    DismissMsg(),
    SeeDebugStatus('paused'),
    SeeExecutionLine(LOCATION.start, 2),
    SeeChangeNotice(HITS.changeBump),
    SeeChangeNotice(HITS.at), // the change is blamed on line 1, not on the stop that saw it
    SeeMainTextWithout(HOLD.after),
    ResumeDebugger(),
    SeeMainTextContaining(HOLD.after),
  );
});

scenario('hovering a prefixed name nothing sets says it is not set', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    SelectLocation(LOCATION.vars),
    SeeEditorCode(VARS.lastLine), // the editor shows vars before a token is looked up
    HoverToken(VARS.token.unset),
    SeeHoverText(VARS.hover.unset),
  );
});

scenario('a watched record expands to its fields', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    ClickAction(ACTION.vars),
    SeeMainTextContaining(TEXT.varsEnd), // the record is set now
    AddWatch(VARS.token.rec),
    ExpandWatch(VARS.token.rec),
    SeeWatchRow(VARS.token.rec, VARS.rows.name, VARS.rows.nameValue),
    SeeWatchRow(VARS.token.rec, VARS.rows.age, VARS.rows.ageValue),
  );
});

/** From the debugger game's start: `syntax` run to its end, the debugger open on its code. */
