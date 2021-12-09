import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: `./locales/{{lng}}.json`,
    },
    load: 'languageOnly',
    react: {
      useSuspense: true,
    },
    // detection: {
    //   order: ['localStorage', 'querystring', 'navigator'],
    //   lookupQuerystring: 'lng',
    // },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ko'],
    preload: ['en'],
    keySeparator: false,
    interpolation: {
      escapeValue: false
    },
  })

i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('lang', lng.split('-')[0])
})

export default i18n
