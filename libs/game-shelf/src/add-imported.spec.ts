import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TFunction } from 'i18next';
import { GameShelfEntry } from '@qspider/contracts';
import { showNotice } from '@qspider/game-state';
import { addImported } from './add-imported';
import { games$ } from './game-shelf';

vi.mock('@qspider/game-state', () => ({ showNotice: vi.fn() }));
vi.mock('./game-shelf', () => ({ games$: { actions: { add: vi.fn() } } }));

const add = vi.mocked(games$.actions.add);
const notice = vi.mocked(showNotice);
const t = ((key: string, options: { count: number }) => key.replace('{{ count }}', String(options.count))) as TFunction;

const entry = (id: string): GameShelfEntry =>
  ({ id, title: id, mode: 'classic', loadConfig: { url: 'u/', entrypoint: `${id}.qsps` } }) as GameShelfEntry;

describe('addImported', () => {
  beforeEach(() => {
    add.mockReset();
    notice.mockReset();
  });

  it('puts several games on the shelf with a notice and starts none', () => {
    const imported = [entry('a'), entry('b')];
    expect(addImported(imported, t)).toBeUndefined();
    expect(add.mock.calls).toEqual([
      ['a', imported[0]],
      ['b', imported[1]],
    ]);
    expect(notice).toHaveBeenCalledWith('2 games added to shelf');
  });

  it('puts a single game on the shelf and returns it to start, without a notice', () => {
    const imported = [entry('a')];
    expect(addImported(imported, t)).toBe('a');
    expect(add).toHaveBeenCalledWith('a', imported[0]);
    expect(notice).not.toHaveBeenCalled();
  });

  it('fails when nothing was imported', () => {
    expect(() => addImported([], t)).toThrow('No games imported');
    expect(add).not.toHaveBeenCalled();
  });
});
