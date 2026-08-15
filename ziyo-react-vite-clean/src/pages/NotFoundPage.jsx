import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function NotFoundPage() {
  const { t } = useLanguage();
  return (
    <div className="empty-state panel">
      <SeoHead title="404" description={t('notFound.description')} />
      <h1>404</h1>
      <p>{t('notFound.description')}</p>
      <Link className="button button--primary" to="/">{t('notFound.goHome')}</Link>
    </div>
  );
}
