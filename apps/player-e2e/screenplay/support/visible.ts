import type { QuestionAdapter } from '@serenity-js/core';
import { isVisible, type PageElement, type PageElements } from '@serenity-js/web';

/** The first visible element of `selector`: use it for every lookup that can match hidden duplicates. */
export function visible(selector: PageElements, description: string): QuestionAdapter<PageElement> {
  return selector.where(isVisible()).first().describedAs(description);
}
