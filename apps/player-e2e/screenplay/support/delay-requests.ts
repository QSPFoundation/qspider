import { Interaction } from '@serenity-js/core';
import { OperatePlayer } from './operate-player';

/** Requests ending with `pathSuffix` are answered only after `ms` milliseconds (web only). */
export const DelayRequests = (pathSuffix: string, ms: number): Interaction =>
  Interaction.where(`#actor makes requests ending with ${pathSuffix} take ${ms} ms`, (actor) =>
    OperatePlayer.as(actor).delayRequests(actor, pathSuffix, ms),
  );

/** The page a game link opens (`/?game=<url>`) is answered only after `ms` milliseconds (web only). */
export const DelayGameLinkPage = (ms: number): Interaction =>
  Interaction.where(`#actor makes the page a game link opens take ${ms} ms`, (actor) =>
    OperatePlayer.as(actor).delayGameLinkPage(actor, ms),
  );
