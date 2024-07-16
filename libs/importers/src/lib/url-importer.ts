import { GameDescriptor, GameShelfEntry, PlayerConfig } from '@qspider/contracts';
import { cyrb53, fetchProxyFallback } from '@qspider/utils';
import { parse } from 'iarna-toml-esm';
import { isSupportedArchive } from './utils';
import { importArchive } from './archive-importer';

export async function importUrl(
  url: string,
  name?: string,
  rootDescriptor?: GameDescriptor,
): Promise<GameShelfEntry[]> {
  const urlObject = new URL(url);
  urlObject.hash = '';
  urlObject.search = '';
  const cleanUrl = urlObject.toString();
  const content = await fetchProxyFallback(url).then((r) => {
    if (!r.ok) throw new Error(`Failed to load url ${url}`);
    return r.arrayBuffer();
  });
  if (isSupportedArchive(content)) return importArchive(name || cleanUrl, content, rootDescriptor);
  const base = cleanUrl.slice(0, cleanUrl.lastIndexOf('/') + 1);
  const fileName = cleanUrl.replace(base, '');
  if (fileName.endsWith('.cfg')) {
    const rawConfig = new TextDecoder().decode(content);
    const config = parse(rawConfig) as unknown as PlayerConfig;
    const games = [];
    for (const descriptor of config.game) {
      const fullUrl = `${base}${descriptor.file}`;
      games.push(...(await importUrl(fullUrl, descriptor.file, descriptor)));
    }
    return games;
  } else {
    const gameConfigUrl = `${base}game.cfg`;
    try {
      const rawConfig = await fetchProxyFallback(gameConfigUrl).then((r) => r.text());
      const config = parse(rawConfig) as unknown as PlayerConfig;
      const found = config.game.find((game) => game.file === fileName);
      if (!found) throw new Error('Config not found');
      return [
        {
          id: found.id,
          mode: found.mode,
          title: found.title,
          author: found.author,
          ported_by: found.ported_by,
          version: found.version,
          description: found.description,
          loadConfig: {
            url: base,
            entrypoint: found.file,
          },
        },
      ];
    } catch {
      return [
        {
          id: rootDescriptor?.id || cyrb53(cleanUrl),
          title: rootDescriptor?.title || fileName,
          mode: rootDescriptor?.mode || 'classic',
          author: rootDescriptor?.author,
          ported_by: rootDescriptor?.ported_by,
          version: rootDescriptor?.version,
          description: rootDescriptor?.description,
          loadConfig: {
            url: base,
            entrypoint: fileName,
            descriptor: rootDescriptor,
          },
        },
      ];
    }
  }
}
