import { type Answerable, d, Interaction } from '@serenity-js/core';
import { Enter, type PageElement } from '@serenity-js/web';

/**
 * Types `text` into the text field `element`, replacing its content. Serenity's Enter works through
 * the web driver on both targets (Playwright, WebdriverIO), so no per-target OperatePlayer method is needed.
 */
export const TypeInto = (text: string, element: Answerable<PageElement>): Interaction =>
  Interaction.where(d`#actor types "${text}" into ${element}`, (actor) =>
    Enter.theValue(text).into(element).performAs(actor),
  );
