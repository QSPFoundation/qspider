import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { convertFromV1, generateTauriConfig, validate } from './generate.mjs';

const sample = {
  schemaVersion: 1,
  productName: 'My Game',
  version: '1.0.0',
  identifier: 'my.game.id',
  publisher: 'Me',
  copyright: 'Me',
  category: 'Game',
  shortDescription: '',
  longDescription: '',
  window: { title: 'My Game', width: 1024, height: 768, resizable: true, fullscreen: false, center: true },
  updater: { enabled: false, endpoint: '', pubkey: '' },
};
const withUpdater = {
  ...sample,
  updater: { enabled: true, endpoint: 'https://u.github.io/g/updater-v2.json', pubkey: 'KEY' },
};

const templateV1WithExtras = {
  package: { productName: 'My QspiderGame', version: '1.0.0' },
  build: {
    distDir: '../dist/apps/player-standalone',
    beforeBuildCommand: 'npm run build:standalone-desktop',
    withGlobalTauri: false,
  },
  tauri: {
    bundle: {
      active: true,
      targets: ['deb', 'nsis'],
      identifier: 'my.game.id',
      publisher: 'qSpider games',
      copyright: 'werewolf',
      category: 'Game',
      shortDescription: '',
      longDescription: '',
    },
    updater: { active: true, endpoints: [''], dialog: true, pubkey: '' },
    windows: [
      { title: 'My Game', width: 1024, height: 768, center: true, resizable: true, fullscreen: false, visible: false },
    ],
    cli: { args: [] },
  },
};

describe('generateTauriConfig', () => {
  it('generates a self-contained overlay', () => {
    const { config } = generateTauriConfig(sample);
    expect(config.identifier).toBe('my.game.id');
    expect(config.build).toEqual({
      frontendDist: '../dist/apps/player-standalone',
      beforeBuildCommand: 'pnpm run build:standalone-desktop',
    });
    expect(config.bundle.targets).toBe('all');
    expect(config.app.windows[0]).toMatchObject({
      title: 'My Game',
      width: 1024,
      visible: false,
      useHttpsScheme: true,
    });
  });

  it('falls back to productName for an empty shortDescription', () => {
    expect(generateTauriConfig(sample).config.bundle.shortDescription).toBe('My Game');
    expect(generateTauriConfig({ ...sample, shortDescription: 'Hi' }).config.bundle.shortDescription).toBe('Hi');
  });

  it('never emits v1Compatible', () => {
    expect(JSON.stringify(generateTauriConfig(withUpdater).config)).not.toContain('v1Compatible');
    expect(JSON.stringify(generateTauriConfig(sample).config)).not.toContain('v1Compatible');
  });

  it('emits updater plugin and artifacts when enabled', () => {
    const { config } = generateTauriConfig(withUpdater);
    expect(config.plugins.updater).toEqual({ endpoints: ['https://u.github.io/g/updater-v2.json'], pubkey: 'KEY' });
    expect(config.bundle.createUpdaterArtifacts).toBe(true);
  });

  it('removes base updater config when disabled, and leaves cli alone', () => {
    const { config } = generateTauriConfig(sample);
    expect(config.plugins.updater).toBeNull();
    expect(config.bundle.createUpdaterArtifacts).toBe(false);
    expect('cli' in config.plugins).toBe(false);
  });

  it('treats enabled-but-empty updater as disabled with a warning', () => {
    const { config, warnings } = generateTauriConfig({
      ...sample,
      updater: { enabled: true, endpoint: '', pubkey: '' },
    });
    expect(config.plugins.updater).toBeNull();
    expect(config.bundle.createUpdaterArtifacts).toBe(false);
    expect(warnings).toHaveLength(1);
  });
});

describe('validate', () => {
  it('lists missing required fields', () => {
    expect(validate({})).toEqual(expect.arrayContaining([expect.stringContaining('identifier')]));
    expect(validate({})).toEqual(expect.arrayContaining([expect.stringContaining('window.title')]));
  });

  it('accepts a complete config', () => {
    expect(validate(sample)).toEqual([]);
  });
});

describe('convertFromV1', () => {
  it('keeps identifier and lists dropped fields', () => {
    const { config, dropped } = convertFromV1(templateV1WithExtras);
    expect(config.identifier).toBe('my.game.id');
    expect(config.window.title).toBe('My Game');
    expect(config.updater.enabled).toBe(false);
    expect(dropped).toEqual(
      expect.arrayContaining(['tauri.bundle.targets[0]', 'tauri.bundle.targets[1]', 'tauri.cli.args']),
    );
  });

  it('reports v1 keys with no v2 meaning but not build.*', () => {
    const { dropped } = convertFromV1(templateV1WithExtras);
    expect(dropped).toEqual(
      expect.arrayContaining(['tauri.bundle.active', 'tauri.updater.dialog', 'tauri.windows[0].visible']),
    );
    expect(dropped.some((d) => d.startsWith('build.'))).toBe(false);
  });

  it('enables the updater when v1 had endpoint and pubkey', () => {
    const v1 = structuredClone(templateV1WithExtras);
    v1.tauri.updater = { active: true, endpoints: ['https://x/u.json'], pubkey: 'K' };
    const { config } = convertFromV1(v1);
    expect(config.updater).toEqual({ enabled: true, endpoint: 'https://x/u.json', pubkey: 'K' });
  });

  it('rewrites a frozen v1 updater endpoint to updater-v2.json with a warning', () => {
    const v1 = structuredClone(templateV1WithExtras);
    v1.tauri.updater = { active: true, endpoints: ['https://u.github.io/g/updater.json'], pubkey: 'K' };
    const { config, warnings } = convertFromV1(v1);
    expect(config.updater.endpoint).toBe('https://u.github.io/g/updater-v2.json');
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('updater-v2.json');
  });

  it('emits $schema and schemaVersion', () => {
    const { config, warnings } = convertFromV1(templateV1WithExtras);
    expect(config.$schema).toMatch(/qspider\.desktop\.schema\.json$/);
    expect(config.schemaVersion).toBe(1);
    expect(warnings).toEqual([]);
  });

  it('produces a config that validates against the schema required fields', () => {
    const schema = JSON.parse(readFileSync(new URL('./qspider.desktop.schema.json', import.meta.url), 'utf8'));
    const { config } = convertFromV1(templateV1WithExtras);
    expect(validate(config)).toEqual([]);
    for (const key of schema.required) expect(config).toHaveProperty(key);
  });
});
