import { By, PageElement, PageElements } from '@serenity-js/web';

export const Shelf = PageElement.located(By.css('[data-qa="game-shelf"]')).describedAs('game shelf');
export const EmptyShelfNotice = PageElement.located(By.css('[data-qa="game-shelf-empty"]'))
  .of(Shelf)
  .describedAs('empty shelf notice');
export const ShelfTitles = PageElements.located(By.css('[data-qa="game-title"]')).of(Shelf).describedAs('shelf titles');
