import { startsWith } from '@serenity-js/assertions';
import { By, PageElement, PageElements, Text } from '@serenity-js/web';

// The debugger panel (libs/debugger) is app-shell UI: its controls are located by `data-qa`.

/** The debugger's layout wrapper: it is there whenever a game runs. Its class names the dock (debugger-left). */
export const DebuggerLayout = PageElement.located(By.css('[data-qa="debugger-layout"]')).describedAs('debugger layout');

/** The debugger panel; `data-dock` is `left`, `bottom` or `right`. Not rendered while the debugger is closed. */
export const DebugPanel = PageElement.located(By.css('[data-qa="debug-panel"]')).describedAs('debugger panel');

export const DebugCloseButton = PageElement.located(By.css('[data-qa="debug-close"]')).describedAs(
  'debugger close button',
);

export const DebugDockButton = (dock: 'left' | 'bottom' | 'right') =>
  PageElement.located(By.css(`[data-qa="debug-dock-${dock}"]`)).describedAs(`dock ${dock} button`);

/** A location's row in the list, by the location's name. */
export const DebugLocation = (name: string) =>
  PageElement.located(By.css(`[data-qa="debug-location"][data-location="${name}"]`)).describedAs(
    `location "${name}" in the debugger`,
  );

/** The breakpoint button of a location's row. */
export const DebugBreakpointButton = (name: string) =>
  PageElement.located(By.css('[data-qa="debug-breakpoint"]'))
    .of(DebugLocation(name))
    .describedAs(`breakpoint button of "${name}"`);

/** The tab of a code type: `location`, `description` or `action` (the last only when the location has actions). */
export const DebugCodeTab = (type: 'location' | 'description' | 'action') =>
  PageElement.located(By.css(`[data-qa="debug-code-tab"][data-code-type="${type}"]`)).describedAs(`${type} code tab`);

/** The editor's rendered lines (Monaco's view lines). */
export const DebugEditorLines = PageElement.located(By.css('[data-qa="debug-editor"] .view-lines')).describedAs(
  'debugger editor text',
);

export const DebugToggle = PageElement.located(By.css('[data-qa="debug-toggle"]')).describedAs('debug enable toggle');

/** The debug status; `data-state` is `disabled`, `running` or `paused`. */
export const DebugStatus = PageElement.located(By.css('[data-qa="debug-status"]')).describedAs('debug status');

export const DebugResumeButton = PageElement.located(By.css('[data-qa="debug-resume"]')).describedAs('resume button');
export const DebugStepButton = PageElement.located(By.css('[data-qa="debug-step"]')).describedAs('step button');

export const PauseOnLinksToggle = PageElement.located(By.css('[data-qa="debug-pause-links"]')).describedAs(
  'pause on links toggle',
);

/** The pause-on-links state; `data-state` is `on` or `off`. */
export const PauseOnLinksStatus = PageElement.located(By.css('[data-qa="debug-pause-links-status"]')).describedAs(
  'pause on links status',
);

/** The Execution tab's current position: `data-location` and `data-line`. Present once the game has run a line. */
export const DebugCurrentExecution = PageElement.located(By.css('[data-qa="debug-current-execution"]')).describedAs(
  'current execution',
);

export const DebugEventsTab = PageElement.located(By.css('[data-qa="debug-tab-events"]')).describedAs('events tab');

/** The event count; `data-count` is the number. Rendered only on the events tab. */
export const DebugEventsCount = PageElement.located(By.css('[data-qa="debug-events-count"]')).describedAs(
  'events count',
);

export const DebugEventsClearButton = PageElement.located(By.css('[data-qa="debug-events-clear"]')).describedAs(
  'clear events button',
);

/**
 * The first token span of the editor (a leaf span of a view line: Monaco's own DOM, located by its classes) whose
 * text starts with `text`. A token is its own span (`$WHO`, `%REC`, `#U`) except a plain name, which shares its
 * span with the operator after it (`GOLD =`).
 */
export const EditorToken = (text: string, occurrence: 'first' | 'last' = 'first') => {
  const tokens = PageElements.located(By.css('[data-qa="debug-editor"] .view-line > span > span')).where(
    Text,
    startsWith(text),
  );
  return (occurrence === 'last' ? tokens.last() : tokens.first()).describedAs(`${occurrence} editor token "${text}"`);
};

/** Monaco's hover widget content (the widget lives inside the editor's DOM). */
export const HoverContent = PageElement.located(
  By.css('[data-qa="debug-editor"] .monaco-hover:not(.hidden) .monaco-hover-content'),
).describedAs('editor hover');

/** The hover's Pin link: a markdown link to the pin command (`command:<id>?...`, as Monaco renders it). */
export const HoverPinLink = PageElement.located(
  By.css('[data-qa="debug-editor"] .monaco-hover-content a[data-href^="command:qsp.debugger.pinVariable"]'),
).describedAs('hover pin link');

export const WatchPanel = PageElement.located(By.css('[data-qa="debug-watch-panel"]')).describedAs('watch panel');
export const WatchInput = PageElement.located(By.css('[data-qa="debug-watch-input"]')).describedAs('watch input');
export const WatchAddButton = PageElement.located(By.css('[data-qa="debug-watch-add"]')).describedAs(
  'watch add button',
);

/** A watch entry by the name as entered, upper-cased; `data-changed` is `true` or `false`. */
export const WatchEntry = (name: string) =>
  PageElement.located(By.css(`[data-qa="debug-watch-entry"][data-name="${name.toUpperCase()}"]`)).describedAs(
    `watch entry "${name.toUpperCase()}"`,
  );

/** The formatted value inside an entry. */
export const WatchValue = (name: string) =>
  PageElement.located(By.css('[data-qa="debug-watch-value"]'))
    .of(WatchEntry(name))
    .describedAs(`watch value of "${name.toUpperCase()}"`);

/** The pause toggle inside an entry; `data-state` is `on` or `off`. */
export const WatchPauseToggle = (name: string) =>
  PageElement.located(By.css('[data-qa="debug-watch-pause-toggle"]'))
    .of(WatchEntry(name))
    .describedAs(`watch pause toggle of "${name.toUpperCase()}"`);

/** The notice naming the change that paused the game. */
export const ChangeNotice = PageElement.located(By.css('[data-qa="debug-change-notice"]')).describedAs('change notice');

/** The expand button of a watch entry. */
export const WatchExpandButton = (name: string) =>
  PageElement.located(By.css('[data-qa="debug-watch-expand"]'))
    .of(WatchEntry(name))
    .describedAs(`watch expand button of "${name.toUpperCase()}"`);

/** A row of an expanded entry, by its key (a field name, or the index of an item). */
export const WatchRow = (name: string, key: string) =>
  PageElement.located(By.css(`[data-qa="debug-watch-row"][data-key="${key}"]`))
    .of(WatchEntry(name))
    .describedAs(`row "${key}" of watch entry "${name.toUpperCase()}"`);
