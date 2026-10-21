import type { Answerable, Interaction } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { ClickWhenPresent } from '../support/presence';

/** Clicks an authored content element once it is present. */
export const ClickContent = (element: Answerable<PageElement>): Interaction => ClickWhenPresent(element);
