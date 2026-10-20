import { Task } from '@serenity-js/core';
import { ClickWhenPresent } from '../support/presence';
import { RunLink } from './elements';

/** Runs the game titled `title` from its shelf card. */
export const OpenFromShelf = (title: string): Task =>
  Task.where(`#actor opens "${title}" from the shelf`, ClickWhenPresent(RunLink(title)));
