import { Text, By, PageElement, PageElements } from '@serenity-js/web';
import { Expectation } from '@serenity-js/core';
import { visible } from '../support/visible';

export const MainText = visible(PageElements.located(By.css('[data-qsp="main-content"]')), 'main text');

const normalize = (s: string): string => s.replace(/\s+/g, ' ').trim();

/** The text is `label` once whitespace is collapsed: Aero's default $ACTION_FORMAT wraps the label in a table. */
const isLabel = Expectation.define<string, [string]>(
  'isLabel',
  'is the label',
  (actual, label) => normalize(actual) === label,
);

/** Every game action element (rendered or not, in view or not); for ScrollLabelledIntoView. */
export const Actions = PageElements.located(By.css('[data-qsp="action"]')).describedAs('game actions');

/** A game action, by the label the game gives it (in any theme; whitespace around the label is ignored). */
export const Action = (label: string) =>
  visible(PageElements.located(By.css('[data-qsp="action"]')).where(Text, isLabel(label)), `"${label}" action`);

/** The actions panel (qsp-actions). Not rendered at all while the game hides it (`showacts 0`). */
export const ActionsPanel = PageElement.located(By.css('[data-qsp="actions"]')).describedAs('actions panel');

/** The link the panels fixture writes in the main text; it runs `showacts 1`. */
export const ShowActionsLink = PageElement.located(By.css('[data-qa="show-acts"]')).describedAs('show actions link');

/** The game-data tags the theme uses (`data-qsp` is the tag name without `qsp-`, given by the renderer). */
export const GameTitleTag = PageElement.located(By.css('[data-qsp="game-title"]')).describedAs('qsp-game-title');
export const GameAuthorTag = PageElement.located(By.css('[data-qsp="game-author"]')).describedAs('qsp-game-author');
export const GameVersionTag = PageElement.located(By.css('[data-qsp="game-version"]')).describedAs('qsp-game-version');
export const GameDescriptionTag = PageElement.located(By.css('[data-qsp="game-description"]')).describedAs(
  'qsp-game-description',
);
