import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend, { ChainedBackendOptions } from 'i18next-chained-backend';
import Fetch from 'i18next-fetch-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init<ChainedBackendOptions>({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    backend: {
      // array of existing i18next backends from https://www.i18next.com/plugins-and-utils.html#backends
      backends: [Fetch],

      // array of options in order of backends above
      backendOptions: [{}],
    },
  });
export default i18n;