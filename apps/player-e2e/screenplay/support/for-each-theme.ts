import type { ScenarioBody } from './scenario';
import { scenario } from './scenario';
import type { Actor } from '@serenity-js/core';
import type { ThemeVariant } from '../../fixtures/themes-game';

/**
 * Registers one scenario per theme variant, titled `${title} [${variant.name}]`, so the same flow
 * runs under every theme. The core flows run on web only (maintainer decision, 2026-10-22), so pass
 * `webOnly`: the scenarios then show as skipped on desktop.
 */
export function forEachTheme(
  variants: ThemeVariant[],
  title: string,
  body: (player: Actor, variant: ThemeVariant) => Promise<void>,
  opts: { webOnly?: boolean } = {},
): void {
  for (const variant of variants) {
    const run: ScenarioBody = (player) => body(player, variant);
    const variantTitle = `${title} [${variant.name}]`;
    if (opts.webOnly) scenario.webOnly(variantTitle, run);
    else scenario(variantTitle, run);
  }
}
