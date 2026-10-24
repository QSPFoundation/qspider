// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameShelfEntry } from '@qspider/contracts';
import { currentGameEntry$, mainContent$, startupFinished$ } from '@qspider/game-state';
import { startE2eMarks } from './e2e-marks';

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }));
vi.mock('@qspider/game-state', async () => {
  const { atom } = await import('xoid');
  return {
    startupFinished$: atom(false),
    currentGameEntry$: atom(null),
    mainContent$: atom(''),
  };
});

const game = { id: 'g1' } as GameShelfEntry;

describe('startE2eMarks', () => {
  let calls: [string, string][];
  let stop: () => void;

  beforeEach(() => {
    startupFinished$.set(false);
    currentGameEntry$.set(null);
    mainContent$.set('');
    calls = [];
    stop = startE2eMarks(async (marker, detail) => {
      calls.push([marker, detail]);
    });
  });

  afterEach(() => stop());

  it('emits startup-finished, game-running and main-text once each, in order', () => {
    mainContent$.set('<p>E2E START</p>');
    startupFinished$.set(true);
    currentGameEntry$.set(game);
    mainContent$.set('<p>E2E\n START</p>');
    mainContent$.set('<p>E2E START</p>');
    startupFinished$.set(false);
    startupFinished$.set(true);
    currentGameEntry$.set({ ...game });

    expect(calls).toEqual([
      ['startup-finished', ''],
      ['game-running', 'g1'],
      ['main-text', 'E2E START'],
    ]);
  });

  it('does not emit main-text for empty or whitespace-only content', () => {
    startupFinished$.set(true);
    currentGameEntry$.set(game);
    mainContent$.set('<p>   </p>');
    mainContent$.set(' \n\t ');
    mainContent$.set('');

    expect(calls).toEqual([
      ['startup-finished', ''],
      ['game-running', 'g1'],
    ]);
  });

  it('does not emit game-running before startup-finished', () => {
    currentGameEntry$.set(game);
    mainContent$.set('<div>line one<br>\n  line two</div>');
    expect(calls).toEqual([]);

    startupFinished$.set(true);

    expect(calls).toEqual([
      ['startup-finished', ''],
      ['game-running', 'g1'],
      ['main-text', 'line one line two'],
    ]);
  });
});
