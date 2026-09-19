import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';

export const LANG_STORAGE_KEY = 'open7bh-lang';
export type AppLanguage = 'en' | 'ru';

export function getStoredLanguage(): AppLanguage {
    try {
        const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
        return stored === 'ru' ? 'ru' : 'en';
    } catch {
        return 'en';
    }
}

if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
        resources: {
            en: { translation: en },
            ru: { translation: ru },
        },
        lng: getStoredLanguage(),
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
    });
    i18n.on('languageChanged', (lng) => {
        try {
            window.localStorage.setItem(LANG_STORAGE_KEY, lng);
        } catch {
            // ignore storage errors
        }
    });
}

export default i18n;
