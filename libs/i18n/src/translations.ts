import { ThemeTranslation } from '@qspider/contracts';

export const LOCALES = ['en-US', 'en', 'ru-RU', 'uk-UA', 'zh'];

export function groupThemeTranslations(
  translations: ThemeTranslation[],
  locales: readonly string[],
): Record<string, Record<string, string>> {
  const prepared: Record<string, Record<string, string>> = {};

  for (const translation of translations) {
    if (!locales.includes(translation.lang)) continue;
    const bundle = prepared[translation.lang] ?? {};
    bundle[translation.tkey] = translation.value;
    prepared[translation.lang] = bundle;
  }

  return prepared;
}

export function formatDateIn(language: string, date: Date): string {
  return new Intl.DateTimeFormat(language, { dateStyle: 'long', timeStyle: 'short' }).format(date);
}
