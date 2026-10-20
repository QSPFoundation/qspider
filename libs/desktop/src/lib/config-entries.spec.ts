import { describe, expect, it } from 'vitest';
import { PlayerConfig } from '@qspider/contracts';
import { entriesFromConfig, findMissingFiles } from './config-entries';

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
