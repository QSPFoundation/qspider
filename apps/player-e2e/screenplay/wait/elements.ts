import { By, PageElement } from '@serenity-js/web';

export const WaitLock = PageElement.located(By.css('[data-qsp="wait"]')).describedAs('wait lock');
