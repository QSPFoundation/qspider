import { describe, expect, it } from 'vitest';
import { GameShelfEntry } from '@qspider/contracts';
import { importOutcome } from './import-outcome';

const entry = (id: string): GameShelfEntry => ({
  id,
  title: id,
  mode: 'classic',
  loadConfig: { url: 'u/', entrypoint: `${id}.qsps` },
});

describe('importOutcome', () => {
  it('fails when nothing was imported', () => {
    expect(() => importOutcome([])).toThrow('No games imported');
  });

  it('starts the only imported game', () => {
    expect(importOutcome([entry('a')])).toEqual({ start: 'a' });
  });

  it('starts nothing and reports the count when several games were imported', () => {
    expect(importOutcome([entry('a'), entry('b')])).toEqual({ notice: 2 });
  });
});
