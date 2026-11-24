import { By, PageElement, PageElements } from '@serenity-js/web';

// The debugger's code editor (Monaco, inside `data-qa="debug-editor"`). The editor is third-party and has no markers:
// its own DOM is located here by Monaco's classes, and by the decoration classes libs/debugger gives it.
//
// Elements picked by their text are located with one XPath query, never with `.where(Text, …)`: that reads the text
// of every candidate over its own WebDriver call (a screenful of tokens took 1.4 s per lookup on CI), and Monaco
// re-renders and reuses its line elements meanwhile, so the element found can be showing another line by the click.

/** An XPath string literal for `text`, whatever quotes it holds. */
const xpathLiteral = (text: string): string => {
  if (!text.includes('"')) return `"${text}"`;
  if (!text.includes("'")) return `'${text}'`;
  return `concat(${text
    .split('"')
    .map((part) => `"${part}"`)
    .join(`, '"', `)})`;
};

/** An XPath test for an element having the CSS class `name`. */
const hasClass = (name: string): string => `contains(concat(" ", normalize-space(@class), " "), " ${name} ")`;

/** The text of the context node with Monaco's no-break spaces as plain spaces, as WebDriver's element text reads it. */
const SPACED_TEXT = 'translate(., "\u00a0", " ")';

const EDITOR = '//*[@data-qa="debug-editor"]';

/** Monaco's per-line margin elements (line number, glyph and margin decorations), for the lines in view. */
const MARGIN_LINES = `${EDITOR}//div[${hasClass('margin-view-overlays')}]/div`;

/** The editor's rendered lines (Monaco's view lines). */
export const DebugEditorLines = PageElement.located(By.css('[data-qa="debug-editor"] .view-lines')).describedAs(
  'debugger editor text',
);

/** The title above the editor: what it shows (`Location: start`, `Current action: go`). */
export const DebugEditorTitle = PageElement.located(By.css('[data-qa="debug-editor-title"]')).describedAs(
  'debugger editor title',
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
const EDITOR_TOKENS = `${EDITOR}//div[${hasClass('view-line')}]/span/span`;

/** The first (or last) token span of the editor whose text starts with `text` (spaces as Monaco spells them). */
export const EditorToken = (text: string, occurrence: 'first' | 'last' = 'first') =>
  PageElement.located(
    By.xpath(
      `(${EDITOR_TOKENS}[starts-with(${SPACED_TEXT}, ${xpathLiteral(text)})])[${occurrence === 'last' ? 'last()' : '1'}]`,
    ),
  ).describedAs(`${occurrence} editor token "${text}"`);

/** The first token span of the editor whose text contains `text`: for a token that shares its span (` = $MID`). */
export const EditorTokenWithin = (text: string) =>
  PageElement.located(By.xpath(`(${EDITOR_TOKENS}[contains(${SPACED_TEXT}, ${xpathLiteral(text)})])[1]`)).describedAs(
    `editor span holding "${text}"`,
  );

/**
 * The margin of editor line `line` (Monaco's margin overlay line, which holds the line number). Its left 18 px are
 * the glyph margin, where a click toggles a breakpoint. Rendered only while the line is in view.
 */
export const EditorLineMargin = (line: number) =>
  PageElement.located(
    By.xpath(`(${MARGIN_LINES}[div[${hasClass('line-numbers')}][normalize-space(.) = "${line}"]])[1]`),
  ).describedAs(`margin of editor line ${line}`);

/**
 * The line-number cell of every line in view that has a breakpoint, enabled or disabled (libs/debugger's margin
 * decorations `qsp-breakpoint-margin-enabled` / `-disabled`).
 */
export const BreakpointLineNumbers = (state: 'enabled' | 'disabled') =>
  PageElements.located(
    By.xpath(`${MARGIN_LINES}[div[${hasClass(`qsp-breakpoint-margin-${state}`)}]]/div[${hasClass('line-numbers')}]`),
  ).describedAs(`line numbers of ${state} breakpoints`);

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
