import { By, PageElement, PageElements, Text } from '@serenity-js/web';
import { equals } from '@serenity-js/assertions';

export const Menu = PageElement.located(By.css('[data-qsp="menu"]')).describedAs('popup menu');

export const MenuItems = PageElements.located(By.css('[data-qsp="menu-item"]')).of(Menu).describedAs('menu items');

const MenuName = PageElement.located(By.css('[data-qsp="menu-name"]')).describedAs('menu item name');

/** The menu item named `name`. */
export const MenuItem = (name: string) =>
  MenuItems.where(Text.of(MenuName), equals(name)).first().describedAs(`menu item "${name}"`);

export const MenuSeparator = PageElement.located(By.css('[data-qsp="menu-separator"]'))
  .of(Menu)
  .describedAs('menu separator');
