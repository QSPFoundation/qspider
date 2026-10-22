import { By, PageElement } from '@serenity-js/web';

/** A dock of the classic layout (`data-qsp-dock`: top, left, center, right or bottom). */
export const ClassicDock = (place: string) =>
  PageElement.located(By.css(`[data-qsp-dock="${place}"]`)).describedAs(`${place} dock`);
