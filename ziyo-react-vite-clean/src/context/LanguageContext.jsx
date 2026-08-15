import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { categoryLabels, dateLocales, languages, levelLabels, translations } from '../i18n/translations.js';

const STORAGE_KEY = 'ziyo_language';
const LanguageContext = createContext(null);

function getInitialLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (languages.includes(stored)) return stored;
  return 'ru';
}

function resolve(dict, key) {
  return key.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), dict);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return Object.entries(vars).reduce((acc, [name, value]) => acc.replaceAll(`{{${name}}}`, value), str);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (next) => {
    if (!languages.includes(next)) return;
    localStorage.setItem(STORAGE_KEY, next);
    setLanguageState(next);
  };

  const value = useMemo(() => {
    const t = (key, vars) => {
      const value = resolve(translations[language], key) ?? resolve(translations.ru, key);
      if (value == null) return key;
      return typeof value === 'string' ? interpolate(value, vars) : value;
    };

    const translateCategory = (category) => categoryLabels[category]?.[language] ?? category;
    const translateLevel = (level) => levelLabels[level]?.[language] ?? level;

    return {
      language,
      setLanguage,
      t,
      translateCategory,
      translateLevel,
      dateLocale: dateLocales[language],
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
