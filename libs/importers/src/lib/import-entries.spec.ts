import { describe, expect, it } from 'vitest';
import type { GameDescriptor } from '@qspider/contracts';
import { cyrb53 } from '@qspider/utils';
import {
  archiveFallbackEntry,
  pickGameDescriptor,
  archiveGameId,
  descriptorEntry,
  fileEntry,
  splitGameUrl,
  urlConfigEntry,
  urlFallbackEntry,
} from './import-entries';

const loadConfig = { url: 'store://g1/', entrypoint: 'game.qsp' };

const descriptor: GameDescriptor = {
  id: 'my-id',
  mode: 'qspider',
  title: 'My Title',
  author: 'Author',
  ported_by: 'Porter',
  version: '1.2',
  description: 'Desc',
  file: 'sub/game.qsp',
};

describe('splitGameUrl', () => {
  it('strips the query and hash and splits the base from the file name', () => {
    expect(splitGameUrl('https://a.org/g/game.qsp?x=1#y')).toEqual({
      cleanUrl: 'https://a.org/g/game.qsp',
      base: 'https://a.org/g/',
      fileName: 'game.qsp',
    });
  });

  it('keeps percent-encoded characters of the file name', () => {
    expect(splitGameUrl('https://a.org/My%20Game.qsp')).toEqual({
      cleanUrl: 'https://a.org/My%20Game.qsp',
      base: 'https://a.org/',
      fileName: 'My%20Game.qsp',
    });
  });
});

describe('descriptorEntry', () => {
  it('copies the descriptor fields and embeds the descriptor in the load config', () => {
    expect(descriptorEntry(descriptor, loadConfig)).toEqual({
      id: 'my-id',
      mode: 'qspider',
      title: 'My Title',
      author: 'Author',
      ported_by: 'Porter',
      version: '1.2',
      description: 'Desc',
      icon: undefined,
      loadConfig: { url: 'store://g1/', entrypoint: 'game.qsp', descriptor },
    });
  });

  it('prefixes the icon with the load config url when the descriptor has one', () => {
    const withIcon = { ...descriptor, resources: { icon: 'img/icon.png' } };
    expect(descriptorEntry(withIcon, loadConfig).icon).toBe('store://g1/img/icon.png');
  });

  it('leaves the icon unset when the descriptor has resources without an icon', () => {
    const withStyles = { ...descriptor, resources: { styles: ['a.css'] } };
    expect(descriptorEntry(withStyles, loadConfig).icon).toBeUndefined();
  });
});

describe('archiveGameId', () => {
  it('prefers the descriptor id', () => {
    expect(archiveGameId('x.zip', descriptor)).toBe('my-id');
  });

  it('is stable for the same archive name without a descriptor', () => {
    expect(archiveGameId('x.zip')).toBe(archiveGameId('x.zip'));
    expect(archiveGameId('x.zip')).toBe(cyrb53('x.zip'));
    expect(archiveGameId('x.zip')).not.toBe(archiveGameId('y.zip'));
  });
});

describe('archiveFallbackEntry', () => {
  it('names the game after the decoded last segment of the archive url and picks aero for aqsp', () => {
    const entry = archiveFallbackEntry('https://a.org/My%20Game.aqsp', loadConfig);
    expect(entry.title).toBe('My Game.aqsp');
    expect(entry.mode).toBe('aero');
    expect(entry.id).toBe(cyrb53('https://a.org/My%20Game.aqsp'));
    expect(entry.loadConfig).toBe(loadConfig);
  });

  it('uses classic mode for other archives', () => {
    const entry = archiveFallbackEntry('x.zip', loadConfig);
    expect(entry.title).toBe('x.zip');
    expect(entry.mode).toBe('classic');
    expect(entry.author).toBeUndefined();
    expect(entry.icon).toBeUndefined();
  });

  it('lets descriptor values override the defaults', () => {
    expect(archiveFallbackEntry('x.aqsp', loadConfig, descriptor)).toEqual({
      id: 'my-id',
      title: 'My Title',
      mode: 'qspider',
      author: 'Author',
      ported_by: 'Porter',
      version: '1.2',
      description: 'Desc',
      icon: undefined,
      loadConfig,
    });
  });

  it('prefixes the icon with the load config url only when the descriptor has one', () => {
    const withIcon = { ...descriptor, resources: { icon: 'icon.png' } };
    expect(archiveFallbackEntry('x.zip', loadConfig, withIcon).icon).toBe('store://g1/icon.png');
    expect(archiveFallbackEntry('x.zip', loadConfig, descriptor).icon).toBeUndefined();
  });
});

describe('urlConfigEntry', () => {
  it('maps the found game file to the entrypoint under the base url', () => {
    expect(urlConfigEntry(descriptor, 'https://a.org/g/')).toEqual({
      id: 'my-id',
      mode: 'qspider',
      title: 'My Title',
      author: 'Author',
      ported_by: 'Porter',
      version: '1.2',
      description: 'Desc',
      loadConfig: { url: 'https://a.org/g/', entrypoint: 'sub/game.qsp' },
    });
  });
});

describe('urlFallbackEntry', () => {
  it('derives the entry from the url when there is no descriptor', () => {
    const cleanUrl = 'https://a.org/g/game.qsp';
    const entry = urlFallbackEntry(cleanUrl, 'https://a.org/g/', 'game.qsp');
    expect(entry.id).toBe(cyrb53(cleanUrl));
    expect(entry.title).toBe('game.qsp');
    expect(entry.mode).toBe('classic');
    expect(entry.loadConfig.url).toBe('https://a.org/g/');
    expect(entry.loadConfig.entrypoint).toBe('game.qsp');
    expect(entry.loadConfig.descriptor).toBeUndefined();
  });

  it('lets the root descriptor override the defaults and travel in the load config', () => {
    const entry = urlFallbackEntry('https://a.org/g/game.qsp', 'https://a.org/g/', 'game.qsp', descriptor);
    expect(entry.id).toBe('my-id');
    expect(entry.title).toBe('My Title');
    expect(entry.mode).toBe('qspider');
    expect(entry.author).toBe('Author');
    expect(entry.loadConfig.descriptor).toBe(descriptor);
  });
});

describe('fileEntry', () => {
  it('uses the file name hash as the id and the file name as the title', () => {
    expect(fileEntry('game.qsp', loadConfig)).toEqual({
      id: cyrb53('game.qsp'),
      title: 'game.qsp',
      mode: 'classic',
      loadConfig,
    });
  });
});

describe('pickGameDescriptor', () => {
  const entry = (id: string, file: string): GameDescriptor => ({ id, file, title: id, mode: 'classic' });
  const one = entry('one', 'a.qsps');
  const two = entry('two', 'b.qsps');
  const three = entry('three', 'c.qsps');

  it('picks the entry with the game id, not the first one', () => {
    expect(pickGameDescriptor([one, two, three], { id: 'two', file: 'b.qsps' })).toBe(two);
  });

  it('falls back to the file name when no id matches', () => {
    expect(pickGameDescriptor([one, two, three], { id: 'x', file: 'dir/c.qsps' })).toBe(three);
  });

  it('takes the only entry of a single-entry descriptor even under another id and file', () => {
    expect(pickGameDescriptor([one], { id: 'x', file: 'sub/z.qsps' })).toBe(one);
  });

  it('finds nothing among several entries when none matches', () => {
    expect(pickGameDescriptor([one, two], { id: 'x', file: 'z.qsps' })).toBeUndefined();
  });

  it('finds nothing in an empty descriptor', () => {
    expect(pickGameDescriptor([], { id: 'x', file: 'z.qsps' })).toBeUndefined();
  });
});
