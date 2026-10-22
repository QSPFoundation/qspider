import { Text, By, PageElement, PageElements } from '@serenity-js/web';
import { equals } from '@serenity-js/assertions';
import { visible } from '../support/visible';

export const MainText = visible(PageElements.located(By.css('[data-qsp="main-content"]')), 'main text');

/** A game action, by the label the game gives it. */
export const Action = (label: string) =>
  visible(PageElements.located(By.css('[data-qsp="action"]')).where(Text, equals(label)), `"${label}" action`);

/** The actions panel (qsp-actions). Not rendered at all while the game hides it (`showacts 0`). */
export const ActionsPanel = PageElement.located(By.css('[data-qsp="actions"]')).describedAs('actions panel');

/** The link the panels fixture writes in the main text; it runs `showacts 1`. */
export const ShowActionsLink = PageElement.located(By.css('[data-qa="show-acts"]')).describedAs('show actions link');
