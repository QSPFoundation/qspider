import { Text, By, PageElement, PageElements } from '@serenity-js/web';
import { equals } from '@serenity-js/assertions';
import { visible } from '../support/visible';

export const MainText = PageElement.located(By.css('[data-qsp="main-content"]')).describedAs('main text');

/** A game action, by the label the game gives it. */
export const Action = (label: string) =>
  visible(PageElements.located(By.css('[data-qsp="action"]')).where(Text, equals(label)), `"${label}" action`);
