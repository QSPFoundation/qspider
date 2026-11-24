// Shared steps and fixture names of the debugger scenarios (debugger-*.scenario.ts), split by area so the
// desktop shards can balance them and a failure reruns one area, not the whole debugger suite.
import { DEBUGGER_GAME } from '../fixtures/debugger-game';
import { SeeGameStartedContaining, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeDebugStatus, SeeExecutionLine } from '../screenplay/debugger/checks';
import { EnableDebugging, OpenDebugger, StepDebugger, ToggleLocationBreakpoint } from '../screenplay/debugger/tasks';
import { SeeMainTextContaining } from '../screenplay/game/checks';
import { ClickAction, PressEscape } from '../screenplay/game/tasks';
import { PauseScreen, RestartButton } from '../screenplay/pause/elements';
import { ClickWhenPresent, waitUntilPresent } from '../screenplay/support/presence';
import { LoadGame, StartPlayer } from '../screenplay/support/operate-player';

export const {
  location: LOCATION,
  action: ACTION,
  text: TEXT,
  code: CODE,
  vars: VARS,
  hits: HITS,
  hold: HOLD,
  syntax: SYNTAX,
  acts: ACTS,
  loop: LOOP,
} = DEBUGGER_GAME;
export const EDITOR_CDN = 'cdn.jsdelivr.net';
/** Past several runs of qspider's 500 ms counter, each of which refreshes the watch with nothing to report. */
export const PAST_COUNTER_RUNS = 2500;

/** From a clean app: opens the debugger fixture game at its start (its main text holds a link beside the start text). */
export const OpenDebuggerGame = () => [
  StartPlayer(),
  SeeStartupFinished(),
  LoadGame(DEBUGGER_GAME.path),
  SeeGameStartedContaining(TEXT.start),
];

/** From a clean app: the debugger fixture game in its `acts` location, which lists the `placed`, `detached` and `back` acts. */
export const InActs = () => [...OpenDebuggerGame(), ClickAction(ACTION.acts), SeeMainTextContaining(ACTS.start)];

/** From a clean app: the debugger fixture game in its `loop` location, which lists the `again` and `swap` acts. */
export const InLoop = () => [...OpenDebuggerGame(), ClickAction(ACTION.loop), SeeMainTextContaining(LOOP.start)];

/** Steps the paused game `n` times, one `vars` line each. */
export const StepTimes = (n: number) => Array.from({ length: n }, () => StepDebugger());

/** From the debugger game's start: debug mode on, a breakpoint on `vars`, `vars` run: paused at its first line. */
export const PauseInVars = () => [
  OpenDebugger(),
  EnableDebugging(),
  ToggleLocationBreakpoint(LOCATION.vars),
  ClickAction(ACTION.vars),
  SeeDebugStatus('paused'),
  SeeExecutionLine(LOCATION.vars, 1),
];

/** Restarts the game through the pause screen (Escape, then Restart). */
export const RestartFromPauseScreen = () => [
  PressEscape(),
  waitUntilPresent(PauseScreen),
  ClickWhenPresent(RestartButton),
  SeeGameStartedContaining(TEXT.start),
];
