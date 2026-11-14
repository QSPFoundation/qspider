import { AssertionError, type Answerable, d, Interaction } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { describeError, isMissingElementError } from './element-errors';
import { type ClickPoint, OperatePlayer } from './operate-player';
import { pollUntil } from './polling';
import { INTERACTION_TIMEOUT } from './timeouts';

/**
 * Clicks `element` at `at` (CSS pixels from its top-left corner) or at its centre, once it is present, through the
 * target's own pointer click (OperatePlayer.clickAt), without scrolling it into view first. For the debugger's
 * editor: Serenity's Click scrolls the element into view first, which WebdriverIO (desktop) does with a wheel event,
 * and Monaco takes a wheel event as a scroll of the editor, so the element moves away before the click. Also for a
 * spot no element of its own marks (the glyph margin: Monaco reads it from the click's position). Retries while the
 * element is missing (re-rendered between lookup and click), as ClickWhenPresent does.
 */
export const ClickAt = (element: Answerable<PageElement>, at?: ClickPoint): Interaction =>
  Interaction.where(d`#actor clicks ${element}${at ? ` at ${at.x}, ${at.y}` : ''}`, async (actor) => {
    const { met, lastError } = await pollUntil(
      actor,
      d`whether ${element} could be clicked`,
      async (a) => {
        if (!(await (await a.answer(element)).isPresent())) return false;
        await OperatePlayer.as(a).clickAt(a, element, at);
        return true;
      },
      isMissingElementError,
    );
    if (!met) {
      const last = lastError === undefined ? '' : `; last error: ${describeError(lastError)}`;
      throw new AssertionError(
        `Timed out after ${INTERACTION_TIMEOUT.toString()}: could not click ${d`${element}`}, it was not present${last}`,
      );
    }
  });
