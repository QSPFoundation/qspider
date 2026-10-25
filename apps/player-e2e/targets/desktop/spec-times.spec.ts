import { describe, expect, it } from 'vitest';
import { parseSpecTimes } from './spec-times';

const T = '2026-10-24T18:41:44.8623135Z';
const run = (id: string, file: string) => `${T} [${id}] RUNNING in undefined - file://${file}`;
const done = (id: string, result: string, time: string) => `${T} [wry 0.57 linux #${id}] ${result} (${time})`;
const log = (...lines: string[]) => lines.join('\n');

describe('parseSpecTimes', () => {
  it("reads each worker's file and passing time", () => {
    const text = log(
      run('0-0', '/apps/player-e2e/scenarios/actions.scenario.ts'),
      run('0-1', '/apps/player-e2e/scenarios/dialogs.scenario.ts'),
      done('0-0', '5 passing', '17.9s'),
      done('0-1', '9 passing', '29.6s'),
    );
    expect(parseSpecTimes(text)).toEqual({ 'actions.scenario.ts': 17.9, 'dialogs.scenario.ts': 29.6 });
  });
  it('parses minutes and milliseconds', () => {
    const text = log(
      run('0-0', '/apps/player-e2e/scenarios/saves.scenario.ts'),
      run('0-1', '/apps/player-e2e/scenarios/tiny.scenario.ts'),
      done('0-0', '3 passing', '1m 19.3s'),
      done('0-1', '1 passing', '850ms'),
    );
    expect(parseSpecTimes(text)).toEqual({ 'saves.scenario.ts': 79.3, 'tiny.scenario.ts': 0.85 });
  });
  it('reads Windows drive-letter paths', () => {
    const text = log(
      run('0-6', '/D:/a/qspider/qspider/apps/player-e2e/scenarios/sound.scenario.ts'),
      `${T} [webview2 155.0.4283.62 windows #0-6] 4 passing (51.5s)`,
    );
    expect(parseSpecTimes(text)).toEqual({ 'sound.scenario.ts': 51.5 });
  });
  it('skips a worker that has failures', () => {
    const text = log(run('0-0', '/apps/player-e2e/scenarios/a.scenario.ts'), done('0-0', '4 failing', '13.9s'));
    expect(parseSpecTimes(text)).toEqual({});
  });
  it("a retried file takes the later worker's time", () => {
    const text = log(
      run('0-0', '/apps/player-e2e/scenarios/a.scenario.ts'),
      done('0-0', '1 passing', '10.0s'),
      run('0-3', '/apps/player-e2e/scenarios/a.scenario.ts'),
      done('0-3', '1 passing', '12.5s'),
    );
    expect(parseSpecTimes(text)).toEqual({ 'a.scenario.ts': 12.5 });
  });
  it('counts a worker that passed without a summary as 0 s', () => {
    const text = log(
      run('0-2', '/apps/player-e2e/scenarios/themes.scenario.ts'),
      `${T} [0-2] PASSED in undefined - file:///apps/player-e2e/scenarios/themes.scenario.ts`,
    );
    expect(parseSpecTimes(text)).toEqual({ 'themes.scenario.ts': 0 });
  });
  it('returns {} for a log with no spec reporter lines', () => {
    expect(parseSpecTimes(`${T} hello\n${T} world`)).toEqual({});
  });
});
