import type { CssVarDefinition } from '@qspider/game-state';
import { describe, expect, it } from 'vitest';
import { cssVariableRules, resolveThemeUrl, resourceVariableCss } from './css-variable-rules';

const definition = (overrides: Record<string, unknown>): CssVarDefinition =>
  ({ name: '--x', from: 'X', type: null, defaultValue: '', ...overrides }) as CssVarDefinition;

describe('cssVariableRules', () => {
  it('writes a colour with its contrast, inverted and inverted contrast variants', () => {
    expect(
      cssVariableRules(definition({ type: 'color', withContrast: true, withInverted: true }), String(0xff0000ff)),
    ).toEqual(['--x: rgba(255,0,0,1)', '--x-contrast: white', '--x-inverted: #00FFFF', '--x-inverted-contrast: black']);
  });

  it('uses the default colour when the variable is empty', () => {
    expect(cssVariableRules(definition({ type: 'color', defaultValue: 'red' }), '')).toEqual(['--x: red']);
  });

  it('writes nothing for a colour without a value and without a default', () => {
    expect(cssVariableRules(definition({ type: 'color' }), '')).toEqual([]);
  });

  it('appends the unit to a unit value', () => {
    expect(cssVariableRules(definition({ type: 'unit', unit: 'px' }), '10')).toEqual(['--x: 10px']);
  });

  it('writes an untyped value as it is', () => {
    expect(cssVariableRules(definition({}), 'v')).toEqual(['--x: v']);
  });

  it('writes no rules for a resource', () => {
    expect(cssVariableRules(definition({ type: 'resource' }), 'a.png')).toEqual([]);
  });
});

describe('resolveThemeUrl', () => {
  it('puts a qspider: path under the initial base', () => {
    expect(resolveThemeUrl('qspider:img/a.png', 'https://g/', 'https://app/')).toBe('https://app/img/a.png');
  });

  it('keeps an external URL unchanged', () => {
    expect(resolveThemeUrl('https://x/y.png', 'https://g/', 'https://app/')).toBe('https://x/y.png');
  });

  it('puts a game path under the base and turns backslashes into slashes', () => {
    expect(resolveThemeUrl('img\\b.png', 'https://g/', 'https://app/')).toBe('https://g/img/b.png');
  });
});

describe('resourceVariableCss', () => {
  it('writes none for an empty URL', () => {
    expect(resourceVariableCss('--bg', '', null)).toBe('qsp-game-root, #portal-container {--bg: none;}');
  });

  it('writes the URL as url()', () => {
    expect(resourceVariableCss('--bg', 'a.png', null)).toBe('qsp-game-root, #portal-container {--bg: url("a.png");}');
  });

  it('adds width and height variables when the size is known', () => {
    expect(resourceVariableCss('--bg', 'a.png', { width: 2, height: 3 })).toBe(
      'qsp-game-root, #portal-container {--bg: url("a.png");--bg-w: 2px; --bg-h: 3px}',
    );
  });
});
