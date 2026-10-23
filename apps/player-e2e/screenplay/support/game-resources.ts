import { equals } from '@serenity-js/assertions';
import type { Task } from '@serenity-js/core';
import { scriptResult } from './page-script';
import { seeScriptEventually } from './see-script-eventually';

/** How many elements the player added for the running game's game.cfg resources (styles, scripts, fonts). */
function gameResourceCount(): number {
  return document.querySelectorAll('[data-qspider-resource]').length;
}

/** Eventually exactly `count` game.cfg resource elements are in the page (read-only probe). */
export const SeeGameResourceCount = (count: number): Task =>
  seeScriptEventually(
    scriptResult('the number of game.cfg resource elements', gameResourceCount),
    equals(count),
    `#actor sees ${count} game.cfg resource elements in the page`,
  );
