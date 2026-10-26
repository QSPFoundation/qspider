import { Task } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
import { THEMED_GAME } from '../../../fixtures/themes-game';
import { SeeCssValues } from '../../support/page-script';
import { seeEventually } from '../../support/see-eventually';
import {
  GameAuthorTag,
  GameDescriptionTag,
  GameTitleTag,
  GameVersionTag,
  ThemeChrome,
  ThemeScriptMarker,
} from './elements';

/** The theme's own chrome shows (its markup was used). */
export const SeeThemeChrome = (): Task =>
  seeEventually(
    ThemeChrome,
    (e) => Text.of(e).trim(),
    equals(THEMED_GAME.theme.chrome),
    `#actor sees the theme chrome "${THEMED_GAME.theme.chrome}"`,
  );

/** The theme's script ran: it wrote its marker. */
export const SeeThemeScriptRan = (): Task =>
  seeEventually(
    ThemeScriptMarker,
    (e) => Text.of(e).trim(),
    equals(THEMED_GAME.theme.script),
    `#actor sees the theme script ran ("${THEMED_GAME.theme.script}")`,
  );

/** The theme's css-link file took effect: its rule set a custom property on the chrome. */
export const SeeThemeCssApplied = (): Task =>
  SeeCssValues({ qa: THEMED_GAME.theme.chromeMark }, { [THEMED_GAME.theme.cssProperty]: THEMED_GAME.theme.cssMark });

/** The theme's game-data tags show the game's own title, author, version and description. */
export const SeeGameInfoTags = (): Task => {
  const { title, info } = THEMED_GAME;
  const see = (element: typeof GameTitleTag, text: string, name: string) =>
    seeEventually(element, (e) => Text.of(e).trim(), equals(text), `#actor sees ${name} read "${text}"`);
  return Task.where(
    '#actor sees the game info tags',
    see(GameTitleTag, title, 'qsp-game-title'),
    see(GameAuthorTag, info.author, 'qsp-game-author'),
    see(GameVersionTag, info.version, 'qsp-game-version'),
    see(GameDescriptionTag, info.description, 'qsp-game-description'),
  );
};
