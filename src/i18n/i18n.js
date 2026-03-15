import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import de from './locales/de.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import ar from './locales/ar.json'

const LANG_KEY = 'deeny-language'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
    es: { translation: es },
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: localStorage.getItem(LANG_KEY) || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes
  },
})

const RTL_LANGS = ['ar']

// Persist language changes to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LANG_KEY, lng)
  document.documentElement.lang = lng
  document.documentElement.dir = RTL_LANGS.includes(lng) ? 'rtl' : 'ltr'
})

// Set initial lang attribute and direction
document.documentElement.lang = i18n.language
document.documentElement.dir = RTL_LANGS.includes(i18n.language) ? 'rtl' : 'ltr'

export default i18n
