import { useTheme } from '../hooks/useTheme.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? t('theme.enableLight') : t('theme.enableDark')}
      title={isDark ? t('theme.lightTheme') : t('theme.darkTheme')}
    >
      {isDark ? '☀' : '☾'}
    </button>
  );
}
