import type { GameDescriptor, PlayerConfig } from '@qspider/contracts';
import { describe, expect, it } from 'vitest';
import {
  aeroHeight,
  aeroWidth,
  aeroWindow,
  chooseTheme,
  gameMode,
  parseGameCommand,
  pickDescriptor,
  slotCount,
  windowSettingsPlan,
} from './game-config';

function game(fields: Partial<GameDescriptor>): GameDescriptor {
  return { id: 'g', mode: 'classic', title: 'G', file: 'g.qsp', ...fields };
}

describe('defaults from the running game', () => {
  it('is a classic game of 800 by 600 with 9 slots when no game runs', () => {
    expect(gameMode(null)).toBe('classic');
    expect(gameMode(undefined)).toBe('classic');
    expect(aeroWidth(null)).toBe(800);
    expect(aeroHeight(null)).toBe(600);
    expect(slotCount(null)).toBe(9);
  });

  it('takes the mode, size and slots the game names', () => {
    const aero = game({ mode: 'aero', aero: { width: 1024, height: 700 }, save_slots: 5 });
    expect(gameMode(aero)).toBe('aero');
    expect(aeroWidth(aero)).toBe(1024);
    expect(aeroHeight(aero)).toBe(700);
    expect(slotCount(aero)).toBe(5);
  });

  it('keeps a game with no aero size at the default size', () => {
    expect(aeroWidth(game({ mode: 'aero' }))).toBe(800);
    expect(aeroHeight(game({ mode: 'aero' }))).toBe(600);
  });
});

describe('pickDescriptor', () => {
  const first = game({ id: 'first' });
  const second = game({ id: 'second' });

  it('takes the only game of a game.cfg whatever its id', () => {
    expect(pickDescriptor({ game: [first] }, 'other')).toBe(first);
  });

  it('takes the game with the shelf entry id among several', () => {
    expect(pickDescriptor({ game: [first, second] }, 'second')).toBe(second);
  });

  it('answers nothing when no game has the id', () => {
    expect(pickDescriptor({ game: [first, second] }, 'third')).toBeUndefined();
  });

  it('answers nothing for a game.cfg with no game list', () => {
    expect(pickDescriptor({} as PlayerConfig, 'first')).toBeUndefined();
  });
});

describe('aeroWindow', () => {
  it('makes the window the aero size and not resizable, over the window the game.cfg gave', () => {
    expect(
      aeroWindow({ width: 640, height: 480, minWidth: 320, minHeight: 200 }, { width: 1000, height: 700 }),
    ).toEqual({
      width: 1000,
      height: 700,
      minWidth: 320,
      minHeight: 200,
      resizable: false,
    });
  });

  it('makes a window from the size alone when the game.cfg gave none', () => {
    expect(aeroWindow(undefined, { width: 800, height: 600 })).toEqual({ width: 800, height: 600, resizable: false });
  });

  it('forces not resizable even when the game.cfg window was resizable', () => {
    expect(aeroWindow({ width: 1, height: 1, resizable: true }, { width: 2, height: 2 }).resizable).toBe(false);
  });
});

describe('chooseTheme', () => {
  const registered =
    (...aliases: string[]) =>
    (alias: string) =>
      aliases.includes(alias);

  it('starts a classic game in the classic theme and an aero game in the aero theme', () => {
    expect(chooseTheme({ mode: 'classic' }, registered())).toEqual({ theme: 'qspider:classic' });
    expect(chooseTheme({ mode: 'aero' }, registered())).toEqual({ theme: 'qspider:aero' });
    expect(chooseTheme({ mode: 'qspider' }, registered())).toEqual({ theme: 'qspider:classic' });
  });

  it('starts in the default theme the game names when it is registered', () => {
    expect(chooseTheme({ mode: 'aero', defaultTheme: 'my-theme' }, registered('my-theme'))).toEqual({
      theme: 'my-theme',
    });
  });

  it('falls back to the mode theme and names the missing one when the default theme is not registered', () => {
    expect(chooseTheme({ mode: 'aero', defaultTheme: 'my-theme' }, registered())).toEqual({
      theme: 'qspider:aero',
      missing: 'my-theme',
    });
    expect(chooseTheme({ mode: 'classic', defaultTheme: 'my-theme' }, registered())).toEqual({
      theme: 'qspider:classic',
      missing: 'my-theme',
    });
  });
});

describe('windowSettingsPlan', () => {
  it('does nothing for a game with no window settings', () => {
    expect(windowSettingsPlan(undefined)).toBeNull();
  });

  it('is resizable by default and resizes to the given size', () => {
    expect(windowSettingsPlan({ width: 800, height: 600 })).toEqual({
      size: { width: 800, height: 600 },
      resizable: true,
      minSize: null,
      maxSize: null,
      fullscreen: false,
    });
  });

  it('sets the minimum and maximum sizes of a resizable window only when both sides are given', () => {
    const plan = windowSettingsPlan({
      width: 800,
      height: 600,
      minWidth: 400,
      minHeight: 300,
      maxWidth: 1600,
    });
    expect(plan?.minSize).toEqual({ width: 400, height: 300 });
    expect(plan?.maxSize).toBeNull();
  });

  it('leaves the limits alone for a window that is not resizable', () => {
    const plan = windowSettingsPlan({
      width: 800,
      height: 600,
      resizable: false,
      minWidth: 400,
      minHeight: 300,
      maxWidth: 1600,
      maxHeight: 1200,
    });
    expect(plan).toMatchObject({ resizable: false, minSize: null, maxSize: null });
  });

  it('does not resize for a size of 0', () => {
    expect(windowSettingsPlan({ width: 0, height: 600 })?.size).toBeNull();
  });

  it('goes fullscreen when the game asks', () => {
    expect(windowSettingsPlan({ width: 800, height: 600, fullscreen: true })?.fullscreen).toBe(true);
  });
});

describe('parseGameCommand', () => {
  it('reads pause:<panel> as opening that pause panel', () => {
    expect(parseGameCommand('pause:saves')).toEqual({ type: 'pause', panel: 'saves' });
  });

  it('reads scroll:<panel>:<direction>', () => {
    expect(parseGameCommand('scroll:main:top')).toEqual({ type: 'scroll', panel: 'main', direction: 'top' });
    expect(parseGameCommand('scroll:stats:bottom')).toEqual({ type: 'scroll', panel: 'stats', direction: 'bottom' });
  });

  it('reads a scroll with no direction as having none', () => {
    expect(parseGameCommand('scroll:main')).toEqual({ type: 'scroll', panel: 'main', direction: undefined });
  });

  it('treats a plain command name as no parsed command', () => {
    expect(parseGameCommand('restart')).toEqual({ type: 'other' });
    expect(parseGameCommand('toggle-mute')).toEqual({ type: 'other' });
  });
});
