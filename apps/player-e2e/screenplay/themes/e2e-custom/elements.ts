import { By, PageElement } from '@serenity-js/web';
import { THEMED_GAME } from '../../../fixtures/themes-game';

// Elements the e2e-custom theme (fixtures/themed-game/e2e-theme.html, .js) writes itself: they sit
// outside the qsp-* vocabulary, so they are found by the theme's own `data-qa` marks.
const { chromeMark, scriptMark, spacingMark } = THEMED_GAME.theme;

/** The chrome the theme's markup adds around the player. */
export const ThemeChrome = PageElement.located(By.css(`[data-qa="${chromeMark}"]`)).describedAs('theme chrome');

/** The marker the theme's script adds to the page when it runs. */
export const ThemeScriptMarker = PageElement.located(By.css(`[data-qa="${scriptMark}"]`)).describedAs(
  'theme script marker',
);

/** The theme element whose words sit on separate lines in the theme's source. */
export const ThemeSpacedText = PageElement.located(By.css(`[data-qa="${spacingMark}"]`)).describedAs(
  'theme text written across lines',
);
