import { By, PageElement, PageElements } from '@serenity-js/web';
import { visible } from '../support/visible';

export const InputDialog = PageElement.located(By.css('[data-qsp="input"]')).describedAs('input dialog');

export const InputContent = PageElement.located(By.css('[data-qsp="input-content"]')).describedAs(
  'input dialog prompt',
);

export const InputField = PageElement.located(By.css('[data-qsp="input-tag"]')).describedAs('input dialog text field');

export const InputOk = visible(PageElements.located(By.css('[data-qsp="ok-button"]')), 'input dialog OK button');

export const InputCancel = visible(
  PageElements.located(By.css('[data-qsp="cancel-button"]')),
  'input dialog Cancel button',
);
