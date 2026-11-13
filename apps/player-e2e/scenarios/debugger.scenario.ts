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
  SeeWatchValue,
} from '../screenplay/debugger/checks';
import {
  AddWatch,
  ClearEvents,
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
import { SeeMainTextContaining, SeeMainTextWithout } from '../screenplay/game/checks';
import { ClickAction, PressEscape, ReturnToShelf } from '../screenplay/game/tasks';
import { PauseScreen, RestartButton } from '../screenplay/pause/elements';
import { ContentMark } from '../screenplay/content/elements';
import { ClickContent } from '../screenplay/content/tasks';
import { SeeShelfIncludes, SeeShelfWritesSettled } from '../screenplay/shelf/checks';
import { OpenFromShelf } from '../screenplay/shelf/tasks';
import { ClickWhenPresent, waitUntilPresent } from '../screenplay/support/presence';
import { LoadGame, RestartPlayer, StartPlayer } from '../screenplay/support/operate-player';
import { BlockOrigin } from '../screenplay/support/delay-requests';
import { scenario } from '../screenplay/support/scenario';
import { SeeNoScriptFrom } from '../screenplay/support/script-sources';

const { location: LOCATION, action: ACTION, text: TEXT, code: CODE, vars: VARS } = DEBUGGER_GAME;
const EDITOR_CDN = 'cdn.jsdelivr.net';

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
