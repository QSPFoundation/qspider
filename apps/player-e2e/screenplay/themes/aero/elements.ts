import { By, PageElement, PageElements, Text } from '@serenity-js/web';
import { equals } from '@serenity-js/assertions';
import { Action } from '../../game/elements';
import { Menu } from '../../menu/elements';
import { ObjectsPanel } from '../../objects/elements';

/** The shade behind an Aero dialog (absent while DISABLESHADE is set). */
export const Overlay = PageElement.located(By.css('[data-qsp="overlay"]')).describedAs('dialog shade');

/** The invisible div the Aero menu is positioned from (its left/top come from MENU_X/MENU_Y). */
export const MenuAnchor = PageElement.located(By.css('[data-qsp="menu-anchor"]')).describedAs('menu anchor');

/** The <img> that an action format writes with %IMAGE%, inside the action labelled `label`. */
export const ActionImage = (label: string) =>
  PageElement.located(By.tagName('img')).of(Action(label)).describedAs(`image of the "${label}" action`);

/** Aero lists objects and menu items as formatted markup, with no name element: their own text is the whole label. */
export const AeroObjects = PageElements.located(By.css('[data-qsp="object"]')).of(ObjectsPanel).describedAs('objects');

export const AeroMenuItems = PageElements.located(By.css('[data-qsp="menu-item"]')).of(Menu).describedAs('menu items');

/** The Aero menu item whose text is `label`. */
export const AeroMenuItem = (label: string) =>
  AeroMenuItems.where(Text, equals(label)).first().describedAs(`menu item "${label}"`);
