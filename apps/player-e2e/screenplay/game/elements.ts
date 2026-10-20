import { Text, By, PageElements } from '@serenity-js/web';
import { equals } from '@serenity-js/assertions';
import { visible } from '../support/visible';

export const MainText = visible(PageElements.located(By.css('[data-qsp="main-content"]')), 'main text');

/** A game action, by the label the game gives it. */
export const Action = (label: string) =>
  visible(PageElements.located(By.css('[data-qsp="action"]')).where(Text, equals(label)), `"${label}" action`);
