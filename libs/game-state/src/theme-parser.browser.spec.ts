import { describe, expect, it } from 'vitest';
import { extractCssVariables, extractLinks, extractTagData, extractTranslations, parseTheme } from './theme-parser';

/** The real theme files the player ships and its E2E and manual-test games use, read as text. */
function themeFile(glob: Record<string, string>): string {
  const [text] = Object.values(glob);
  return text;
}
const classic = themeFile(
  import.meta.glob('../../../public/themes/classic.html', { query: '?raw', import: 'default', eager: true }),
);
const aero = themeFile(
  import.meta.glob('../../../public/themes/aero.html', { query: '?raw', import: 'default', eager: true }),
);
const e2eTheme = themeFile(
  import.meta.glob('../../../apps/player-e2e/fixtures/themed-game/e2e-theme.html', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
);
const customTheme = themeFile(
  import.meta.glob('../../../test-assets/qspider/custom-theme.html', { query: '?raw', import: 'default', eager: true }),
);

/** The first `<qspider-theme>` of `html`, as the parser sees it. */
function themeRoot(html: string): HTMLElement {
  const root = new DOMParser().parseFromString(html, 'text/html').querySelector<HTMLElement>('qspider-theme');
  if (!root) throw new Error('no qspider-theme');
  return root;
}

function playerTemplate(body: string): string | undefined {
  return parseTheme(`<qspider-theme name="t"><qsp-player>${body}</qsp-player></qspider-theme>`)['t'].qsp_player
    ?.template;
}

describe('parseTheme: a theme file', () => {
  it('reads one theme per qspider-theme tag, named by its name attribute', () => {
    expect(Object.keys(parseTheme(classic))).toEqual(['qspider:classic']);
    expect(Object.keys(parseTheme(aero))).toEqual(['qspider:aero']);
  });

  it('marks a theme as user defined unless the caller says it is built in', () => {
    expect(parseTheme(classic)['qspider:classic'].is_user_defined).toBe(true);
    expect(parseTheme(classic, false)['qspider:classic'].is_user_defined).toBe(false);
  });

  it('skips a qspider-theme tag with no name', () => {
    expect(parseTheme('<qspider-theme><qsp-player></qsp-player></qspider-theme>')).toEqual({});
  });

  it('reads several themes from one file', () => {
    const themes = parseTheme('<qspider-theme name="a"></qspider-theme><qspider-theme name="b"></qspider-theme>');
    expect(Object.keys(themes)).toEqual(['a', 'b']);
  });
});

describe('extractLinks', () => {
  it('lists the src of every css-link and script-link of the e2e theme', () => {
    const root = themeRoot(e2eTheme);
    expect(extractLinks(root, 'css-link')).toEqual([
      'qspider:themes/common.css',
      'qspider:themes/classic.css',
      'e2e-theme.css',
    ]);
    expect(extractLinks(root, 'script-link')).toEqual(['e2e-theme.js']);
  });

  it('skips a link with no src', () => {
    const root = themeRoot(
      '<qspider-theme name="t"><css-link></css-link><css-link src="a.css"></css-link></qspider-theme>',
    );
    expect(extractLinks(root, 'css-link')).toEqual(['a.css']);
  });
});

describe('extractTranslations', () => {
  it('reads lang, tkey and value of each translation of the custom theme', () => {
    expect(extractTranslations(themeRoot(customTheme))).toEqual([
      { lang: 'en-US', tkey: 'test_key', value: 'english translation' },
      { lang: 'uk-UA', tkey: 'test_key', value: 'український переклад' },
    ]);
  });

  it('gives empty strings for missing attributes', () => {
    const root = themeRoot(
      '<qspider-theme name="t"><definitions><qsp-translation></qsp-translation></definitions></qspider-theme>',
    );
    expect(extractTranslations(root)).toEqual([{ lang: '', tkey: '', value: '' }]);
  });
});

describe('extractCssVariables', () => {
  it('reads a unit variable of the classic theme', () => {
    const fontSize = extractCssVariables(themeRoot(classic)).find((v) => v.name === '--code-font-size');
    expect(fontSize).toMatchObject({ from: 'FSIZE', type: 'unit', unit: 'pt', defaultValue: '' });
  });

  it('reads a plain variable with no type', () => {
    const fontName = extractCssVariables(themeRoot(classic)).find((v) => v.name === '--code-font-name');
    expect(fontName).toMatchObject({ from: '$FNAME', type: null, defaultValue: '' });
  });

  it('reads a color variable with its contrast and inverted flags', () => {
    const variables = extractCssVariables(themeRoot(classic));
    expect(variables.find((v) => v.name === '--code-color')).toMatchObject({
      type: 'color',
      withContrast: false,
      withInverted: false,
    });
    expect(variables.find((v) => v.name === '--code-background-color')).toMatchObject({
      from: 'BCOLOR',
      type: 'color',
      withContrast: true,
      withInverted: true,
    });
  });

  it('reads a resource variable with its size flag and default value', () => {
    const variables = extractCssVariables(themeRoot(aero));
    expect(variables.find((v) => v.name === '--up-arrow')).toMatchObject({
      from: '$UP_ARROW_IMAGE',
      type: 'resource',
      withSize: true,
      defaultValue: 'qspider:aero/up_arrow.png',
    });
    expect(variables.find((v) => v.name === '--background-image')).toMatchObject({
      type: 'resource',
      withSize: false,
      defaultValue: 'qspider:aero/back.png',
    });
  });

  it('skips a variable with no name or no from', () => {
    const root = themeRoot(
      '<qspider-theme name="t"><definitions><qsp-css-variable from="X"></qsp-css-variable>' +
        '<qsp-css-variable name="--x"></qsp-css-variable></definitions></qspider-theme>',
    );
    expect(extractCssVariables(root)).toEqual([]);
  });
});

describe('extractTagData', () => {
  it('returns nothing when the theme has no such tag', () => {
    expect(extractTagData(themeRoot('<qspider-theme name="t"></qspider-theme>'), 'qsp-player')).toBeUndefined();
  });

  it('returns the attributes and the template of the player tag', () => {
    const data = extractTagData(
      themeRoot('<qspider-theme name="t"><qsp-player class="x"><i>a</i></qsp-player></qspider-theme>'),
      'qsp-player',
    );
    expect(data?.attrs).toEqual({ class: 'x' });
    expect(data?.template).toBe('<i>a</i>');
  });

  it('keeps the tags of the classic player template and no newlines', () => {
    const template = parseTheme(classic)['qspider:classic'].qsp_player?.template ?? '';
    expect(template.startsWith('<qsp-cl-defaults></qsp-cl-defaults><qsp-cl><qsp-cl-layer>')).toBe(true);
    expect(template.endsWith('</qsp-pause-screen>')).toBe(true);
    expect(template).not.toMatch(/\n/);
  });
});

describe('template whitespace', () => {
  it('removes a newline run between two tags', () => {
    expect(playerTemplate('<div>\n  <p>a</p>\n\n  <p>b</p>\n</div>')).toBe('<div><p>a</p><p>b</p></div>');
  });

  it('keeps a space where a newline separates words (D9)', () => {
    expect(playerTemplate('<b>Hello</b>\n  world')).toBe('<b>Hello</b> world');
  });

  it('turns a newline run inside text into one space (D9)', () => {
    expect(playerTemplate('<p>one\n\n   two\r\n three</p>')).toBe('<p>one two three</p>');
  });

  it('leaves no stray text node at the edges of the template', () => {
    expect(playerTemplate('\n  <qsp-main></qsp-main>\n')).toBe('<qsp-main></qsp-main>');
  });

  it('keeps the e2e theme template free of newlines', () => {
    const template = parseTheme(e2eTheme)['e2e-custom'].qsp_player?.template ?? '';
    expect(template.startsWith('<div data-qa="e2e-theme-chrome" class="e2e-theme-chrome">E2E THEME</div>')).toBe(true);
    expect(template).not.toMatch(/\n/);
  });
});
