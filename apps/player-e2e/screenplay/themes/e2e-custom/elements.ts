import { By, PageElement } from '@serenity-js/web';
import { THEMED_GAME } from '../../../fixtures/themes-game';

// Elements the e2e-custom theme (fixtures/themed-game/e2e-theme.html, .js) writes itself: they sit
// outside the qsp-* vocabulary, so they are found by the theme's own `data-qa` marks.
const { chromeMark, scriptMark } = THEMED_GAME.theme;

/** The chrome the theme's markup adds around the player. */
export const ThemeChrome = PageElement.located(By.css(`[data-qa="${chromeMark}"]`)).describedAs('theme chrome');

/** The marker the theme's script adds to the page when it runs. */
export const ThemeScriptMarker = PageElement.located(By.css(`[data-qa="${scriptMark}"]`)).describedAs(
  'theme script marker',
);

/** The game-data tags the theme uses (`data-qsp` is the tag name without `qsp-`, given by the renderer). */
export const GameTitleTag = PageElement.located(By.css('[data-qsp="game-title"]')).describedAs('qsp-game-title');
export const GameAuthorTag = PageElement.located(By.css('[data-qsp="game-author"]')).describedAs('qsp-game-author');
export const GameVersionTag = PageElement.located(By.css('[data-qsp="game-version"]')).describedAs('qsp-game-version');
export const GameDescriptionTag = PageElement.located(By.css('[data-qsp="game-description"]')).describedAs(
  'qsp-game-description',
);
