import { Attribute, By, PageElement, PageElements, Text } from '@serenity-js/web';
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

/** The player's Open game control (desktop: a button that opens the native file dialog). */
export const OpenGameButton = PageElement.located(By.css('[data-qa="open-game"]')).describedAs('Open game button');

/** The remove button of the shelf card titled `title`. */
export const RemoveButton = (title: string) =>
  PageElement.located(By.css('[data-qa="game-remove"]'))
    .of(ShelfCard(title))
    .describedAs(`remove button of "${title}"`);

/** The shelf's language selector trigger; `data-value` is the current language code. */
export const ShelfLocaleSelect = PageElement.located(By.css('[data-qa="locale-select"]')).describedAs(
  'shelf language selector',
);

/** The shelf's theme switch. */
export const ThemeSwitch = PageElement.located(By.css('[data-qa="theme-switch"]')).describedAs('theme switch');

/** The page body; `data-player-theme` is the player's current theme, `light` or `dark`. */
export const PlayerBody = PageElement.located(By.css('[data-qa="player-body"]')).describedAs('player theme marker');

/** The option of the shelf language selector for language `code` (rendered only while the selector is open). */
export const LocaleOption = (code: string) =>
  PageElements.located(By.css('[data-qa="locale-select-option"]'))
    .where(Attribute.called('data-value'), equals(code))
    .first()
    .describedAs(`language option ${code}`);
