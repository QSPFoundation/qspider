import type { GameShelfEntry } from '@qspider/contracts';
import { isLegacyGameUrl } from './game-url-rules';

/**
 * Rewrites pre-v2 game urls (`qsp://<uuid>/`, `https://qsp.<uuid>/`) in the library
 * to the current format. Mutates in place; returns whether anything changed.
 */
export function migrateGameUrls(games: Record<string, GameShelfEntry>, buildUrl: (uuid: string) => string): boolean {
  let changed = false;
  for (const game of Object.values(games)) {
    const uuid = game.loadConfig.local_id;
    if (!uuid) continue;
    const base = buildUrl(uuid);
    if (game.loadConfig.url !== base) {
      game.loadConfig.url = base;
      changed = true;
    }
    const icon = game.icon;
    if (icon && isLegacyGameUrl(icon, uuid)) {
      const legacyPrefix = icon.startsWith(`qsp://${uuid}/`) ? `qsp://${uuid}/` : `https://qsp.${uuid}/`;
      game.icon = base + icon.slice(legacyPrefix.length);
      changed = true;
    }
  }
  return changed;
}
