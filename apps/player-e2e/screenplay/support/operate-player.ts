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
  /** Drops the game file at `path` on the player window (desktop only). */
  abstract dropGameFile(actor: UsesAbilities & AnswersQuestions, path: string): Promise<void>;
  /**
   * Ends the player and starts it again with its stored data (shelf, saves) kept. Ends on the
   * player's start-up; check SeeStartupFinished before relying on what it shows.
   */
  abstract restartPlayer(actor: UsesAbilities & AnswersQuestions): Promise<void>;
  /** Opens the player with the game `url` in its `?game=` parameter (web only). A path like `/x/y.qsps` is served by the player's own origin. */
  abstract openGameUrl(actor: UsesAbilities & AnswersQuestions, url: string): Promise<void>;
  /**
   * From now on, answers requests whose path ends with `pathSuffix` only after `ms` milliseconds (web only: the
   * browser's own network, which a request served by the player's service worker never reaches). It covers the
   * service worker's own network requests too, its script included.
   */
  abstract delayRequests(actor: UsesAbilities & AnswersQuestions, pathSuffix: string, ms: number): Promise<void>;
  /**
   * From now on, requests to `origin` fail in the browser (a CORS or network failure), and the CORS proxy
   * (https://proxy.qspider.xyz/) answers with the player's own `/path` for the original URL it is asked for (web only).
   * Call it after startPlayer. Every URL the proxy is asked for is recorded; read it with proxiedUrls.
   */
  abstract routeThroughProxy(actor: UsesAbilities & AnswersQuestions, origin: string): Promise<void>;
  /** The original URLs the CORS proxy was asked for since routeThroughProxy (web only). */
  abstract proxiedUrls(actor: UsesAbilities & AnswersQuestions): Promise<string[]>;
  /**
   * From now on, the browser reports `scheme` as the OS colour scheme (web only: Playwright's emulateMedia, which
   * holds across reloads of the page). Call it before startPlayer or restartPlayer to set what the player starts with.
   */
  abstract emulateColorScheme(actor: UsesAbilities & AnswersQuestions, scheme: 'light' | 'dark'): Promise<void>;
  /** Whether the app process is still running (desktop only): false once the app has exited. */
  abstract appRunning(actor: UsesAbilities & AnswersQuestions): Promise<boolean>;
}

export const StartPlayer = (): Interaction =>
  Interaction.where('#actor starts the player', (actor) => OperatePlayer.as(actor).startPlayer(actor));

export const RestartPlayer = (): Interaction =>
  Interaction.where('#actor restarts the player', (actor) => OperatePlayer.as(actor).restartPlayer(actor));

export const LoadTestPack = (): Interaction =>
  Interaction.where('#actor loads the test pack', (actor) => OperatePlayer.as(actor).loadTestPack(actor));

export const OpenGameUrl = (url: string): Interaction =>
  Interaction.where(`#actor opens the player with game url ${url}`, (actor) =>
    OperatePlayer.as(actor).openGameUrl(actor, url),
  );

export const DelayRequests = (pathSuffix: string, ms: number): Interaction =>
  Interaction.where(`#actor makes requests ending with ${pathSuffix} take ${ms} ms`, (actor) =>
    OperatePlayer.as(actor).delayRequests(actor, pathSuffix, ms),
  );

export const RouteThroughProxy = (origin: string): Interaction =>
  Interaction.where(`#actor makes ${origin} unreachable, except through the CORS proxy`, (actor) =>
    OperatePlayer.as(actor).routeThroughProxy(actor, origin),
  );

export const EmulateColorScheme = (scheme: 'light' | 'dark'): Interaction =>
  Interaction.where(`#actor makes the OS colour scheme ${scheme}`, (actor) =>
    OperatePlayer.as(actor).emulateColorScheme(actor, scheme),
  );

export const DropGameFile = (path: string): Interaction =>
  Interaction.where(`#actor drops the game file ${path} on the player`, (actor) =>
    OperatePlayer.as(actor).dropGameFile(actor, path),
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
