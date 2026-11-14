import { Task } from '@serenity-js/core';
import { Key, Press } from '@serenity-js/web';
import { ClickAt } from '../../support/click-at';
import { EditorLineMargin, EditorToken, EditorTokenWithin, EditorViewport, HoverPinLink } from './elements';

// Clicks in the editor go through ClickAt, never Serenity's Click: see support/click-at.ts.

/** Monaco's "Show Hover" chord (Ctrl+K, Ctrl+I): keyboard only, so it is portable (no pointer movement). */
const ShowHover = () => [Press.the(Key.Control, 'k'), Press.the(Key.Control, 'i')];

/** Opens the editor hover on the token `text`: clicks the token (the cursor lands in it), then Show Hover. */
export const HoverToken = (text: string, occurrence: 'first' | 'last' = 'first'): Task =>
  Task.where(
    `#actor opens the hover of the ${occurrence} "${text}"`,
    ClickAt(EditorToken(text, occurrence)),
    ...ShowHover(),
  );

/**
 * As HoverToken, for a token that shares its span with its neighbours (` = $MID`): the click lands mid-span, next
 * to or inside the token.
 */
export const HoverTokenWithin = (text: string): Task =>
  Task.where(`#actor opens the hover of "${text}"`, ClickAt(EditorTokenWithin(text)), ...ShowHover());

/** Pins the hovered variable to the watch list with the hover's Pin link. */
export const PinFromHover = (): Task => Task.where('#actor pins the hovered variable', ClickAt(HoverPinLink));

/**
 * Brings editor line `line` to the middle of the editor with Monaco's Go to Line (a click in the editor to focus it,
 * then Ctrl+G, the number, Enter), so that a click on it does not need a scroll. Run it with no hover open: the
 * focusing click lands in the middle of the editor.
 */
export const RevealEditorLine = (line: number): Task =>
  Task.where(
    `#actor brings line ${line} into view`,
    ClickAt(EditorViewport),
    Press.the(Key.Control, 'g'),
    ...[...String(line)].map((digit) => Press.the(digit)),
    Press.the(Key.Enter),
  );

/**
 * Toggles the breakpoint on editor line `line`: brings the line into view, then clicks its glyph margin (the left
 * 18 px of its margin, which Monaco reads from the click's position).
 */
export const ToggleLineBreakpoint = (line: number): Task =>
  Task.where(
    `#actor toggles the breakpoint on line ${line}`,
    RevealEditorLine(line),
    ClickAt(EditorLineMargin(line), { x: 8, y: 8 }),
  );
