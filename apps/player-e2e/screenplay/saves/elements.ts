import { By, PageElement, PageElements } from '@serenity-js/web';
import { PauseScreen } from '../pause/elements';
import { visible } from '../support/visible';

/** Save slot `index` (1-based) in the saves panel. The panel lives inside the pause screen. */
export const SaveSlot = (index: number) =>
  PageElement.located(By.css(`[data-qsp-save-index="${index}"]`))
    .of(PauseScreen)
    .describedAs(`save slot ${index}`);

/**
 * The save or load button of slot `index`, whichever the panel shows: opened by the game's
 * `savegame` / `opengame`, the panel hides the other command. Scoped to the slot, because
 * quicksave has these buttons too.
 */
export const SlotCommandButton = (index: number) =>
  visible(
    PageElements.located(By.css('[data-qsp-save-command="save"], [data-qsp-save-command="load"]')).of(SaveSlot(index)),
    `save/load button of save slot ${index}`,
  );

const SlotButton = (index: number, command: 'save' | 'load' | 'clear') =>
  visible(
    PageElements.located(By.css(`[data-qsp-save-command="${command}"]`)).of(SaveSlot(index)),
    `${command} button of save slot ${index}`,
  );

export const SlotSaveButton = (index: number) => SlotButton(index, 'save');
export const SlotLoadButton = (index: number) => SlotButton(index, 'load');
export const SlotClearButton = (index: number) => SlotButton(index, 'clear');

/** The quicksave slot of the saves panel. */
export const QuickSaveSlot = PageElement.located(By.css('[data-qsp-save-path="__quicksave_qspider__"]'))
  .of(PauseScreen)
  .describedAs('quicksave slot');

export const QuickSaveButton = visible(
  PageElements.located(By.css('[data-qsp-save-command="save"]')).of(QuickSaveSlot),
  'quicksave save button',
);
export const QuickLoadButton = visible(
  PageElements.located(By.css('[data-qsp-save-command="load"]')).of(QuickSaveSlot),
  'quicksave load button',
);
