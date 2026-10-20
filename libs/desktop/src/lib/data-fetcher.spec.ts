import { beforeEach, describe, expect, it, vi } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import { platform } from '@tauri-apps/plugin-os';
import { fetchBinaryContent, fetchTextContent } from './data-fetcher';

vi.mock('@tauri-apps/plugin-os', () => ({ platform: vi.fn() }));
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }));

const invokeMock = vi.mocked(invoke);
const fetchMock = vi.fn();

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

  it('uses fetch for bundled standalone files', async () => {
    fetchMock.mockResolvedValue({ arrayBuffer: async () => toBuffer([1, 2]) });
    const result = await fetchBinaryContent('tauri://localhost/game/', 'game.cfg');
    expect(invoke).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith('tauri://localhost/game/game.cfg');
    expect(new Uint8Array(result)).toEqual(new Uint8Array([1, 2]));
  });

  it('decodes utf-16le with BOM on both paths', async () => {
    invokeMock.mockResolvedValue(toBuffer(HI_UTF16));
    fetchMock.mockResolvedValue({ arrayBuffer: async () => toBuffer(HI_UTF16) });
    expect(await fetchTextContent('qsp://localhost/abc/', 'game.cfg')).toBe('hi');
    expect(await fetchTextContent('tauri://localhost/game/', 'game.cfg')).toBe('hi');
  });
});
