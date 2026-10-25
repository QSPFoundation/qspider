import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend, { ChainedBackendOptions } from 'i18next-chained-backend';
import Fetch from 'i18next-fetch-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { ThemeTranslation } from '@qspider/contracts';
import { formatDateIn, groupThemeTranslations, LOCALES } from './translations';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init<ChainedBackendOptions>({
    fallbackLng: 'en',
    supportedLngs: LOCALES,
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
          loadPath: new URL('locales/', window.location.href).href + '{{lng}}/{{ns}}.json',
        },
      ],
    },
  });

export function loadThemeTranslations(translations: ThemeTranslation[]): void {
  const prepared = groupThemeTranslations(translations, LOCALES);

  for (const [locale, bundle] of Object.entries(prepared)) {
    i18n.addResourceBundle(locale, 'theme', bundle, true, true);
  }
}

export function unloadThemeTranslations(): void {
  for (const locale of LOCALES) {
    i18n.removeResourceBundle(locale, 'theme');
  }
}

export function formatDate(date: Date): string {
  return formatDateIn(i18n.language, date);
}

export default i18n;
