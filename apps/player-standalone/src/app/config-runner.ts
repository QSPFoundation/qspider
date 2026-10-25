import { fetchProxyFallback, parseToml } from '@qspider/utils';
import { GameShelfEntry, PlayerConfig } from '@qspider/contracts';
import { cleanConfigUrl, configEntry } from './config-entry';

export async function runConfig(url: string): Promise<GameShelfEntry> {
  const cleanUrl = cleanConfigUrl(url);

  const content = await fetchProxyFallback(url).then((r) => {
    if (!r.ok) throw new Error(`Failed to load url ${url}`);
    return r.text();
  });
  const config = parseToml<PlayerConfig>(content);
  return configEntry(config, cleanUrl);
}
