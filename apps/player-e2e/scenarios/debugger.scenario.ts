import { DEBUGGER_GAME } from '../fixtures/debugger-game';
import { SeeGameStartedContaining, SeeStartupFinished } from '../screenplay/common/checks';
import {
  SeeDebuggerDocked,
  SeeDebuggerOpen,
  SeeDebugStatus,
  SeeEditorCode,
  SeeEventsAbove,
  SeeChangeNotice,
  SeeEventsCount,
  SeeExecutionLine,
  SeeHoverText,
  SeePauseOnLinks,
  SeeWatchChanged,
  SeeWatchRow,
  SeeWatchValue,
} from '../screenplay/debugger/checks';
import {
  AddWatch,
  ClearEvents,
  ExpandWatch,
  CloseDebugger,
  DockDebugger,
  EnableDebugging,
  HoverToken,
  OpenDebugger,
  OpenEventsTab,
  PinFromHover,
  PressF12ToClose,
  ResumeDebugger,
  SelectCodeTab,
  SelectLocation,
  StepDebugger,
  ToggleLocationBreakpoint,
  ToggleWatchPause,
  TogglePauseOnLinks,
} from '../screenplay/debugger/tasks';
import { DebugPanel } from '../screenplay/debugger/elements';
import { SeeMainTextContaining, SeeMainTextWithout } from '../screenplay/game/checks';
import { SeeMsg } from '../screenplay/msg/checks';
import { DismissMsg } from '../screenplay/msg/tasks';
import { ClickAction, PressEscape, ReturnToShelf } from '../screenplay/game/tasks';
import { PauseScreen, RestartButton } from '../screenplay/pause/elements';
import { ContentMark } from '../screenplay/content/elements';
import { ClickContent } from '../screenplay/content/tasks';
import { SeeShelfIncludes, SeeShelfWritesSettled } from '../screenplay/shelf/checks';
import { OpenFromShelf } from '../screenplay/shelf/tasks';
import { ClickWhenPresent, waitUntilAbsent, waitUntilPresent } from '../screenplay/support/presence';
import { LoadGame, RestartPlayer, StartPlayer } from '../screenplay/support/operate-player';
import { PageClockAdvanced } from '../screenplay/support/page-clock';
import { BlockOrigin } from '../screenplay/support/delay-requests';
import { scenario } from '../screenplay/support/scenario';
import { SeeNoScriptFrom } from '../screenplay/support/script-sources';

const {
  location: LOCATION,
  action: ACTION,
  text: TEXT,
  code: CODE,
  vars: VARS,
  hits: HITS,
  hold: HOLD,
} = DEBUGGER_GAME;
const EDITOR_CDN = 'cdn.jsdelivr.net';
/** Past several runs of qspider's 500 ms counter, each of which refreshes the watch with nothing to report. */
const PAST_COUNTER_RUNS = 2500;

/** From a clean app: opens the debugger fixture game at its start (its main text holds a link beside the start text). */
const OpenDebuggerGame = () => [
  StartPlayer(),
  SeeStartupFinished(),
  LoadGame(DEBUGGER_GAME.path),
  SeeGameStartedContaining(TEXT.start),
];

/** Steps the paused game `n` times, one `vars` line each. */
const StepTimes = (n: number) => Array.from({ length: n }, () => StepDebugger());

/** From the debugger game's start: debug mode on, a breakpoint on `vars`, `vars` run: paused at its first line. */
const PauseInVars = () => [
  OpenDebugger(),
  EnableDebugging(),
  ToggleLocationBreakpoint(LOCATION.vars),
  ClickAction(ACTION.vars),
  SeeDebugStatus('paused'),
  SeeExecutionLine(LOCATION.vars, 1),
];

/** Restarts the game through the pause screen (Escape, then Restart). */
const RestartFromPauseScreen = () => [
  PressEscape(),
  waitUntilPresent(PauseScreen),
  ClickWhenPresent(RestartButton),
  SeeGameStartedContaining(TEXT.start),
];

scenario('F12 opens the debugger and the close button and F12 close it', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    SeeDebuggerOpen(),
    CloseDebugger(),
    OpenDebugger(),
    PressF12ToClose(),
  );
});

scenario('selecting a location shows its code and its action code', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    SelectLocation(LOCATION.second),
    SeeEditorCode(CODE.second),
    SelectLocation(LOCATION.start),
    SelectCodeTab('action'),
    SeeEditorCode(CODE.goAction),
  );
});

scenario('a location breakpoint pauses the game and resume continues it', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    EnableDebugging(),
    SeeDebugStatus('running'),
    ToggleLocationBreakpoint(LOCATION.second),
    ClickAction(ACTION.go),
    SeeDebugStatus('paused'),
    SeeExecutionLine(LOCATION.second, 1),
    StepDebugger(),
    SeeExecutionLine(LOCATION.second, 2), // the step advanced a line and the game is still paused
    SeeDebugStatus('paused'),
    ResumeDebugger(),
    SeeDebugStatus('running'),
    SeeMainTextContaining(TEXT.second),
  );
});

scenario('an action shows up in the event log and clear empties it', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    OpenEventsTab(),
    ClearEvents(), // the engine logs from game start, so the log starts non-empty
    SeeEventsCount(0),
    ClickAction(ACTION.go),
    SeeMainTextContaining(TEXT.second),
    SeeEventsAbove(0),
    ClearEvents(),
    SeeEventsCount(0),
  );
});

scenario('with pause on links on, a link pauses before its code runs', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    EnableDebugging(),
    TogglePauseOnLinks(),
    SeePauseOnLinks('on'),
    ClickContent(ContentMark(DEBUGGER_GAME.link.qa)),
    SeeDebugStatus('paused'),
    SeeMainTextContaining(TEXT.start),
    SeeMainTextWithout(TEXT.second),
    ResumeDebugger(),
    SeeMainTextContaining(TEXT.second),
  );
});

scenario('the dock position survives a player restart', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    DockDebugger('left'),
    SeeDebuggerDocked('left'),
    ReturnToShelf(),
    SeeShelfIncludes(DEBUGGER_GAME.title),
    SeeShelfWritesSettled(), // the dock position and the shelf must reach storage before the restart
    RestartPlayer(),
    SeeStartupFinished(),
    OpenFromShelf(DEBUGGER_GAME.title),
    SeeGameStartedContaining(TEXT.start),
    OpenDebugger(),
    SeeDebuggerDocked('left'),
  );
});

scenario('the editor loads from the player itself', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    SelectLocation(LOCATION.start),
    SeeEditorCode(CODE.start),
    SeeNoScriptFrom(EDITOR_CDN),
  );
});

scenario.webOnly('with the CDN unreachable the editor still shows code', async (player) => {
  await player.attemptsTo(
    BlockOrigin(`https://${EDITOR_CDN}`),
    ...OpenDebuggerGame(),
    OpenDebugger(),
    SelectLocation(LOCATION.start),
    SeeEditorCode(CODE.start),
  );
});

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
