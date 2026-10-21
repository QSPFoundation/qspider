import { By, PageElements } from '@serenity-js/web';
import { GAME_HTML } from '../../fixtures/game-html-game';
import { visible } from '../support/visible';

/** An authored element of the game-html fixture, by its `data-qa` mark. */
export const ContentMark = (mark: string) =>
  visible(PageElements.located(By.css(`[data-qa="${mark}"]`)), `content element "${mark}"`);

export const ExecLink = ContentMark(GAME_HTML.marks.execLink);
export const NumLink = ContentMark(GAME_HTML.marks.numLink);
export const MarkupBold = ContentMark(GAME_HTML.marks.bold);

/**
 * An <area> has no box (Playwright's scrollIntoView on it crashes the page), so the click goes to the
 * image it is mapped onto. No visible() filter: it reports this <img> as not visible although it renders.
 */
export const AreaImage = PageElements.located(By.css(`[data-qa="${GAME_HTML.marks.areaImage}"]`))
  .first()
  .describedAs('area image');

// `qsp-on:wheel` is listed in the renderer's `supportedEvents` but has no `eventsMap` entry (latent bug, out of 2c scope).
export const OnClick = ContentMark(GAME_HTML.marks.onClick);
export const OnEnter = ContentMark(GAME_HTML.marks.onEnter);
export const OnLeave = ContentMark(GAME_HTML.marks.onLeave);
