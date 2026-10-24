import type { Actor } from '@serenity-js/core';

export type ScenarioBody = (actor: Actor) => Promise<void>;

/**
 * Defines a scenario: a test that runs on both targets. Each target maps it to its runner's own
 * test function (targets/<target>/scenario.ts) and gives `body` an actor with that target's abilities.
 *
 * When a step exists on one target only, split the scenario into `.webOnly` / `.desktopOnly`
 * variants with the same title. They show as skipped on the other target. Never branch inside a scenario.
 * `.linuxDesktopOnly` runs on the desktop target on Linux only (skipped on Windows and on web), for a
 * launch that msedgedriver cannot pass on Windows (a bare positional argument).
 */
export interface ScenarioFn {
  (title: string, body: ScenarioBody): void;
  webOnly(title: string, body: ScenarioBody): void;
  desktopOnly(title: string, body: ScenarioBody): void;
  linuxDesktopOnly(title: string, body: ScenarioBody): void;
}

const TARGETS = ['web', 'desktop'];
const target = process.env['QSPIDER_E2E_TARGET'] ?? '';
if (!TARGETS.includes(target)) {
  throw new Error(
    `QSPIDER_E2E_TARGET is "${target}", expected one of ${TARGETS.join(', ')}; run scenarios through a targets/* config`,
  );
}

// Chosen at runtime (each target config sets QSPIDER_E2E_TARGET), so one runner never loads the other's code.
const shim = (await import(`../../targets/${target}/scenario.ts`)) as { scenario: ScenarioFn };

export const scenario: ScenarioFn = shim.scenario;
