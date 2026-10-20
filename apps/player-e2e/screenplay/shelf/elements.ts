import { By, PageElement, PageElements, Text } from '@serenity-js/web';
import { equals } from '@serenity-js/assertions';

export const Shelf = PageElement.located(By.css('[data-qa="game-shelf"]')).describedAs('game shelf');
export const EmptyShelfNotice = PageElement.located(By.css('[data-qa="game-shelf-empty"]'))
  .of(Shelf)
  .describedAs('empty shelf notice');
export const ShelfTitles = PageElements.located(By.css('[data-qa="game-title"]')).of(Shelf).describedAs('shelf titles');

const CardTitle = PageElement.located(By.css('[data-qa="game-title"]')).describedAs('card title');
const ShelfCards = PageElements.located(By.css('[data-qa="game-card"]')).of(Shelf).describedAs('shelf cards');

/** The shelf card of the game titled `title`. */
export const ShelfCard = (title: string) =>
  ShelfCards.where(Text.of(CardTitle), equals(title)).first().describedAs(`shelf card "${title}"`);

/** The run link of the shelf card titled `title`. */
export const RunLink = (title: string) =>
  PageElement.located(By.css('[data-qa="game-run"]')).of(ShelfCard(title)).describedAs(`run link of "${title}"`);
