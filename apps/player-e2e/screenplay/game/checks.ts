import { Task } from '@serenity-js/core';
import { equals, includes, not } from '@serenity-js/assertions';
import { Attribute, Text } from '@serenity-js/web';
import { waitUntilAbsent } from '../support/presence';
import { seeEventually } from '../support/see-eventually';
import { Action, ActionsPanel, MainText } from './elements';

export const SeeMainText = (text: string): Task =>
  seeEventually(MainText, (e) => Text.of(e).trim(), equals(text), `#actor sees main text "${text}"`);

export const SeeMainTextContaining = (text: string): Task =>
  seeEventually(MainText, (e) => Text.of(e), includes(text), `#actor sees main text containing "${text}"`);

export const SeeMainTextWithout = (text: string): Task =>
  seeEventually(MainText, (e) => Text.of(e), not(includes(text)), `#actor sees main text without "${text}"`);

/** The action `label` is the selected one: it carries `data-qsp-selected` (hovered, or chosen by keyboard). */
export const SeeActionSelected = (label: string): Task =>
  seeEventually(
    Action(label),
    (e) => Attribute.called('data-qsp-selected').of(e),
    equals(''),
    `#actor sees the "${label}" action selected`,
  );

/** The action `label` is not the selected one: `data-qsp-selected` is absent (null on both targets). Check a selected anchor first. */
export const SeeActionNotSelected = (label: string): Task =>
  seeEventually(
    Action(label),
    (e) => Attribute.called('data-qsp-selected').of(e),
    equals(null),
    `#actor sees the "${label}" action not selected`,
  );

/** The actions panel is gone. An absence check: check a settled anchor first. */
export const SeeNoActionsPanel = (): Task => Task.where('#actor sees no actions panel', waitUntilAbsent(ActionsPanel));
