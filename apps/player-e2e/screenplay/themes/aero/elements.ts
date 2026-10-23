import { By, PageElement } from '@serenity-js/web';

/** The shade behind an Aero dialog (absent while DISABLESHADE is set). */
export const Overlay = PageElement.located(By.css('[data-qsp="overlay"]')).describedAs('dialog shade');

/** The invisible div the Aero menu is positioned from (its left/top come from MENU_X/MENU_Y). */
export const MenuAnchor = PageElement.located(By.css('[data-qsp="menu-anchor"]')).describedAs('menu anchor');
