import { By, PageElement } from '@serenity-js/web';

export const View = PageElement.located(By.css('[data-qsp="view"]')).describedAs('image view');

export const ViewImage = PageElement.located(By.css('[data-qsp="view-image"]')).of(View).describedAs('view image');
