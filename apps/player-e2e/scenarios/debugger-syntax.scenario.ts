// The debugger on every QSP statement kind the editor must read as the engine does: fields, keyed items, <<…>> blocks and multi-line statements.
// Shared steps: debugger-steps.ts.
import {
  SeeDebugStatus,
  SeeChangeNotice,
  SeeExecutionLine,
  SeeWatchInvalid,
  SeeWatchValue,
} from '../screenplay/debugger/checks';
import { SeeCurrentLineText, SeeEditorCode, SeeHoverText, SeeNoHover } from '../screenplay/debugger/editor/checks';
import {
  AddWatch,
  EnableDebugging,
  OpenDebugger,
  ResumeDebugger,
  SelectCodeTab,
  SelectLocation,
  ToggleWatchPause,
} from '../screenplay/debugger/tasks';
import {
  HoverToken,
  HoverTokenWithin,
  PinFromHover,
  RevealEditorLine,
  ToggleLineBreakpoint,
} from '../screenplay/debugger/editor/tasks';
import { SeeMainTextContaining } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { scenario } from '../screenplay/support/scenario';
import { LOCATION, ACTION, SYNTAX, OpenDebuggerGame } from './debugger-steps';

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
