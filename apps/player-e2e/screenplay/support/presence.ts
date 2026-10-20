import { type Answerable, Question, type QuestionAdapter, Wait } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import type { PageElement } from '@serenity-js/web';

// The desktop waiting trap, in one place. WebKitWebDriver (desktop) answers a read of a missing
// element with a raw "no such element" error instead of false, and Serenity's isPresent() /
// Wait.until pass that error straight through. So every read of an element that may not be
// rendered yet goes through these helpers, which treat any read error as "not there (yet)".

/** Whether `element` is present; false when it is missing or the read fails. */
export const PresenceOf = (element: Answerable<PageElement>): QuestionAdapter<boolean> =>
  Question.about(`the presence of ${String(element)}`, async (actor) => {
    try {
      return await (await actor.answer(element)).isPresent();
    } catch {
      return false;
    }
  });

/** Waits until `element` is present. Tasks use it to settle; seeEventually uses it before reading. */
export const waitUntilPresent = (element: Answerable<PageElement>) => Wait.until(PresenceOf(element), equals(true));

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
