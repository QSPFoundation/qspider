import { beforeEach, describe, expect, it, vi } from 'vitest';
import { platform } from '@tauri-apps/plugin-os';
import { shouldShimXhr } from './setup';

vi.mock('@tauri-apps/plugin-os', () => ({ platform: vi.fn() }));
vi.mock('@qspider/game-state', () => ({ baseUrl$: { value: '' } }));

const platformMock = vi.mocked(platform);

describe('shouldShimXhr', () => {
  beforeEach(() => {
    platformMock.mockReset();
  });

  it('shims on linux/macos game urls', () => {
    platformMock.mockReturnValue('linux');
    expect(shouldShimXhr('qsp://localhost/u/')).toBe(true);
  });

  it('does not shim on windows', () => {
    platformMock.mockReturnValue('windows');
    expect(shouldShimXhr('https://qsp.localhost/u/')).toBe(false);
  });

  it('does not shim bundled standalone', () => {
    platformMock.mockReturnValue('macos');
    expect(shouldShimXhr('tauri://localhost/game/')).toBe(false);
  });
});
