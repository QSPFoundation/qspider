import { useFixtures } from '@serenity-js/playwright-test';
import type { Cast } from '@serenity-js/core';
import type { ScenarioBody, ScenarioFn } from '../../screenplay/support/scenario';
import { webCast } from './cast';

const { it } = useFixtures<{ actors: Cast }>({
  actors: async ({ page, extraContextOptions }, use) => {
    await use(webCast(page, extraContextOptions));
  },
});

const test = (title: string, body: ScenarioBody): void =>
  it(title, async ({ actor }) => {
    await body(actor);
  });

const skipped = (title: string, body: ScenarioBody): void =>
  it.skip(title, async ({ actor }) => {
    await body(actor);
  });

/**
 * Scenarios on Playwright Test: one test per scenario, each in a fresh browser context.
 * Tagged variants share their title, which Playwright rejects as a duplicate, so the tag is appended.
 */
export const scenario: ScenarioFn = Object.assign(test, {
  webOnly: (title: string, body: ScenarioBody): void => test(`${title} (web only)`, body),
  desktopOnly: (title: string, body: ScenarioBody): void => skipped(`${title} (desktop only)`, body),
});
