import { Interaction, type Answerable } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { scriptResult } from './page-script';

// The one probe file that writes to the page: it scrolls, as a player does with the wheel before clicking
// something in a scrolled panel. Nothing else changes. Like page-script.ts, the function is serialised into the
// page (self-contained, plain data back) and runs only through scriptResult.

/**
 * Scrolls the first of `elements` that renders (has a box, is not visibility-hidden) with the text `label`
 * (innerText, whitespace collapsed) into view inside its scroll containers. 'nearest': nothing moves when it is
 * already in view. False when none matches (yet).
 */
function scrollLabelledIntoView(label: string, ...elements: HTMLElement[]): boolean {
  const target = elements.find(
    (element) =>
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility === 'visible' &&
      element.innerText.replace(/\s+/g, ' ').trim() === label,
  );
  if (!target) return false;
  target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  return true;
}

/**
 * Scrolls the rendered element of `elements` labelled `label` into view inside its panel (see above). It reads the
 * label from the layout (innerText), not through WebDriver, which answers no text for an element scrolled out of
 * view in some drivers. Does nothing when none matches yet: callers poll (ClickWhenPresent's `before`).
 */
export const ScrollLabelledIntoView = (elements: Answerable<PageElement[]>, label: string): Interaction =>
  Interaction.where(`#actor scrolls "${label}" into view`, async (actor) => {
    const found = await actor.answer(elements);
    if (found.length === 0) return;
    await actor.answer(scriptResult(`scrolling "${label}" into view`, scrollLabelledIntoView, label, ...found));
  });
