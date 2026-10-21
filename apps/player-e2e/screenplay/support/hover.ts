import { type Answerable, d, Interaction } from '@serenity-js/core';
import { Hover as HoverOn, type PageElement } from '@serenity-js/web';
import { waitUntilPresent } from './presence';

/**
 * Moves the pointer over `element` once it is present. Serenity's Hover works through the web
 * driver on both targets (Playwright, WebdriverIO).
 */
export const Hover = (element: Answerable<PageElement>): Interaction =>
  Interaction.where(d`#actor hovers over ${element}`, async (actor) => {
    await waitUntilPresent(element).performAs(actor);
    await HoverOn.over(element).performAs(actor);
  });

/**
 * Moves the pointer onto `neutral` (an element with no handler of its own), so the element hovered
 * before receives `mouseleave`.
 */
export const MoveAway = (neutral: Answerable<PageElement>): Interaction => Hover(neutral);
