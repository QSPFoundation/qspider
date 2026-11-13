import { DEBUGGER_GAME } from '../fixtures/debugger-game';
import { SeeGameStartedContaining, SeeStartupFinished } from '../screenplay/common/checks';
import {
  SeeDebuggerDocked,
  SeeDebuggerOpen,
  SeeDebugStatus,
  SeeEditorCode,
  SeeEventsAbove,
  SeeEventsCount,
  SeeExecutionLine,
  SeePauseOnLinks,
} from '../screenplay/debugger/checks';
import {
  ClearEvents,
  CloseDebugger,
  DockDebugger,
  EnableDebugging,
  OpenDebugger,
  OpenEventsTab,
  PressF12ToClose,
  ResumeDebugger,
  SelectCodeTab,
  SelectLocation,
  StepDebugger,
  ToggleLocationBreakpoint,
  TogglePauseOnLinks,
} from '../screenplay/debugger/tasks';
import { SeeMainTextContaining, SeeMainTextWithout } from '../screenplay/game/checks';
import { ClickAction, ReturnToShelf } from '../screenplay/game/tasks';
import { ContentMark } from '../screenplay/content/elements';
import { ClickContent } from '../screenplay/content/tasks';
import { SeeShelfIncludes, SeeShelfWritesSettled } from '../screenplay/shelf/checks';
import { OpenFromShelf } from '../screenplay/shelf/tasks';
import { LoadGame, RestartPlayer, StartPlayer } from '../screenplay/support/operate-player';
import { BlockOrigin } from '../screenplay/support/delay-requests';
import { scenario } from '../screenplay/support/scenario';
import { SeeNoScriptFrom } from '../screenplay/support/script-sources';

const { location: LOCATION, action: ACTION, text: TEXT, code: CODE } = DEBUGGER_GAME;
const EDITOR_CDN = 'cdn.jsdelivr.net';

/** From a clean app: opens the debugger fixture game at its start (its main text holds a link beside the start text). */
const OpenDebuggerGame = () => [
  StartPlayer(),
  SeeStartupFinished(),
  LoadGame(DEBUGGER_GAME.path),
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
