import { describe, expect, it } from 'vitest';
import type { GameDescriptor, PlayerConfig } from '@qspider/contracts';
import { cleanConfigUrl, configEntry } from './config-entry';

describe('cleanConfigUrl', () => {
  it('strips the search and the hash', () => {
    expect(cleanConfigUrl('https://a.org/g/game.cfg?x#y')).toBe('https://a.org/g/game.cfg');
  });

  it('keeps a url that has neither', () => {
    expect(cleanConfigUrl('https://a.org/g/game.cfg')).toBe('https://a.org/g/game.cfg');
  });

  it('rejects a file that is not a .cfg', () => {
    expect(() => cleanConfigUrl('https://a.org/g/game.qsp')).toThrow('Only .cfg files are supported');
  });

  it('judges the extension without the search', () => {
    expect(() => cleanConfigUrl('https://a.org/g/game.qsp?file=x.cfg')).toThrow('Only .cfg files are supported');
  });
});

describe('configEntry', () => {
  const game: GameDescriptor = {
    id: 'g1',
    mode: 'aero',
    title: 'Game One',
    author: 'Author',
    ported_by: 'Porter',
    version: '1.2',
    file: 'game.qsp',
  };

  it('maps the first game with its files next to the config', () => {
    expect(configEntry({ game: [game] }, 'https://a.org/g/game.cfg')).toEqual({
      id: 'g1',
      mode: 'aero',
      title: 'Game One',
      author: 'Author',
      ported_by: 'Porter',
      version: '1.2',
      loadConfig: { url: 'https://a.org/g/', entrypoint: 'game.qsp', descriptor: game },
    });
  });

  it('throws when the config has no game', () => {
    const config: PlayerConfig = { game: [] };
    expect(() => configEntry(config, 'https://a.org/g/game.cfg')).toThrow('Game not found');
  });

  it('takes the first of several games', () => {
    const second: GameDescriptor = { ...game, id: 'g2', title: 'Game Two', file: 'two.qsp' };
    const entry = configEntry({ game: [game, second] }, 'https://a.org/g/game.cfg');
    expect(entry.id).toBe('g1');
    expect(entry.loadConfig?.entrypoint).toBe('game.qsp');
  });
});
