import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { assignShards, FILE_OVERHEAD_S, mainSpecFiles, parseShard, timingKey } from './shards';

const DESKTOP_DIR = fileURLToPath(new URL('.', import.meta.url));
const load = (files: string[], seconds: Record<string, number>) =>
  files.reduce((sum, f) => sum + (seconds[f] ?? 0) + FILE_OVERHEAD_S, 0);

describe('parseShard', () => {
  it('accepts 1/3 and 3/3', () => {
    expect(parseShard('1/3')).toEqual({ current: 1, total: 3 });
    expect(parseShard('3/3')).toEqual({ current: 3, total: 3 });
  });
  it('refuses 0/3, 4/3, a/b, 1/0 and empty', () => {
    for (const bad of ['0/3', '4/3', 'a/b', '1/0', '']) {
      expect(() => parseShard(bad), bad).toThrow(/e\.g\. 1\/3/);
    }
  });
  it('names the bad value in the message', () => {
    expect(() => parseShard('4/3')).toThrow(/4\/3/);
  });
});

describe('assignShards', () => {
  it('puts every file in exactly one shard', () => {
    const files = Array.from({ length: 10 }, (_, i) => `f${i}.scenario.ts`);
    const seconds = Object.fromEntries(files.map((f, i) => [f, 5 + i * 3]));
    const flat = assignShards(files, seconds, 3).flat();
    expect(flat.slice().sort()).toEqual(files.slice().sort());
    expect(new Set(flat).size).toBe(flat.length);
  });
  it('balances by time', () => {
    const seconds = { a: 100, b: 60, c: 50, d: 40, e: 10 };
    const shards = assignShards(Object.keys(seconds), seconds, 2);
    const loads = shards.map((s) => load(s, seconds));
    const ideal = loads.reduce((a, b) => a + b, 0) / 2;
    expect(Math.max(...loads)).toBeLessThanOrEqual(ideal + 10 + FILE_OVERHEAD_S);
    expect(shards.find((s) => s.includes('a'))).not.toContain('b');
  });
  it('is deterministic', () => {
    const seconds = { a: 30, b: 30, c: 20, d: 20, e: 10, f: 10 };
    const files = Object.keys(seconds);
    expect(assignShards(files.slice().reverse(), seconds, 3)).toEqual(assignShards(files, seconds, 3));
  });
  it('weighs a file missing from the table as the median', () => {
    // median of 10/20/30 is 20; `new` (22) then joins `b` (22) rather than `c` alone: shards [a,c] vs [b,new]
    const shards = assignShards(['a', 'b', 'c', 'new'], { a: 10, b: 20, c: 30 }, 2);
    expect(shards).toEqual([
      ['a', 'c'],
      ['b', 'new'],
    ]);
  });
  it('ignores table entries for deleted files', () => {
    const shards = assignShards(['a', 'b'], { a: 10, b: 10, gone: 500 }, 2);
    expect(shards).toEqual([['a'], ['b']]);
  });
  it('gives empty shards when n exceeds files', () => {
    const shards = assignShards(['a', 'b'], { a: 5, b: 5 }, 4);
    expect(shards).toHaveLength(4);
    expect(shards.filter((s) => s.length === 0)).toHaveLength(2);
  });
  it('with an empty table weighs every file equally', () => {
    const shards = assignShards(['a', 'b', 'c', 'd', 'e', 'f'], {}, 3);
    expect(shards.map((s) => s.length)).toEqual([2, 2, 2]);
  });
});

describe('timingKey', () => {
  it('strips everything up to scenarios/', () => {
    expect(timingKey('file:///D:/a/qspider/qspider/apps/player-e2e/scenarios/sound.scenario.ts')).toBe(
      'sound.scenario.ts',
    );
    expect(timingKey('file:///apps/player-e2e/scenarios/sub/x.scenario.ts')).toBe('sub/x.scenario.ts');
    expect(timingKey('D:\\a\\apps\\player-e2e\\scenarios\\sub\\x.scenario.ts')).toBe('sub/x.scenario.ts');
  });
});

describe('mainSpecFiles', () => {
  it('lists the scenarios and leaves out standalone', () => {
    const files = mainSpecFiles(DESKTOP_DIR);
    expect(files).toContain('core-flow.scenario.ts');
    expect(files.some((f) => f.startsWith('standalone/'))).toBe(false);
    const root = new URL('../../scenarios/', import.meta.url);
    const expected = readdirSync(root, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() && e.name !== 'standalone'
        ? readdirSync(new URL(`${e.name}/`, root), { recursive: true })
            .map((n) => `${e.name}/${String(n)}`)
            .filter((n) => n.endsWith('.scenario.ts'))
        : e.name.endsWith('.scenario.ts')
          ? [e.name]
          : [],
    );
    expect(files).toEqual(expected.sort());
  });
});
