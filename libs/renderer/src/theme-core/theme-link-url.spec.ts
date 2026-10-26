import { describe, expect, it } from 'vitest';
import { resolveQspiderLink } from './theme-link-url';

describe('resolveQspiderLink', () => {
  it('replaces the qspider: prefix with the base URL', () => {
    expect(resolveQspiderLink('qspider:themes/aero/aero.css', '/game/')).toBe('/game/themes/aero/aero.css');
  });

  it('leaves a link without the prefix as written', () => {
    expect(resolveQspiderLink('https://example.com/a.css', '/game/')).toBe('https://example.com/a.css');
    expect(resolveQspiderLink('css/a.css', '/game/')).toBe('css/a.css');
  });

  it('does not clean backslashes, unlike resolveThemeUrl', () => {
    expect(resolveQspiderLink('qspider:css\\a.css', '/game/')).toBe('/game/css\\a.css');
  });

  it('replaces only the first qspider: in the link', () => {
    expect(resolveQspiderLink('qspider:a/qspider:b.css', '/g/')).toBe('/g/a/qspider:b.css');
  });
});
