import { waitUntilPresent } from '../support/presence';
import { Menu, MenuSeparator } from './elements';

export const SeeMenu = () => waitUntilPresent(Menu);

export const SeeMenuSeparator = () => waitUntilPresent(MenuSeparator);
