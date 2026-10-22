import { Task } from '@serenity-js/core';
import { Key, Press } from '@serenity-js/web';
import { PauseScreen, ResumeButton, SavesButton } from '../pause/elements';
import { ClickWhenPresent, waitUntilAbsent, waitUntilPresent } from '../support/presence';
import {
  QuickLoadButton,
  QuickSaveButton,
  SaveSlot,
  SlotClearButton,
  SlotCommandButton,
  SlotLoadButton,
  SlotSaveButton,
} from './elements';

/** In the saves panel, saves to or loads from slot `index`, then waits until the panel has closed. */
export const ChooseSaveSlot = (index: number): Task =>
  Task.where(
    `#actor chooses save slot ${index}`,
    ClickWhenPresent(SlotCommandButton(index)),
    waitUntilAbsent(PauseScreen),
  );

/** Escape opens the pause screen; its Saves button opens the saves panel. */
export const OpenSavesPanel = (): Task =>
  Task.where(
    '#actor opens the saves panel',
    Press.the(Key.Escape),
    waitUntilPresent(PauseScreen),
    ClickWhenPresent(SavesButton),
    waitUntilPresent(SaveSlot(1)),
  );

/** In a saves panel opened for saving, saves to slot `index`; the panel closes. */
export const SaveToSlot = (index: number): Task =>
  Task.where(`#actor saves to slot ${index}`, ClickWhenPresent(SlotSaveButton(index)), waitUntilAbsent(PauseScreen));

/** In a saves panel opened for loading, loads slot `index`; the panel closes. */
export const LoadFromSlot = (index: number): Task =>
  Task.where(`#actor loads slot ${index}`, ClickWhenPresent(SlotLoadButton(index)), waitUntilAbsent(PauseScreen));

/** Clears slot `index`; the panel stays open. */
export const ClearSlot = (index: number): Task =>
  Task.where(`#actor clears slot ${index}`, ClickWhenPresent(SlotClearButton(index)));

/** Saves to the quicksave slot from the panel; the panel closes. */
export const QuickSaveFromPanel = (): Task =>
  Task.where('#actor quicksaves from the panel', ClickWhenPresent(QuickSaveButton), waitUntilAbsent(PauseScreen));

/** Loads the quicksave slot from the panel; the panel closes. */
export const QuickLoadFromPanel = (): Task =>
  Task.where('#actor quickloads from the panel', ClickWhenPresent(QuickLoadButton), waitUntilAbsent(PauseScreen));

/** Closes the pause screen with its Resume button. */
export const CancelSavesPanel = (): Task =>
  Task.where('#actor cancels the saves panel', ClickWhenPresent(ResumeButton), waitUntilAbsent(PauseScreen));
