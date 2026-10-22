import { By, PageElement } from '@serenity-js/web';

/** The command line (qsp-cmd, the input line). Not rendered at all while the game hides it (`showinput 0`). */
export const CommandLine = PageElement.located(By.css('[data-qsp="cmd"]')).describedAs('command line');

/** The command line's text field. */
export const CommandInput = PageElement.located(By.css('[data-qsp="cmd-input"]'))
  .of(CommandLine)
  .describedAs('command line input');
