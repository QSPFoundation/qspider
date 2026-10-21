import { describe, expect, it } from 'vitest';
import { isSupportedFileType } from './utils';

describe('isSupportedFileType', () => {
  it.each(['game.qsp', 'game.qsps', 'game.gam', 'game.aqsp', 'game.zip', 'game.rar', 'game.7z', 'game.cfg'])(
    'accepts %s',
    (path) => {
      expect(isSupportedFileType(path)).toBe(true);
    },
  );

  it('accepts uppercase extensions', () => {
    expect(isSupportedFileType('GAME.7Z')).toBe(true);
  });

  it('accepts paths with directories', () => {
    expect(isSupportedFileType('/home/user/games/game.7z')).toBe(true);
  });

  it('rejects unsupported files', () => {
    expect(isSupportedFileType('notes.txt')).toBe(false);
  });
});
