import { describe, expect, it } from 'vitest';
import type { ThemeData } from './theme-parser';
import { addTheme, CLASSIC_THEME, resetThemes, themeDataOf, ThemeRegistry } from './theme-registry';

function theme(isUserDefined: boolean, link: string): ThemeData {
  return { is_user_defined: isUserDefined, css_variables: [], translations: [], css_links: [link], script_links: [] };
}
const builtIn = theme(false, 'qspider:themes/classic.css');
const aero = theme(false, 'qspider:themes/aero.css');
const gameTheme = theme(true, 'game.css');

describe('addTheme', () => {
  it('adds a theme under its alias and leaves the others', () => {
    const registry = addTheme({ [CLASSIC_THEME]: builtIn }, 'mine', gameTheme);
    expect(registry).toEqual({ [CLASSIC_THEME]: builtIn, mine: gameTheme });
  });

  it('does not change the registry it was given', () => {
    const before: ThemeRegistry = { [CLASSIC_THEME]: builtIn };
    addTheme(before, 'mine', gameTheme);
    expect(before).toEqual({ [CLASSIC_THEME]: builtIn });
  });

  it('lets a game theme replace an earlier game theme of the same alias', () => {
    const newer = theme(true, 'newer.css');
    expect(addTheme({ mine: gameTheme }, 'mine', newer)['mine']).toBe(newer);
  });

  it('does not let a game theme replace a built-in alias (D10)', () => {
    const registry = addTheme({ [CLASSIC_THEME]: builtIn }, CLASSIC_THEME, gameTheme);
    expect(registry[CLASSIC_THEME]).toBe(builtIn);
  });

  it('lets a built-in theme be registered again, as the app does on every start', () => {
    const reloaded = theme(false, 'qspider:themes/classic2.css');
    expect(addTheme({ [CLASSIC_THEME]: builtIn }, CLASSIC_THEME, reloaded)[CLASSIC_THEME]).toBe(reloaded);
  });
});

describe('resetThemes', () => {
  it('drops the game themes and keeps the built-in ones', () => {
    expect(resetThemes({ [CLASSIC_THEME]: builtIn, 'qspider:aero': aero, mine: gameTheme })).toEqual({
      [CLASSIC_THEME]: builtIn,
      'qspider:aero': aero,
    });
  });

  it('leaves the built-ins in place after a game theme named like one was added (D10)', () => {
    const registry = addTheme({ [CLASSIC_THEME]: builtIn }, CLASSIC_THEME, gameTheme);
    expect(resetThemes(registry)[CLASSIC_THEME]).toBe(builtIn);
  });
});

describe('themeDataOf', () => {
  it('returns the data of the current theme', () => {
    expect(themeDataOf({ mine: gameTheme }, 'mine')).toBe(gameTheme);
  });

  it('returns an empty object when the current theme is not registered', () => {
    expect(themeDataOf({ mine: gameTheme }, 'gone')).toEqual({});
  });
});
