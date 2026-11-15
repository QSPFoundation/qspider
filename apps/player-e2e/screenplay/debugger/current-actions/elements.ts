import { By, PageElement, PageElements } from '@serenity-js/web';

// The debugger's "Current actions" section (libs/debugger, current-actions.tsx): the actions the player sees now.

/** The section; it stays rendered while collapsed. */
export const CurrentActionsSection = PageElement.located(By.css('[data-qa="debug-current-actions"]')).describedAs(
  'current actions section',
);

/** The button that collapses and expands the section. */
export const CurrentActionsToggle = PageElement.located(By.css('[data-qa="debug-current-actions-toggle"]')).describedAs(
  'current actions toggle',
);

/** Every listed entry, in order; none while the section is collapsed. `data-action` is the action's name. */
export const CurrentActionEntries = PageElements.located(By.css('[data-qa="debug-current-action"]')).describedAs(
  'current action entries',
);

/** An entry by the action's name; `data-running` is `true` while that action runs. */
export const CurrentActionEntry = (name: string) =>
  PageElement.located(By.css(`[data-qa="debug-current-action"][data-action="${name}"]`)).describedAs(
    `current action "${name}"`,
  );
