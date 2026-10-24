import { beforeEach, describe, expect, it, vi } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import { platform } from '@tauri-apps/plugin-os';
import { fetchBinaryContent, fetchTextContent } from './data-fetcher';

vi.mock('@tauri-apps/plugin-os', () => ({ platform: vi.fn() }));
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }));

const invokeMock = vi.mocked(invoke);
const fetchMock = vi.fn();

function okResponse(bytes: number[], contentType = 'application/octet-stream'): unknown {
  return {
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': contentType }),
    arrayBuffer: async () => toBuffer(bytes),
  };
}

function toBuffer(bytes: number[]): ArrayBuffer {
  return new Uint8Array(bytes).buffer;
}

const HI_UTF16 = [0xff, 0xfe, 0x68, 0, 0x69, 0];

describe('data-fetcher', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.mocked(platform).mockReturnValue('linux');
  });

  it('routes game urls through read_resource', async () => {
    invokeMock.mockResolvedValue(toBuffer([0x68, 0x69]));
    expect(await fetchTextContent('qsp://localhost/abc/', 'a.txt')).toBe('hi');
    expect(invoke).toHaveBeenCalledWith('read_resource', { url: 'qsp://localhost/abc/a.txt' });
  });

  it.each(['tauri://localhost/game/', 'http://tauri.localhost/game/', 'https://tauri.localhost/game/'])(
    'reads bundled app files (%s) through read_app_asset, not fetch',
    async (base) => {
      invokeMock.mockResolvedValue(toBuffer([1, 2]));
      const result = await fetchBinaryContent(base, 'game.cfg');
      expect(invoke).toHaveBeenCalledWith('read_app_asset', { url: `${base}game.cfg` });
      expect(fetch).not.toHaveBeenCalled();
      expect(new Uint8Array(result)).toEqual(new Uint8Array([1, 2]));
    },
  );

  it.each([
    ['./standalone.qsps', 'tauri://localhost/game/standalone.qsps'],
    ['sub/../css/a.css', 'tauri://localhost/game/css/a.css'],
    ['my file ф.txt', 'tauri://localhost/game/my%20file%20%D1%84.txt'],
  ])('passes read_app_asset a normalised url for %s', async (path, url) => {
    invokeMock.mockResolvedValue(toBuffer([1]));
    await fetchBinaryContent('tauri://localhost/game/', path);
    expect(invoke).toHaveBeenCalledWith('read_app_asset', { url });
  });

  it('rejects a missing bundled app file', async () => {
    invokeMock.mockRejectedValue('file not found: game/missing.cfg');
    await expect(fetchTextContent('tauri://localhost/game/', 'missing.cfg')).rejects.toThrow(
      'tauri://localhost/game/missing.cfg',
    );
  });

  it('decodes utf-16le with BOM on every path', async () => {
    invokeMock.mockResolvedValue(toBuffer(HI_UTF16));
    fetchMock.mockResolvedValue(okResponse(HI_UTF16));
    expect(await fetchTextContent('qsp://localhost/abc/', 'game.cfg')).toBe('hi');
    expect(await fetchTextContent('tauri://localhost/game/', 'game.cfg')).toBe('hi');
    expect(await fetchTextContent('https://example.com/game/', 'game.cfg')).toBe('hi');
  });

  it('uses fetch for external urls', async () => {
    fetchMock.mockResolvedValue(okResponse([0x68, 0x69], 'text/html'));
    expect(await fetchTextContent('https://example.com/game/', 'game.cfg')).toBe('hi');
    expect(fetch).toHaveBeenCalledWith('https://example.com/game/game.cfg');
    expect(invoke).not.toHaveBeenCalled();
  });

  it('rejects on non-ok responses from external urls', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404, headers: new Headers() });
    await expect(fetchBinaryContent('https://example.com/game/', 'missing.bin')).rejects.toThrow(
      'https://example.com/game/missing.bin',
    );
  });
});
