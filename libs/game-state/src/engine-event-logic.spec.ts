import { QspPanel } from '@qsp/wasm-engine';
import { describe, expect, it } from 'vitest';
import {
  directoryOf,
  gameFileUrl,
  isExecHref,
  isNewLoc,
  isQspsFile,
  newLocEffect,
  panelVisibility,
  saveTarget,
  shouldPauseOnLink,
  stripExec,
  versionAnswer,
} from './engine-event-logic';

describe('shouldPauseOnLink', () => {
  it('pauses on a link only while debugging, when paused or pausing on links', () => {
    expect(shouldPauseOnLink({ isEnabled: true, isPaused: true, autoPauseOnLinks: false })).toBe(true);
    expect(shouldPauseOnLink({ isEnabled: true, isPaused: false, autoPauseOnLinks: true })).toBe(true);
    expect(shouldPauseOnLink({ isEnabled: true, isPaused: false, autoPauseOnLinks: false })).toBe(false);
    expect(shouldPauseOnLink({ isEnabled: false, isPaused: true, autoPauseOnLinks: true })).toBe(false);
  });
});

describe('exec links', () => {
  it('reads an exec: href in any case as QSP code', () => {
    expect(isExecHref('exec:gt "room"')).toBe(true);
    expect(isExecHref('EXEC:gt "room"')).toBe(true);
    expect(stripExec('EXEC:gt "room"')).toBe('gt "room"');
  });

  it('leaves other hrefs to the browser', () => {
    expect(isExecHref('https://example.com/exec:x')).toBe(false);
    expect(isExecHref('#top')).toBe(false);
  });
});

describe('versionAnswer', () => {
  it('names the player', () => {
    expect(versionAnswer('player', { isBrowser: true, platform: '' })).toBe('qSpider');
  });

  it('names the platform: browser on the web, the OS on desktop', () => {
    expect(versionAnswer('platform', { isBrowser: true, platform: 'linux' })).toBe('browser');
    expect(versionAnswer('platform', { isBrowser: false, platform: 'windows' })).toBe('windows');
    expect(versionAnswer('platform', { isBrowser: false, platform: '' })).toBe('unknown');
  });

  it("leaves any other question to the engine's version", () => {
    expect(versionAnswer('', { isBrowser: true, platform: '' })).toBeUndefined();
    expect(versionAnswer('engine', { isBrowser: false, platform: 'macos' })).toBeUndefined();
  });
});

describe('game files', () => {
  it('converts a .qsps file in any case, and nothing else', () => {
    expect(isQspsFile('game.qsps')).toBe(true);
    expect(isQspsFile('lib/Panels-Lib.QSPS')).toBe(true);
    expect(isQspsFile('game.qsp')).toBe(false);
    expect(isQspsFile('game.qsps.zip')).toBe(false);
  });

  it('takes the directory of a path with its trailing slash', () => {
    expect(directoryOf('/games/pack/game.cfg')).toBe('/games/pack/');
    expect(directoryOf('http://localhost:4200/game/game.cfg')).toBe('http://localhost:4200/game/');
    expect(directoryOf('game.cfg')).toBe('');
  });

  it('keeps the base for a library next to the game', () => {
    expect(gameFileUrl('http://localhost:4200/game/', 'panels-lib.qsps')).toBe('http://localhost:4200/game/');
  });

  it('moves the base into the directory of a game opened from a relative path, with no doubled slash', () => {
    expect(gameFileUrl('http://localhost:4200/game/', 'part2/game.qsp')).toBe('http://localhost:4200/game/part2/');
    expect(gameFileUrl('http://localhost:4200/game/', 'a/b/game.qsp')).toBe('http://localhost:4200/game/a/b/');
  });

  // An absolute path is joined as the fetch joins it (`baseUrl + path`, libs/browser data-fetcher), so the base
  // stays the directory the file was read from, doubled slash included.
  it('joins an absolute path onto the base as the fetch does', () => {
    expect(gameFileUrl('http://localhost:4200/game/', '/part2/game.qsp')).toBe('http://localhost:4200/game//part2/');
  });
});

describe('isNewLoc', () => {
  it('starts a new location on the first text', () => {
    expect(isNewLoc('', 'ROOM ONE')).toBe(true);
  });

  it('starts a new location on text that does not continue the current one', () => {
    expect(isNewLoc('ROOM ONE', 'ROOM TWO')).toBe(true);
    expect(isNewLoc('ROOM ONE', '')).toBe(true);
  });

  it('stays in the location when the text repeats or grows', () => {
    expect(isNewLoc('ROOM ONE', 'ROOM ONE')).toBe(false);
    expect(isNewLoc('ROOM ONE', 'ROOM ONE<br>MORE')).toBe(false);
  });
});

describe('newLocEffect', () => {
  const reader =
    (values: Record<string, string | number>) =>
    (name: string): unknown =>
      values[name];

  it('reads the effect the game set', () => {
    expect(newLocEffect(reader({ $NEWLOC_EFFECT: 'fade', NEWLOC_EFFECT_TIME: 300, NEWLOC_EFFECT_SEQ: 1 }))).toEqual({
      effect: 'fade',
      time: 300,
      seq: true,
    });
  });

  // The engine reads an unset string as '' and an unset number as 0; 0 means unset in QSP (D12), so a time of 0 is 500.
  it('falls back to no effect, 500 ms and not sequential for unset variables', () => {
    expect(newLocEffect(reader({ $NEWLOC_EFFECT: '', NEWLOC_EFFECT_TIME: 0, NEWLOC_EFFECT_SEQ: 0 }))).toEqual({
      effect: '',
      time: 500,
      seq: false,
    });
  });
});

describe('panelVisibility', () => {
  const none = { stats: false, acts: false, objs: false, cmd: false };

  it('names the stats panel for VARS', () => {
    expect(panelVisibility(QspPanel.VARS)).toEqual({ ...none, stats: true });
  });

  it('names the actions panel for ACTS', () => {
    expect(panelVisibility(QspPanel.ACTS)).toEqual({ ...none, acts: true });
  });

  it('names the objects panel for OBJS', () => {
    expect(panelVisibility(QspPanel.OBJS)).toEqual({ ...none, objs: true });
  });

  it('names the input line for INPUT', () => {
    expect(panelVisibility(QspPanel.INPUT)).toEqual({ ...none, cmd: true });
  });

  it('names no panel for MAIN or VIEW', () => {
    expect(panelVisibility(QspPanel.MAIN)).toEqual(none);
    expect(panelVisibility(QspPanel.VIEW)).toEqual(none);
  });

  it('names every panel in a combined mask', () => {
    expect(panelVisibility(QspPanel.VARS | QspPanel.OBJS)).toEqual({ ...none, stats: true, objs: true });
    expect(panelVisibility(QspPanel.VARS | QspPanel.ACTS | QspPanel.OBJS | QspPanel.INPUT)).toEqual({
      stats: true,
      acts: true,
      objs: true,
      cmd: true,
    });
  });
});

describe('saveTarget', () => {
  it('answers the engine at once when no game runs', () => {
    expect(saveTarget(false, 'slot1.sav')).toBe('answer-now');
    expect(saveTarget(false, '')).toBe('answer-now');
  });

  it('saves to or loads from a path the game names', () => {
    expect(saveTarget(true, 'slot1.sav')).toBe('path');
  });

  it('asks the player when the game names no path', () => {
    expect(saveTarget(true, '')).toBe('ask-player');
  });
});
