import { fetchProxyFallback } from '@qspider/utils';
import { GameShelfEntry, PlayerConfig } from '@qspider/contracts';
import { parse } from 'iarna-toml-esm';

export async function runConfig(url: string): Promise<GameShelfEntry> {
  const urlObject = new URL(url);
  urlObject.hash = '';
  urlObject.search = '';
  const cleanUrl = urlObject.toString();
  if (!cleanUrl.endsWith('.cfg')) {
    throw new Error('Only .cfg files are supported');
  }
  // TODO? replace here as well
  const content = await fetchProxyFallback(url).then((r) => {
    if (!r.ok) throw new Error(`Failed to load url ${url}`);
    return r.text();
  });
  const config = parse(content) as unknown as PlayerConfig;
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
