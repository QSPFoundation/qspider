import { By, PageElement, PageElements } from '@serenity-js/web';
import { visible } from '../support/visible';

export const PauseScreen = PageElement.located(By.css('[data-qsp="pause-screen"]')).describedAs('pause screen');
export const QuitButton = visible(
  PageElements.located(By.css('[data-qsp-command="quit"]')).of(PauseScreen),
  'quit button',
);
