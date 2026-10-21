import type { Answerable, Interaction } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { ClickWhenPresent } from '../support/presence';
import { FormSubmit } from './elements';

/** Clicks an authored content element once it is present. */
export const ClickContent = (element: Answerable<PageElement>): Interaction => ClickWhenPresent(element);

/** Submits the fixture's form through its submit button. */
export const SubmitForm = (): Interaction => ClickWhenPresent(FormSubmit);
