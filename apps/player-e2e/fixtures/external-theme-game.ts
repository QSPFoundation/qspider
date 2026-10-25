// The external-theme game (external-theme-game/): game.cfg names its theme by an absolute http URL on the asset
// server (fixtures/asset-server.ts); game-404.cfg names a URL the server answers with 404.
// Keep this module free of test-framework imports: both runners load it.
import { ASSET_SERVER, assetUrl } from './asset-server';

export const EXTERNAL_THEME_GAME = {
  /** The alias the served theme file defines, and game.cfg's defaultTheme. */
  alias: 'e2e-ext',
  startText: 'EXTERNAL THEME START',
  /** The URLs the two game.cfg files spell (guarded in build-fixtures.spec.ts). */
  themeUrl: assetUrl(ASSET_SERVER.paths.theme),
  missingThemeUrl: assetUrl(ASSET_SERVER.paths.missingTheme),
} as const;
