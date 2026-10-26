import { describe, expect, it } from 'vitest';
import { APP_ORIGINS, appAssetUrl, resolveResourceUrl, resourceRoute } from './resource-route';

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
