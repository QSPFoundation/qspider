import {
  AssertionError,
  type Answerable,
  d,
  Interaction,
  Question,
  type QuestionAdapter,
  Wait,
} from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Click, type PageElement } from '@serenity-js/web';
import { asError, describeError, isMissingElementError } from './element-errors';
import { pollUntil } from './polling';
import { INTERACTION_TIMEOUT, POLLING_INTERVAL } from './timeouts';

// The desktop waiting trap, in one place. WebKitWebDriver (desktop) answers a read of a missing
// element with a raw "no such element" error instead of false, and Serenity's isPresent() /
// Wait.until / Ensure.eventually pass that error straight through (they retry only on
// ListItemNotFoundError). So reads of an element that may not be rendered yet, or may be
// re-rendering, go through these helpers or seeEventually.

/** Whether `element` is present; false when it is missing or the read fails. */
export const PresenceOf = (element: Answerable<PageElement>): QuestionAdapter<boolean> =>
  Question.about(d`the presence of ${element}`, async (actor) => {
    try {
      return await (await actor.answer(element)).isPresent();
    } catch {
      return false;
    }
  });

/** Waits until `element` is present. Tasks use it to settle after their own action. */
export const waitUntilPresent = (element: Answerable<PageElement>) =>
  Wait.upTo(INTERACTION_TIMEOUT).until(PresenceOf(element), equals(true)).pollingEvery(POLLING_INTERVAL);

/**
 * Whether `element` is gone. Only a missing element counts as gone: isPresent() false, or a
 * "no such element" / stale-element error. Any other read error surfaces.
 * Never pass a `.where()`-filtered element (such as ShelfCard): isMissingElementError counts a
 * filtered list's wrapped error as missing, so an item re-rendering mid-read would read as gone.
 */
export const AbsenceOf = (element: Answerable<PageElement>): QuestionAdapter<boolean> =>
  Question.about(d`the absence of ${element}`, async (actor) => {
    try {
      return !(await (await actor.answer(element)).isPresent());
    } catch (error) {
      if (isMissingElementError(error)) return true;
      throw asError(error);
    }
  });

/** Waits until `element` is gone (see AbsenceOf; not for `.where()`-filtered elements). */
export const waitUntilAbsent = (element: Answerable<PageElement>) =>
  Wait.upTo(INTERACTION_TIMEOUT).until(AbsenceOf(element), equals(true)).pollingEvery(POLLING_INTERVAL);

/**
 * Clicks `element` once it is present. While it is missing (not rendered yet, or re-rendered
 * between lookup and click), retries until INTERACTION_TIMEOUT; other errors surface. `before`, when
 * given, runs at the start of every attempt (e.g. scrolling the element into view inside its panel).
 */
export const ClickWhenPresent = (element: Answerable<PageElement>, before?: Interaction): Interaction =>
  Interaction.where(d`#actor clicks ${element}`, async (actor) => {
    const { met, lastError } = await pollUntil(
      actor,
      d`whether ${element} could be clicked`,
      async (a) => {
        if (before) await before.performAs(a);
        if (!(await (await a.answer(element)).isPresent())) return false;
        await Click.on(element).performAs(a);
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

/** The trimmed text of `element`; undefined while it is missing or the read fails. */
export const TextNow = (element: Answerable<PageElement>): QuestionAdapter<string | undefined> =>
  Question.about(d`the text of ${element}`, async (actor) => {
    try {
      return await textIfPresent(await actor.answer(element));
    } catch {
      return undefined;
    }
  });

/** Whether a resolved element is visible; false when the read fails (missing, or re-rendered mid-read). */
export async function isShown(element: PageElement): Promise<boolean> {
  try {
    return await element.isVisible();
  } catch {
    return false;
  }
}

/** A resolved element's trimmed text; undefined when it is missing or the read fails. */
export async function textIfPresent(element: PageElement): Promise<string | undefined> {
  try {
    return (await element.isPresent()) ? (await element.text()).trim() : undefined;
  } catch {
    return undefined;
  }
}
