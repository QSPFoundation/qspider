import { By, PageElement } from '@serenity-js/web';

/**
 * A dock of the classic layout (`data-qsp-dock`: top, left, center, right or bottom). Takes the first match in
 * document order; the outer `center` dock contains every panel, so a `center` placement check passes trivially.
 */
export const ClassicDock = (place: string) =>
  PageElement.located(By.css(`[data-qsp-dock="${place}"]`)).describedAs(`${place} dock`);
