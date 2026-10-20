import { By, PageElements } from '@serenity-js/web';

/**
 * An error the player shows while opening or running a game: the import error toast
 * (app shell, libs/game-shelf) or the QSP engine error dialog (libs/renderer, a Radix AlertDialog).
 */
export const ErrorAlerts = PageElements.located(By.css('[data-qa="error-alert"], [role="alertdialog"]')).describedAs(
  'error alerts',
);
