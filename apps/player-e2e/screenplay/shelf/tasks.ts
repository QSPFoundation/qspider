import { Task } from '@serenity-js/core';
import { ClickWhenPresent } from '../support/presence';
import { LocaleOption, RemoveButton, RunLink, ShelfLocaleSelect, ThemeSwitch } from './elements';

/** Runs the game titled `title` from its shelf card. */
export const OpenFromShelf = (title: string): Task =>
  Task.where(`#actor opens "${title}" from the shelf`, ClickWhenPresent(RunLink(title)));

/** Removes the game titled `title` from its shelf card. */
export const RemoveFromShelf = (title: string): Task =>
  Task.where(`#actor removes "${title}" from the shelf`, ClickWhenPresent(RemoveButton(title)));

/** Picks language `code` in the shelf's language selector. */
export const SwitchShelfLanguage = (code: string): Task =>
  Task.where(
    `#actor switches the shelf language to ${code}`,
    ClickWhenPresent(ShelfLocaleSelect),
    ClickWhenPresent(LocaleOption(code)),
  );

/** Clicks the shelf's theme switch once. */
export const ToggleShelfTheme = (): Task =>
  Task.where('#actor toggles the player theme', ClickWhenPresent(ThemeSwitch));
