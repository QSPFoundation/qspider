import { By, PageElement, PageElements } from '@serenity-js/web';
import { visible } from '../support/visible';

export const PauseScreen = PageElement.located(By.css('[data-qsp="pause-screen"]')).describedAs('pause screen');
export const QuitButton = visible(
  PageElements.located(By.css('[data-qsp-command="quit"]')).of(PauseScreen),
  'quit button',
);
export const SavesButton = visible(
  PageElements.located(By.css('[data-qsp-command="pause:saves"]')).of(PauseScreen),
  'saves button',
);
export const ResumeButton = visible(
  PageElements.located(By.css('[data-qsp-command="resume"]')).of(PauseScreen),
  'resume button',
);
/** Carries `data-requested-save-command`: the command the saves panel was opened for. */
export const PauseScreenContent = PageElement.located(By.css('[data-qsp="pause-screen-content"]')).describedAs(
  'pause screen content',
);
export const RestartButton = visible(
  PageElements.located(By.css('[data-qsp-command="restart"]')).of(PauseScreen),
  'restart button',
);
