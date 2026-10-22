import { By, PageElement } from '@serenity-js/web';

/** The stats panel (qsp-stats). Not rendered at all while the game hides it (`showstat 0`). */
export const StatsPanel = PageElement.located(By.css('[data-qsp="stats"]')).describedAs('stats panel');

/** The stats panel's content: what the game writes with `pl` / `p` / `clr`. */
export const StatsContent = PageElement.located(By.css('[data-qsp="stats-content"]'))
  .of(StatsPanel)
  .describedAs('stats content');
