import { Ability, Interaction, type AnswersQuestions, type UsesAbilities } from '@serenity-js/core';

/**
 * What the player does differently on each target. Each target's Cast gives actors one subclass
 * (targets/web/operate-web-player.ts, targets/desktop/operate-desktop-player.ts); shared code only
 * calls OperatePlayer.as(actor), through the interactions below.
 */
export abstract class OperatePlayer extends Ability {
  /** Brings up the player's start screen. */
  abstract startPlayer(actor: UsesAbilities & AnswersQuestions): Promise<void>;
  /** Opens the game file at `path` the way a player does on this target. */
  abstract openGameFile(actor: UsesAbilities & AnswersQuestions, path: string): Promise<void>;
}

export const StartPlayer = (): Interaction =>
  Interaction.where('#actor starts the player', (actor) => OperatePlayer.as(actor).startPlayer(actor));

export const OpenGameFile = (path: string): Interaction =>
  Interaction.where(`#actor opens the game file ${path}`, (actor) => OperatePlayer.as(actor).openGameFile(actor, path));
