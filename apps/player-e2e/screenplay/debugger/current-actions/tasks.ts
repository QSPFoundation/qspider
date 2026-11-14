import { Task } from '@serenity-js/core';
import { ClickWhenPresent } from '../../support/presence';
import { CurrentActionEntry, CurrentActionsToggle } from './elements';

/** Shows the code of the current action `name` in the editor. */
export const SelectCurrentAction = (name: string): Task =>
  Task.where(`#actor selects the current action "${name}"`, ClickWhenPresent(CurrentActionEntry(name)));

/** Collapses the current actions section, or expands it again. */
export const ToggleCurrentActions = (): Task =>
  Task.where('#actor toggles the current actions section', ClickWhenPresent(CurrentActionsToggle));
