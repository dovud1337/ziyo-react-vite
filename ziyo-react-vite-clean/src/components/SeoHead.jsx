import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext.jsx';

const OG_LOCALE = { ru: 'ru_RU', tg: 'tg_TJ', en: 'en_US' };

export default function SeoHead({ title, description }) {
  const { t, language } = useLanguage();
  const pageTitle = title ? `${title} · NOOR` : 'NOOR';
  const pageDescription = description ?? t('common.siteDescription');

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta property="og:site_name" content="NOOR" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={OG_LOCALE[language]} />
    </Helmet>
  );
}
