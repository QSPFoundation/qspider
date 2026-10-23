import { Task } from '@serenity-js/core';
import { endsWith } from '@serenity-js/assertions';
import { SeeCssValue, SeeCssValues, StyleTarget } from '../support/page-script';
import { splitLookTable } from '../../fixtures/look-game';

/** Every row of a look table: exact rows in one read, resource rows (`url("<base>/<path>")`) by their end. */
export const SeeLookTable = (target: StyleTarget, table: Record<string, string>): Task => {
  const { exact, suffix } = splitLookTable(table);
  return Task.where(
    `#actor sees the look table on ${JSON.stringify(target)}`,
    SeeCssValues(target, exact),
    ...Object.entries(suffix).map(([name, end]) => SeeCssValue(target, name, endsWith(end))),
  );
};
