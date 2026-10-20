import { actorCalled, engage } from '@serenity-js/core';
import type { ScenarioBody, ScenarioFn } from '../../screenplay/support/scenario';
import { desktopCast } from './cast';
import { restartAppWithEmptyData } from './fresh-app';

const test = (title: string, body: ScenarioBody): void => {
  it(title, async () => {
    // Every scenario starts in a fresh app process with empty app data.
    await restartAppWithEmptyData();
    engage(desktopCast());
    await body(actorCalled('Player'));
  });
};

// Skipped from inside the test (mocha's this.skip()), not with it.skip(): Serenity reports a test
// without a body as "Implementation pending", which WDIO then counts as passing.
const skipped = (title: string, _body: ScenarioBody): void => {
  it(title, function () {
    this.skip();
  });
};

/**
 * Scenarios on WebdriverIO + mocha: one test per scenario. Tagged variants get the tag
 * appended to their title, as on web, where Playwright rejects duplicate titles.
 */
export const scenario: ScenarioFn = Object.assign(test, {
  webOnly: (title: string, body: ScenarioBody): void => skipped(`${title} (web only)`, body),
  desktopOnly: (title: string, body: ScenarioBody): void => test(`${title} (desktop only)`, body),
});
