import { describe, expect, it } from 'vitest';
import { buildGameUrlFor, gameUrlBaseFor, isGameUrlFor, isLegacyGameUrl, shouldShimXhrFor } from './game-url-rules';

describe('gameUrlBaseFor', () => {
  it('uses the https host form on windows', () => {
    expect(gameUrlBaseFor('windows')).toBe('https://qsp.localhost/');
  });

  it.each(['linux', 'macos'])('uses the qsp scheme on %s', (os) => {
    expect(gameUrlBaseFor(os)).toBe('qsp://localhost/');
  });
});

describe('buildGameUrlFor', () => {
  it('uses https host form on windows', () => {
    expect(buildGameUrlFor('windows', 'abc')).toBe('https://qsp.localhost/abc/');
  });

  it('uses qsp scheme elsewhere', () => {
    expect(buildGameUrlFor('linux', 'abc')).toBe('qsp://localhost/abc/');
  });
});

describe('isGameUrlFor', () => {
  it('detects game urls', () => {
    expect(isGameUrlFor('macos', 'qsp://localhost/abc/x.png')).toBe(true);
    expect(isGameUrlFor('macos', 'tauri://localhost/game/x')).toBe(false);
  });

  it('does not take the qsp scheme for a game url on windows', () => {
    expect(isGameUrlFor('windows', 'qsp://localhost/x')).toBe(false);
  });
});

describe('isLegacyGameUrl', () => {
  it('detects legacy urls', () => {
    expect(isLegacyGameUrl('qsp://abc/', 'abc')).toBe(true);
    expect(isLegacyGameUrl('https://qsp.abc/i.png', 'abc')).toBe(true);
    expect(isLegacyGameUrl('qsp://localhost/abc/', 'abc')).toBe(false);
  });
});

describe('shouldShimXhrFor', () => {
  it('shims on linux/macos game urls', () => {
    expect(shouldShimXhrFor('linux', 'qsp://localhost/u/')).toBe(true);
  });

  it('does not shim on windows', () => {
    expect(shouldShimXhrFor('windows', 'https://qsp.localhost/u/')).toBe(false);
  });

  it('does not shim bundled standalone', () => {
    expect(shouldShimXhrFor('macos', 'tauri://localhost/game/')).toBe(false);
  });

  it('does not shim an external base url', () => {
    expect(shouldShimXhrFor('linux', 'https://example.com/')).toBe(false);
  });
});
