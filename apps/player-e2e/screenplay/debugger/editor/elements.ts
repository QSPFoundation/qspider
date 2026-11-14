import { equals, includes, matches } from '@serenity-js/assertions';
import { By, PageElement, PageElements, Text } from '@serenity-js/web';

// The debugger's code editor (Monaco, inside `data-qa="debug-editor"`). The editor is third-party and has no markers:
// its own DOM is located here by Monaco's classes, and by the decoration classes libs/debugger gives it.

/** The editor's rendered lines (Monaco's view lines). */
export const DebugEditorLines = PageElement.located(By.css('[data-qa="debug-editor"] .view-lines')).describedAs(
  'debugger editor text',
);

/** The editor's visible text area (Monaco's overflow guard): its centre is in view whatever the editor scrolled to. */
export const EditorViewport = PageElement.located(By.css('[data-qa="debug-editor"] .overflow-guard')).describedAs(
  'editor viewport',
);

/** Each rendered line of the editor; its `style` carries the line's `top`. Monaco renders only the lines in view. */
export const EditorViewLines = PageElements.located(By.css('[data-qa="debug-editor"] .view-line')).describedAs(
  'editor lines',
);

/** The editor's leaf token spans. Neighbouring tokens Monaco colours alike share a span (`A.`, ` = $MID`). */
const EditorTokens = PageElements.located(By.css('[data-qa="debug-editor"] .view-line > span > span'));

/** A pattern for text that starts with `text`, where a space may be Monaco's no-break space. */
const startingWith = (text: string) =>
  new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '[ \u00a0]')}`, 'u');

/** The first (or last) token span of the editor whose text starts with `text` (spaces as Monaco spells them). */
export const EditorToken = (text: string, occurrence: 'first' | 'last' = 'first') => {
  const tokens = EditorTokens.where(Text, matches(startingWith(text)));
  return (occurrence === 'last' ? tokens.last() : tokens.first()).describedAs(`${occurrence} editor token "${text}"`);
};

/** The first token span of the editor whose text contains `text`: for a token that shares its span (` = $MID`). */
export const EditorTokenWithin = (text: string) =>
  EditorTokens.where(Text, includes(text)).first().describedAs(`editor span holding "${text}"`);

/**
 * The margin of editor line `line` (Monaco's margin overlay line, which holds the line number). Its left 18 px are
 * the glyph margin, where a click toggles a breakpoint. Rendered only while the line is in view.
 */
export const EditorLineMargin = (line: number) =>
  PageElements.located(By.css('[data-qa="debug-editor"] .margin-view-overlays > div'))
    .where(Text, equals(String(line)))
    .first()
    .describedAs(`margin of editor line ${line}`);

/** The overlay line that carries the current-line decoration (libs/debugger's `qsp-current-line-decoration`). */
export const CurrentLineOverlay = PageElement.located(
  By.css('[data-qa="debug-editor"] .view-overlays > div:has(> .qsp-current-line-decoration)'),
).describedAs('current line overlay');

/** Monaco's hover widget content (the widget lives inside the editor's DOM). */
export const HoverContent = PageElement.located(
  By.css('[data-qa="debug-editor"] .monaco-hover:not(.hidden) .monaco-hover-content'),
).describedAs('editor hover');

/** Every shown hover content: none while no hover shows. */
export const HoverContents = PageElements.located(
  By.css('[data-qa="debug-editor"] .monaco-hover:not(.hidden) .monaco-hover-content'),
).describedAs('editor hovers');

/** The hover's Pin link: a markdown link to the pin command (`command:<id>?...`, as Monaco renders it). */
export const HoverPinLink = PageElement.located(
  By.css('[data-qa="debug-editor"] .monaco-hover-content a[data-href^="command:qsp.debugger.pinVariable"]'),
).describedAs('hover pin link');
