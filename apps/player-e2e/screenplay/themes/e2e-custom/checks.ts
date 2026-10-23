import { Task } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
import { THEMED_GAME } from '../../../fixtures/themes-game';
import { SeeCssValues } from '../../support/page-script';
import { seeEventually } from '../../support/see-eventually';
import { ThemeChrome, ThemeScriptMarker } from './elements';

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
