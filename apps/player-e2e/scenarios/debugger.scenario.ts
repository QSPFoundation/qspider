import { DEBUGGER_GAME } from '../fixtures/debugger-game';
import { SeeGameStartedContaining, SeeStartupFinished } from '../screenplay/common/checks';
import {
  SeeDebuggerDocked,
  SeeDebuggerOpen,
  SeeActionName,
  SeeDebugStatus,
  SeeEventsAbove,
  SeeChangeNotice,
  SeeEventsCount,
  SeeExecutionInCurrentAction,
  SeeExecutionLine,
  SeePauseOnLinks,
  SeeWatchChanged,
  SeeWatchRow,
  SeeWatchInvalid,
  SeeWatchValue,
} from '../screenplay/debugger/checks';
import {
  SeeCurrentLineText,
  SeeNoCurrentLine,
  SeeEditorCode,
  SeeEditorTitle,
  SeeHoverText,
  SeeNoHover,
} from '../screenplay/debugger/editor/checks';
import { SeeCurrentActionRunning, SeeCurrentActions } from '../screenplay/debugger/current-actions/checks';
import { SelectCurrentAction, ToggleCurrentActions } from '../screenplay/debugger/current-actions/tasks';
import {
  AddWatch,
  ClearEvents,
  ExpandWatch,
  CloseDebugger,
  DockDebugger,
  EnableDebugging,
  OpenActionPicker,
  OpenDebugger,
  OpenEventsTab,
  PressF12ToClose,
  ResumeDebugger,
  SelectCodeTab,
  SelectLocation,
  StepDebugger,
  ToggleLocationBreakpoint,
  ToggleWatchPause,
  TogglePauseOnLinks,
} from '../screenplay/debugger/tasks';
import {
  HoverToken,
  HoverTokenWithin,
  PinFromHover,
  RevealEditorLine,
  ToggleLineBreakpoint,
} from '../screenplay/debugger/editor/tasks';
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
  syntax: SYNTAX,
  acts: ACTS,
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

/** From a clean app: the debugger fixture game in its `acts` location, which lists the `placed`, `detached` and `back` acts. */
const InActs = () => [...OpenDebuggerGame(), ClickAction(ACTION.acts), SeeMainTextContaining(ACTS.start)];

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
const RunSyntax = () => [
  OpenDebugger(),
  ClickAction(ACTION.syntax),
  SeeMainTextContaining(SYNTAX.end),
  SelectLocation(LOCATION.syntax),
  SeeEditorCode(SYNTAX.firstLine),
];

// `syntax` writes its end text only if the engine ran every statement in it without an error.
scenario('the syntax location runs every statement kind to its end', async (player) => {
  await player.attemptsTo(...OpenDebuggerGame(), ClickAction(ACTION.syntax), SeeMainTextContaining(SYNTAX.end));
});

scenario(
  'hovering a Cyrillic name, each field segment and a <<…>> field in a block shows their values',
  async (player) => {
    await player.attemptsTo(
      ...OpenDebuggerGame(),
      ...RunSyntax(),
      HoverToken(SYNTAX.token.cyrillic),
      SeeHoverText(SYNTAX.hover.cyrillic),
      HoverToken(SYNTAX.token.base),
      SeeHoverText(SYNTAX.hover.base),
      HoverToken(SYNTAX.token.field),
      SeeHoverText(SYNTAX.hover.field),
      HoverToken(SYNTAX.token.leaf),
      SeeHoverText(SYNTAX.hover.leaf),
      HoverToken(SYNTAX.token.s),
      SeeHoverText(SYNTAX.hover.s),
      HoverTokenWithin(SYNTAX.token.mid), // a function, not a variable: the hover of `$S` closes and none opens
      SeeNoHover(),
      RevealEditorLine(SYNTAX.blockLine), // the block's line may sit at the editor's lower edge
      HoverToken(SYNTAX.token.leaf, 'last'), // the `C` of `'in <<A.B.C>>'` in the block
      SeeHoverText(SYNTAX.hover.leaf),
    );
  },
);

scenario('hovering a field inside <<…>> in the description shows its value', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    ...RunSyntax(),
    SelectCodeTab('description'),
    SeeEditorCode(SYNTAX.description),
    HoverToken(SYNTAX.token.leaf),
    SeeHoverText(SYNTAX.hover.leaf),
  );
});

scenario('pinning a field or an item watches its path, and an indexed name is rejected', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    ...RunSyntax(),
    HoverToken(SYNTAX.token.leaf),
    SeeHoverText(SYNTAX.hover.leaf),
    PinFromHover(),
    SeeWatchValue(SYNTAX.watch.leaf, SYNTAX.watch.leafValue),
    HoverToken(SYNTAX.token.item),
    SeeHoverText(SYNTAX.hover.item),
    PinFromHover(),
    SeeWatchValue(SYNTAX.watch.item, SYNTAX.watch.itemValue),
    AddWatch(SYNTAX.watch.invalid),
    SeeWatchInvalid(),
  );
});

scenario(
  'hovering a field of a keyed item, a quoted field and a field of a prefixed base shows their values, and pins the first',
  async (player) => {
    const { paths } = SYNTAX;
    await player.attemptsTo(
      ...OpenDebuggerGame(),
      ...RunSyntax(),
      RevealEditorLine(paths.line), // the field path lines sit below the first screen
      // Top line first: a hover opens above its line, so it never covers the next token clicked.
      HoverToken(paths.token.itemField),
      SeeHoverText(paths.hover.itemField),
      PinFromHover(),
      SeeWatchValue(paths.watch.itemField, paths.watch.itemFieldValue),
      HoverToken(paths.token.quoted, 'last'),
      SeeHoverText(paths.hover.quoted),
      HoverToken(paths.token.prefixed, 'last'),
      SeeHoverText(paths.hover.prefixed),
    );
  },
);

scenario('break on change of a field path pauses and names the path', async (player) => {
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    EnableDebugging(),
    AddWatch(SYNTAX.watch.leaf),
    ToggleWatchPause(SYNTAX.watch.leaf),
    ClickAction(ACTION.syntax),
    SeeDebugStatus('paused'),
    SeeChangeNotice(SYNTAX.change),
    SeeChangeNotice(SYNTAX.changeAt),
  );
});

// The editor numbers lines as the engine does, so a breakpoint set on an editor line stops on that engine line, also
// after a joined ` _` continuation, a multi-line string and a multi-line comment.
scenario('a line breakpoint after a multi-line statement stops on that line', async (player) => {
  const { continuation, string, comment } = SYNTAX.after;
  await player.attemptsTo(
    ...OpenDebuggerGame(),
    OpenDebugger(),
    EnableDebugging(),
    SelectLocation(LOCATION.syntax),
    SeeEditorCode(SYNTAX.firstLine),
    ToggleLineBreakpoint(continuation.line),
    ToggleLineBreakpoint(string.line),
    ToggleLineBreakpoint(comment.line),
    ClickAction(ACTION.syntax),
    SeeDebugStatus('paused'),
    SeeExecutionLine(LOCATION.syntax, continuation.line),
    SeeCurrentLineText(continuation.code),
    ResumeDebugger(),
    SeeExecutionLine(LOCATION.syntax, string.line),
    SeeCurrentLineText(string.code),
    ResumeDebugger(),
    SeeExecutionLine(LOCATION.syntax, comment.line),
    SeeCurrentLineText(comment.code),
    ResumeDebugger(),
    SeeMainTextContaining(SYNTAX.end),
  );
});

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
