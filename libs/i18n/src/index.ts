import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend, { ChainedBackendOptions } from 'i18next-chained-backend';
import Fetch from 'i18next-fetch-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { ThemeTranslation } from '@qspider/contracts';

const locales = ['en-US', 'en', 'ru-RU', 'uk-UA'];

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init<ChainedBackendOptions>({
    fallbackLng: 'en',
    supportedLngs: locales,
    defaultNS: 'theme',
    fallbackNS: 'translation',
    load: 'currentOnly',
    debug: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    backend: {
      // array of existing i18next backends from https://www.i18next.com/plugins-and-utils.html#backends
      backends: [Fetch],

      // array of options in order of backends above
      backendOptions: [
        {
          loadPath: new URL('locales/', document.baseURI).href + '{{lng}}/{{ns}}.json',
        },
      ],
    },
  });

export function loadThemeTranslations(translations: ThemeTranslation[]): void {
  const prepared: Record<string, Record<string, string>> = {};

  for (const translation of translations) {
    if (!locales.includes(translation.lang)) continue;
    const bundle = prepared[translation.lang] ?? {};
    bundle[translation.tkey] = translation.value;
    prepared[translation.lang] = bundle;
  }

  for (const [locale, bundle] of Object.entries(prepared)) {
    i18n.addResourceBundle(locale, 'theme', bundle, true, true);
  }
}

export function unloadThemeTranslations(): void {
  for (const locale of locales) {
    i18n.removeResourceBundle(locale, 'theme');
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long', timeStyle: 'short' }).format(date);
}

export default i18n;
