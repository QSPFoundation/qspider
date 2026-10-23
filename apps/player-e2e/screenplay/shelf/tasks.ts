import { Task } from '@serenity-js/core';
import { ClickWhenPresent } from '../support/presence';
import { RemoveButton, RunLink } from './elements';

/** Runs the game titled `title` from its shelf card. */
export const OpenFromShelf = (title: string): Task =>
  Task.where(`#actor opens "${title}" from the shelf`, ClickWhenPresent(RunLink(title)));

/** Removes the game titled `title` from its shelf card. */
export const RemoveFromShelf = (title: string): Task =>
  Task.where(`#actor removes "${title}" from the shelf`, ClickWhenPresent(RemoveButton(title)));
