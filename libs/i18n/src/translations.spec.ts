import { describe, expect, it } from 'vitest';
import { formatDateIn, groupThemeTranslations } from './translations';

describe('groupThemeTranslations', () => {
  it('groups translations by language', () => {
    expect(
      groupThemeTranslations(
        [
          { lang: 'en', tkey: 'play', value: 'Play' },
          { lang: 'ru-RU', tkey: 'play', value: 'Играть' },
          { lang: 'en', tkey: 'stop', value: 'Stop' },
        ],
        ['en', 'ru-RU'],
      ),
    ).toEqual({
      en: { play: 'Play', stop: 'Stop' },
      'ru-RU': { play: 'Играть' },
    });
  });

  it('drops a language outside the list', () => {
    expect(
      groupThemeTranslations(
        [
          { lang: 'en', tkey: 'play', value: 'Play' },
          { lang: 'de', tkey: 'play', value: 'Spielen' },
        ],
        ['en'],
      ),
    ).toEqual({ en: { play: 'Play' } });
  });

  it('keeps the later value for a duplicate key', () => {
    expect(
      groupThemeTranslations(
        [
          { lang: 'en', tkey: 'play', value: 'first' },
          { lang: 'en', tkey: 'play', value: 'second' },
        ],
        ['en'],
      ),
    ).toEqual({ en: { play: 'second' } });
  });

  it('returns an empty object for empty input', () => {
    expect(groupThemeTranslations([], ['en'])).toEqual({});
  });
});

describe('formatDateIn', () => {
  it('formats the date part in long style for the language', () => {
    expect(formatDateIn('en', new Date(2026, 9, 25, 12, 30))).toContain('October 25, 2026');
  });
});
