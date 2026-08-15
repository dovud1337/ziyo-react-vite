import { languageNames, languages } from '../i18n/translations.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <select
      className="language-switcher"
      value={language}
      onChange={(event) => setLanguage(event.target.value)}
      aria-label={t('nav.language')}
      title={t('nav.language')}
    >
      {languages.map((code) => (
        <option key={code} value={code}>{languageNames[code]}</option>
      ))}
    </select>
  );
}
