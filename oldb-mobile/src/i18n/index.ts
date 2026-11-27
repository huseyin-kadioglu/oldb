import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/src/i18n/locales/en.json';
import tr from '@/src/i18n/locales/tr.json';

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'tr';

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
    },
    lng: deviceLang === 'en' ? 'en' : 'tr',
    fallbackLng: 'tr',
    interpolation: { escapeValue: false },
  });
}

export default i18n;
