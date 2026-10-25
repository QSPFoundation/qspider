import { describe, expect, it } from 'vitest';
import { APP_ORIGINS, appAssetUrl, decodeText, resolveResourceUrl, resourceRoute } from './resource-route';

describe('resolveResourceUrl', () => {
  it('puts a relative path after the base, turning backslashes into slashes', () => {
    expect(resolveResourceUrl('qsp://localhost/abc/', 'img\\a.png')).toBe('qsp://localhost/abc/img/a.png');
  });

  it('returns an external url unchanged', () => {
    expect(resolveResourceUrl('qsp://localhost/abc/', 'https://x.org/a.png')).toBe('https://x.org/a.png');
  });
});

describe('resourceRoute', () => {
  it.each(APP_ORIGINS)('reads files of %s as app assets', (origin) => {
    expect(resourceRoute('linux', `${origin}game/game.cfg`)).toBe('app-asset');
  });

  it('reads game urls through the game route on linux and windows', () => {
    expect(resourceRoute('linux', 'qsp://localhost/abc/a.txt')).toBe('game');
    expect(resourceRoute('windows', 'https://qsp.localhost/abc/a.txt')).toBe('game');
  });

  it('fetches any other url from the network', () => {
    expect(resourceRoute('linux', 'https://example.com/a')).toBe('network');
  });
});

describe('appAssetUrl', () => {
  it.each([
    ['tauri://localhost/game/./standalone.qsps', 'tauri://localhost/game/standalone.qsps'],
    ['tauri://localhost/game/sub/../css/a.css', 'tauri://localhost/game/css/a.css'],
    ['tauri://localhost/game/my file ф.txt', 'tauri://localhost/game/my%20file%20%D1%84.txt'],
  ])('normalises %s as fetch would', (url, expected) => {
    expect(appAssetUrl(url)).toBe(expected);
  });
});

describe('decodeText', () => {
  it('decodes utf-16le when the bytes start with a BOM', () => {
    expect(decodeText(new Uint8Array([0xff, 0xfe, 0x68, 0, 0x69, 0]))).toBe('hi');
  });

  it('decodes plain ASCII as utf-8', () => {
    expect(decodeText(new Uint8Array([0x68, 0x69]))).toBe('hi');
  });

  it('decodes Cyrillic utf-8 bytes', () => {
    expect(decodeText(new Uint8Array([0xd0, 0x9f, 0xd1, 0x80, 0xd0, 0xb8, 0xd0, 0xb2, 0xd0, 0xb5, 0xd1, 0x82]))).toBe(
      'Привет',
    );
  });
});
