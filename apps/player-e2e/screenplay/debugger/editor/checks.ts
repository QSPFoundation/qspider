import { Question, type Answerable, Task } from '@serenity-js/core';
import { equals, includes } from '@serenity-js/assertions';
import { Attribute, type PageElement, Text } from '@serenity-js/web';
import { seeEventually } from '../../support/see-eventually';
import {
  CurrentLineOverlay,
  DebugEditorLines,
  DebugEditorTitle,
  EditorViewLines,
  HoverContent,
  HoverContents,
} from './elements';

/** The `top` of a Monaco line from its inline style (`top:350px;…`), the one link between a line and its overlay. */
const topOf = (style: string | null): string | undefined => /top:\s*(-?[\d.]+)px/.exec(style ?? '')?.[1];

/** The text of the rendered line at the same `top` as `overlay`, spaces normalised (Monaco spells no-break spaces). */
const LineTextBeside = (overlay: Answerable<PageElement>) =>
  Question.about('the text of the line beside the current-line overlay', async (actor) => {
    const top = topOf(await actor.answer(Attribute.called('style').of(overlay)));
    for (const line of await actor.answer(EditorViewLines)) {
      if (top !== undefined && topOf(await line.attribute('style')) === top) {
        return (await line.text()).replace(/\s+/g, ' ').trim();
      }
    }
    throw new Error(`no rendered line at top ${String(top)}`);
  });

/** The editor shows `code`; Monaco spells spaces as no-break spaces, so both sides are normalised. */
export const SeeEditorCode = (code: string): Task =>
  seeEventually(
    DebugEditorLines,
    (e) => Text.of(e).replace(/\s+/g, ' '),
    includes(code.replace(/\s+/g, ' ')),
    `#actor sees the debugger editor show ${code}`,
  );

/** The editor hover's text contains `text`. */
export const SeeHoverText = (text: string): Task =>
  seeEventually(
    HoverContent,
    (e) => Text.of(e).replace(/\s+/g, ' '),
    includes(text),
    `#actor sees the hover show ${text}`,
  );

/**
 * No hover shows. An absence check: it passes as soon as none shows, so it proves only that the Show Hover just
 * pressed opened none by the time it is read.
 */
export const SeeNoHover = (): Task =>
  seeEventually(DebugEditorLines, () => HoverContents.count(), equals(0), '#actor sees no hover');

/** The line carrying the current-line decoration (the execution line) reads `text`. */
export const SeeCurrentLineText = (text: string): Task =>
  seeEventually(
    CurrentLineOverlay,
    (e) => LineTextBeside(e),
    equals(text),
    `#actor sees the current line read ${text}`,
  );

/** The title above the editor reads `text`. */
export const SeeEditorTitle = (text: string): Task =>
  seeEventually(DebugEditorTitle, (e) => Text.of(e).trim(), equals(text), `#actor sees the editor titled ${text}`);
