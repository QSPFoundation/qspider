import { describe, expect, it } from 'vitest';
import { PlayerConfig } from '@qspider/contracts';
import {
  configKind,
  entriesFromConfig,
  fallbackEntry,
  findConfigEntry,
  findDuplicateIds,
  findMissingFiles,
} from './config-entries';

describe('entriesFromConfig', () => {
  it('maps every [[game]] to an entry sharing the load location', () => {
    const config = {
      game: [
        { id: 'a', title: 'First', file: 'first/game.qsps' },
        { id: 'b', title: 'Second', file: 'second/game.qsps' },
      ],
    } as PlayerConfig;
    const entries = entriesFromConfig(config, 'qsp://localhost/u1/', '/games', 'u1');
    expect(entries.map((e) => [e.id, e.title, e.loadConfig.entrypoint])).toEqual([
      ['a', 'First', 'first/game.qsps'],
      ['b', 'Second', 'second/game.qsps'],
    ]);
    for (const entry of entries) {
      expect(entry.loadConfig).toMatchObject({ url: 'qsp://localhost/u1/', local_path: '/games', local_id: 'u1' });
    }
  });

  it('resolves the icon against the url prefix', () => {
    const config = {
      game: [{ id: 'a', title: 'First', file: 'g.qsp', resources: { icon: 'img/icon.png' } }],
    } as PlayerConfig;
    const [entry] = entriesFromConfig(config, 'qsp://localhost/u1/', '/games', 'u1');
    expect(entry.icon).toBe('qsp://localhost/u1/img/icon.png');
  });

  it('returns no entries for an empty config', () => {
    expect(entriesFromConfig({ game: [] } as unknown as PlayerConfig, 'p/', '/d', 'u')).toEqual([]);
    expect(entriesFromConfig({} as PlayerConfig, 'p/', '/d', 'u')).toEqual([]);
  });
});

describe('findMissingFiles', () => {
  const entries = entriesFromConfig(
    {
      game: [
        { id: 'a', title: 'A', file: 'a.qsp' },
        { id: 'b', title: 'B', file: 'b/b.qsp' },
      ],
    } as PlayerConfig,
    'p/',
    '/d',
    'u',
  );

  it('lists the files that do not exist', async () => {
    expect(await findMissingFiles(entries, async (f) => f === 'a.qsp')).toEqual(['b/b.qsp']);
  });

  it('returns nothing when all files exist', async () => {
    expect(await findMissingFiles(entries, async () => true)).toEqual([]);
  });
});

describe('configKind', () => {
  it('treats game.cfg, in any case, as a game config', () => {
    expect(configKind('game.cfg')).toBe('game-config');
    expect(configKind('Game.CFG')).toBe('game-config');
  });

  it('marks any other .cfg as unsupported, not as a game file', () => {
    expect(configKind('other.cfg')).toBe('unsupported-config');
    expect(configKind('mygame.CFG')).toBe('unsupported-config');
  });

  it('treats everything else as a game file', () => {
    expect(configKind('game.qsps')).toBe('file');
    expect(configKind('pack.zip')).toBe('file');
  });
});

describe('findDuplicateIds', () => {
  it('lists each id that appears more than once', () => {
    const config = {
      game: [
        { id: 'a', title: 'A', file: 'a.qsp' },
        { id: 'b', title: 'B', file: 'b.qsp' },
        { id: 'a', title: 'A again', file: 'c.qsp' },
        { id: 'a', title: 'A third', file: 'd.qsp' },
      ],
    } as PlayerConfig;
    expect(findDuplicateIds(entriesFromConfig(config, 'p/', '/d', 'u'))).toEqual(['a']);
  });

  it('returns nothing when every id is unique', () => {
    const config = {
      game: [
        { id: 'a', title: 'A', file: 'a.qsp' },
        { id: 'b', title: 'B', file: 'a.qsp' },
      ],
    } as PlayerConfig;
    expect(findDuplicateIds(entriesFromConfig(config, 'p/', '/d', 'u'))).toEqual([]);
  });
});

describe('findConfigEntry', () => {
  const entries = entriesFromConfig(
    {
      game: [
        { id: 'a', title: 'First', file: 'first/game.qsps' },
        { id: 'b', title: 'Second', file: 'second.qsp' },
      ],
    } as PlayerConfig,
    'qsp://localhost/u1/',
    '/games',
    'u1',
  );

  it('finds the entry whose game file is the opened file', () => {
    expect(findConfigEntry(entries, 'second.qsp')?.id).toBe('b');
  });

  it('finds nothing for a file the config does not list', () => {
    expect(findConfigEntry(entries, 'other.qsp')).toBeUndefined();
  });
});

describe('fallbackEntry', () => {
  it('builds a classic entry titled by the file name that points at its folder', () => {
    expect(fallbackEntry('/games/dir/game.qsp', 'game.qsp', 'qsp://localhost/u1/', '/games/dir', 'u1')).toEqual({
      id: 'dfc52f8363398',
      title: 'game.qsp',
      mode: 'classic',
      loadConfig: { url: 'qsp://localhost/u1/', entrypoint: 'game.qsp', local_path: '/games/dir', local_id: 'u1' },
    });
  });

  it('derives the same id from the same path regardless of the session', () => {
    const first = fallbackEntry('/games/dir/game.qsp', 'game.qsp', 'qsp://localhost/u1/', '/games/dir', 'u1');
    const second = fallbackEntry('/games/dir/game.qsp', 'game.qsp', 'qsp://localhost/u2/', '/games/dir', 'u2');
    expect(second.id).toBe(first.id);
  });
});
