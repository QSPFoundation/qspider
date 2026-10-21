import { By, PageElement, PageElements } from '@serenity-js/web';
import { visible } from '../support/visible';

export const MsgDialog = PageElement.located(By.css('[data-qsp="msg"]')).describedAs('message box');

export const MsgContent = PageElement.located(By.css('[data-qsp="msg-content"]')).describedAs('message box text');

/** The OK button exists in both themes (the classic-only close-button does not). */
export const MsgOkButton = visible(PageElements.located(By.css('[data-qsp="ok-button"]')), 'message box OK button');
