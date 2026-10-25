import { GameShelfEntry, PlayerConfig } from '@qspider/contracts';
import { cyrb53 } from '@qspider/utils';

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

/**
 * How the desktop importer treats a file by its name: `game.cfg` (any case) is a game config;
 * any other `.cfg` is unsupported (it must not be opened as a single game file); the rest are game files.
 */
export function configKind(fileName: string): 'game-config' | 'unsupported-config' | 'file' {
  const name = fileName.toLowerCase();
  if (name === 'game.cfg') return 'game-config';
  return name.endsWith('.cfg') ? 'unsupported-config' : 'file';
}

/** The ids listed more than once (a game.cfg must give each game its own id). */
export function findDuplicateIds(entries: GameShelfEntry[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const { id } of entries) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates];
}

/** The entry of the config whose game file is `fileName` (how a single opened file finds its game.cfg record). */
export function findConfigEntry(entries: GameShelfEntry[], fileName: string): GameShelfEntry | undefined {
  return entries.find((entry) => entry.loadConfig.entrypoint === fileName);
}

/** The entry for a game file that has no (matching) game.cfg; its id derives from the file path. */
export function fallbackEntry(
  filePath: string,
  name: string,
  urlPrefix: string,
  fileDir: string,
  localId: string,
): GameShelfEntry {
  return {
    id: cyrb53(filePath),
    title: name,
    mode: 'classic',
    loadConfig: {
      url: urlPrefix,
      entrypoint: name,
      local_path: fileDir,
      local_id: localId,
    },
  };
}
