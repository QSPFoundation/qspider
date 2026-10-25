import { GameShelfEntry, PlayerConfig } from '@qspider/contracts';

/** The config url without its hash and search; only `.cfg` files are supported. */
export function cleanConfigUrl(url: string): string {
  const urlObject = new URL(url);
  urlObject.hash = '';
  urlObject.search = '';
  const cleanUrl = urlObject.toString();
  if (!cleanUrl.endsWith('.cfg')) {
    throw new Error('Only .cfg files are supported');
  }
  return cleanUrl;
}

/** The shelf entry of the config's first game; the game files are resolved next to the config url. */
export function configEntry(config: PlayerConfig, cleanUrl: string): GameShelfEntry {
  const [game] = config.game;
  if (!game) throw new Error('Game not found');
  const base = cleanUrl.slice(0, cleanUrl.lastIndexOf('/') + 1);
  return {
    id: game.id,
    mode: game.mode,
    title: game.title,
    author: game.author,
    ported_by: game.ported_by,
    version: game.version,
    loadConfig: {
      url: base,
      entrypoint: game.file,
      descriptor: game,
    },
  };
}
