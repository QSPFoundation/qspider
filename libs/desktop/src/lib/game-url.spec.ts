import { beforeEach, describe, expect, it, vi } from 'vitest';
import { platform } from '@tauri-apps/plugin-os';
import { buildGameUrl, isGameUrl, isLegacyGameUrl } from './game-url';

vi.mock('@tauri-apps/plugin-os', () => ({ platform: vi.fn() }));

const platformMock = vi.mocked(platform);

describe('game-url', () => {
  beforeEach(() => {
    platformMock.mockReset();
  });

  it('uses https host form on windows', () => {
    platformMock.mockReturnValue('windows');
    expect(buildGameUrl('abc')).toBe('https://qsp.localhost/abc/');
  });

  it('uses qsp scheme elsewhere', () => {
    platformMock.mockReturnValue('linux');
    expect(buildGameUrl('abc')).toBe('qsp://localhost/abc/');
  });

  it('detects game urls', () => {
    platformMock.mockReturnValue('macos');
    expect(isGameUrl('qsp://localhost/abc/x.png')).toBe(true);
    expect(isGameUrl('tauri://localhost/game/x')).toBe(false);
  });

  it('detects legacy urls', () => {
    expect(isLegacyGameUrl('qsp://abc/', 'abc')).toBe(true);
    expect(isLegacyGameUrl('https://qsp.abc/i.png', 'abc')).toBe(true);
    expect(isLegacyGameUrl('qsp://localhost/abc/', 'abc')).toBe(false);
  });
});
