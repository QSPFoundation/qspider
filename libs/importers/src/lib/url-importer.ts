import { GameDescriptor, GameShelfEntry, PlayerConfig } from '@qspider/contracts';
import { decodeText, fetchProxyFallback, parseToml } from '@qspider/utils';
import { isSupportedArchive } from './utils';
import { importArchive } from './archive-importer';
import { splitGameUrl, urlConfigEntry, urlFallbackEntry } from './import-entries';

export async function importUrl(
  url: string,
  name?: string,
  rootDescriptor?: GameDescriptor,
): Promise<GameShelfEntry[]> {
  const { cleanUrl, base, fileName } = splitGameUrl(url);
  const content = await fetchProxyFallback(url).then((r) => {
    if (!r.ok) throw new Error(`Failed to load url ${url}`);
    return r.arrayBuffer();
  });
  if (isSupportedArchive(content)) return importArchive(name || cleanUrl, content, rootDescriptor);
  if (fileName.endsWith('.cfg')) {
    const rawConfig = decodeText(content);
    const config = parseToml<PlayerConfig>(rawConfig);
    const games = [];
    for (const descriptor of config.game) {
      const fullUrl = `${base}${descriptor.file}`;
      games.push(...(await importUrl(fullUrl, descriptor.file, descriptor)));
    }
    return games;
  } else {
    const gameConfigUrl = `${base}game.cfg`;
    try {
      const rawConfig = await fetchProxyFallback(gameConfigUrl).then(async (r) => decodeText(await r.arrayBuffer()));
      const config = parseToml<PlayerConfig>(rawConfig);
      const found = config.game.find((game) => game.file === fileName);
      if (!found) throw new Error('Config not found');
      return [urlConfigEntry(found, base)];
    } catch {
      return [urlFallbackEntry(cleanUrl, base, fileName, rootDescriptor)];
    }
  }
}
