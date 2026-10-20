import { GameShelfEntry, PlayerConfig } from '@qspider/contracts';

export function entriesFromConfig(
  config: PlayerConfig,
  urlPrefix: string,
  fileDir: string,
  localId: string,
): GameShelfEntry[] {
  return (config.game ?? []).map((game) => ({
    id: game.id,
    mode: game.mode,
    title: game.title,
    author: game.author,
    ported_by: game.ported_by,
    version: game.version,
    description: game.description,
    icon: game.resources?.icon ? `${urlPrefix}${game.resources.icon}` : undefined,
    loadConfig: {
      url: urlPrefix,
      entrypoint: game.file,
      local_path: fileDir,
      local_id: localId,
    },
  }));
}

export async function findMissingFiles(
  entries: GameShelfEntry[],
  exists: (file: string) => Promise<boolean>,
): Promise<string[]> {
  const files = [...new Set(entries.map((entry) => entry.loadConfig.entrypoint))];
  const found = await Promise.all(files.map((file) => exists(file)));
  return files.filter((_, i) => !found[i]);
}
