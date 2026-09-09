import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__brand">
          <span className="logo"><span className="logo-mark" aria-hidden="true">✳</span>NOOR<span className="logo-dot">.</span></span>
          <p>{t('footer.tagline')}</p>
        </div>
        <div className="site-footer__col">
          <span>{t('footer.platformHeading')}</span>
          <Link to="/catalog">{t('footer.catalogLink')}</Link>
          <Link to="/about">{t('footer.aboutLink')}</Link>
          <Link to="/instructors">{t('footer.partnersLink')}</Link>
        </div>
        <div className="site-footer__col">
          <span>{t('footer.studentsHeading')}</span>
          <Link to="/faq">{t('footer.howItWorksLink')}</Link>
          <Link to="/student/certificates">{t('footer.certificatesLink')}</Link>
          <Link to="/contact">{t('footer.supportLink')}</Link>
        </div>
        <div className="site-footer__col">
          <span>{t('footer.instructorsHeading')}</span>
          <Link to="/teach">{t('footer.becomeInstructorLink')}</Link>
          <Link to="/business">{t('footer.requirementsLink')}</Link>
          <Link to="/blog">{t('footer.resourcesLink')}</Link>
        </div>
      </div>
      <div className="site-footer__bottom">
        {t('footer.copyright', { year })}
      </div>
    </footer>
  );
}
