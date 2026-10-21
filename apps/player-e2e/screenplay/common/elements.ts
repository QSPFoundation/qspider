import { By, PageElement, PageElements } from '@serenity-js/web';

/**
 * An error the player shows while opening or running a game: the import error toast
 * (app shell, libs/game-shelf) or the QSP engine error dialog (libs/renderer, a Radix AlertDialog).
 */
export const ErrorAlerts = PageElements.located(By.css('[data-qa="error-alert"], [role="alertdialog"]')).describedAs(
  'error alerts',
);

/**
 * A hidden app-shell marker that appears once startup has fully run, including starting any game the
 * player was launched with (StartupMarker, libs/game-shelf). Present on the shelf and in a game.
 */
export const StartupFinishedMarker = PageElement.located(By.css('[data-qa="startup-finished"]')).describedAs(
  'startup finished marker',
);
