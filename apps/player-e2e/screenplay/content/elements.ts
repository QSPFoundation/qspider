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
export const FormField = ContentMark(GAME_HTML.marks.formField);
export const FormSubmit = ContentMark(GAME_HTML.marks.formSubmit);
export const BindField = ContentMark(GAME_HTML.marks.bindField);

// Engine-variable watchers (watchers location). qsp-show renders no wrapper, so its child is the handle.
// QspStyle is not wrapped in visible(): a <style> element is never visible. Nor is QspLayer: the shown
// full-viewport layer is reported not visible by Playwright, and a hidden layer is not rendered at all.
export const QspVariable = visible(PageElements.located(By.css('[data-qsp="variable"]')), 'qsp-variable');
export const ShowChild = PageElements.located(By.css(`[data-qa="${GAME_HTML.marks.showChild}"]`))
  .first()
  .describedAs('qsp-show child');
export const QspStyle = PageElements.located(By.css('[data-qsp="style"]')).first().describedAs('qsp-style');
export const QspRegion = visible(PageElements.located(By.css('[data-qsp="region"]')), 'qsp-region');
/** The first qsp-region, visible or not: an empty region has no box, so QspRegion cannot read it. */
export const FirstQspRegion = PageElements.located(By.css('[data-qsp="region"]')).first().describedAs('qsp-region');
export const QspLayer = PageElements.located(By.css('[data-qsp="layer"]')).first().describedAs('qsp-layer');

// Selector mirrors GAME_HTML.marks.pwnedAttribute (the lint rule needs a literal). Set on <body> by the hostile iframe's srcdoc script if it reaches the host page.
export const PwnedAttribute = PageElements.located(By.css('[data-qa-pwned]'))
  .first()
  .describedAs('pwned marker attribute');
