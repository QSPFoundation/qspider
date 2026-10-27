import { actorCalled, engage } from '@serenity-js/core';
import type { ScenarioBody, ScenarioFn } from '../../screenplay/support/scenario';
import { desktopCast } from './cast';
import { restartAppWithEmptyData, startScenario } from './fresh-app';
import { scenarioLocation, withLocation } from '../../screenplay/support/scenario-location';

const test = (title: string, body: ScenarioBody): void => {
  const location = scenarioLocation();
  it(title, async function () {
    startScenario(this);
    // Every scenario starts in a fresh app process with empty app data.
    await restartAppWithEmptyData();
    engage(desktopCast());
    await withLocation(location, () => body(actorCalled('Player')));
  });
};

// Skipped from inside the test (mocha's this.skip()), not with it.skip(): Serenity reports a test
// without a body as "Implementation pending", which WDIO then counts as passing.
const skipped = (title: string, _body: ScenarioBody): void => {
  it(title, function () {
    this.skip();
  });
};

// msedgedriver passes every app argument as a Chromium switch, so a bare positional path cannot reach
// the app on Windows (wdio.conf.ts); a scenario about that launch runs on Linux only.
const linuxOnly = process.platform === 'win32' ? skipped : test;

/**
 * Scenarios on WebdriverIO + mocha: one test per scenario. Tagged variants get the tag
 * appended to their title, as on web, where Playwright rejects duplicate titles.
 */
export const scenario: ScenarioFn = Object.assign(test, {
  webOnly: (title: string, body: ScenarioBody): void => skipped(`${title} (web only)`, body),
  desktopOnly: (title: string, body: ScenarioBody): void => test(`${title} (desktop only)`, body),
  linuxDesktopOnly: (title: string, body: ScenarioBody): void => linuxOnly(`${title} (Linux desktop only)`, body),
});
