import { describe, expect, it } from 'vitest';
import type { GameShelfEntry } from '@qspider/contracts';

import { migrateGameUrls } from './storage-migration';

const build = (id: string) => `qsp://localhost/${id}/`;

function makeGames(
  url: string,
  icon?: string,
  localId: string | null = 'u1',
): Record<string, GameShelfEntry> & { g: GameShelfEntry } {
  return {
    g: {
      id: 'g',
      title: 't',
      mode: 'classic',
      icon,
      loadConfig: { url, entrypoint: 'a.qsp', local_id: localId ?? undefined, local_path: '/x' },
    },
  } as Record<string, GameShelfEntry> & { g: GameShelfEntry };
}

describe('migrateGameUrls', () => {
  it('rewrites legacy url and icon', () => {
    const games = makeGames('qsp://u1/', 'qsp://u1/icon.png');
    expect(migrateGameUrls(games, build)).toBe(true);
    expect(games.g.loadConfig.url).toBe('qsp://localhost/u1/');
    expect(games.g.icon).toBe('qsp://localhost/u1/icon.png');
  });

  it('rewrites windows legacy form', () => {
    const games = makeGames('https://qsp.u1/', 'https://qsp.u1/icon.png');
    expect(migrateGameUrls(games, build)).toBe(true);
    expect(games.g.loadConfig.url).toBe(build('u1'));
    expect(games.g.icon).toBe('qsp://localhost/u1/icon.png');
  });

  it('is idempotent and reports no change for new-format entries', () => {
    const games = makeGames(build('u1'), 'qsp://localhost/u1/icon.png');
    expect(migrateGameUrls(games, build)).toBe(false);
    expect(games.g.loadConfig.url).toBe(build('u1'));
    expect(games.g.icon).toBe('qsp://localhost/u1/icon.png');

    const legacy = makeGames('qsp://u1/', 'qsp://u1/icon.png');
    migrateGameUrls(legacy, build);
    expect(migrateGameUrls(legacy, build)).toBe(false);
  });

  it('leaves entries without local_id untouched', () => {
    const games = makeGames('https://example.com/game/', undefined, null);
    expect(migrateGameUrls(games, build)).toBe(false);
    expect(games.g.loadConfig.url).toBe('https://example.com/game/');
  });

  it('leaves non-game icons untouched', () => {
    const games = makeGames(build('u1'), 'https://qsp.org/x.png');
    expect(migrateGameUrls(games, build)).toBe(false);
    expect(games.g.icon).toBe('https://qsp.org/x.png');
  });
});
