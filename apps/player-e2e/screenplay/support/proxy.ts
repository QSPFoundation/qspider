import { Question, Task, Wait } from '@serenity-js/core';
import { contain } from '@serenity-js/assertions';
import { OperatePlayer } from './operate-player';

const ProxiedUrls = Question.about<string[]>('the URLs the CORS proxy was asked for', (actor) =>
  OperatePlayer.as(actor).proxiedUrls(actor),
);

/** The CORS proxy was asked for exactly this original URL (web only). */
export const SeeProxied = (url: string) =>
  Task.where(`#actor sees the CORS proxy asked for ${url}`, Wait.until(ProxiedUrls, contain(url)));
