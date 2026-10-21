import type { Task } from '@serenity-js/core';
import { isPresent } from '@serenity-js/assertions';
import { seeEventually } from '../support/see-eventually';
import { Menu, MenuSeparator } from './elements';

export const SeeMenu = (): Task => seeEventually(Menu, (e) => e, isPresent(), '#actor sees the popup menu');

export const SeeMenuSeparator = (): Task =>
  seeEventually(MenuSeparator, (e) => e, isPresent(), '#actor sees the menu separator');
