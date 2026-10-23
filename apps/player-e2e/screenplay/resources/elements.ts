import { By, PageElement } from '@serenity-js/web';

/** A marker the resources game's scripts write into the page, by its `data-qa` (RESOURCES_GAME.marks). */
export const ResourceMark = (qa: string) =>
  PageElement.located(By.css(`[data-qa="${qa}"]`)).describedAs(`resource mark ${qa}`);
