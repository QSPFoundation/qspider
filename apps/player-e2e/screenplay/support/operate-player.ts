import {
  Ability,
  Interaction,
  type AnswersQuestions,
  type PerformsActivities,
  type UsesAbilities,
} from '@serenity-js/core';

/**
 * What the player does differently on each target. Each target's Cast gives actors one subclass
 * (targets/web/operate-web-player.ts, targets/desktop/operate-desktop-player.ts); shared code only
 * calls OperatePlayer.as(actor), through the interactions below.
 */
export abstract class OperatePlayer extends Ability {
  /** Brings up the player's start screen. */
  abstract startPlayer(actor: UsesAbilities & AnswersQuestions): Promise<void>;
  /** Loads the test pack (fixtures/test-pack.ts), which puts all its games on the shelf. */
  abstract loadTestPack(actor: UsesAbilities & AnswersQuestions): Promise<void>;
  /**
   * Opens the game file at `path` through the player's Open game control. Starts from the shelf,
   * where that control is.
   */
  abstract openGameFile(actor: UsesAbilities & AnswersQuestions & PerformsActivities, path: string): Promise<void>;
  /** Opens the player with the game `url` in its `?game=` parameter (web only). A path like `/x/y.qsps` is served by the player's own origin. */
  abstract openGameUrl(actor: UsesAbilities & AnswersQuestions, url: string): Promise<void>;
}

export const StartPlayer = (): Interaction =>
  Interaction.where('#actor starts the player', (actor) => OperatePlayer.as(actor).startPlayer(actor));

export const LoadTestPack = (): Interaction =>
  Interaction.where('#actor loads the test pack', (actor) => OperatePlayer.as(actor).loadTestPack(actor));

export const OpenGameUrl = (url: string): Interaction =>
  Interaction.where(`#actor opens the player with game url ${url}`, (actor) =>
    OperatePlayer.as(actor).openGameUrl(actor, url),
  );

export const OpenGameFile = (path: string): Interaction =>
  Interaction.where(`#actor opens the game file ${path}`, (actor) =>
    OperatePlayer.as(actor).openGameFile(performer(actor), path),
  );

/**
 * Serenity types an Interaction's actor without PerformsActivities, though it is always an Actor.
 * Checked here, so a target can run its own steps (e.g. a click) as reported activities.
 */
function performer<A extends UsesAbilities & AnswersQuestions>(actor: A): A & PerformsActivities {
  if (typeof (actor as Partial<PerformsActivities>).attemptsTo !== 'function') {
    throw new TypeError('OpenGameFile needs an actor that performs activities');
  }
  return actor as A & PerformsActivities;
}
