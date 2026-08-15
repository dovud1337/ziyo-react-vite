import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { sidebarGroups } from '../data/navigation.js';
import { useApp } from '../store/appStore.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';

function Header() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useApp((state) => ({ user: state.user }));
  const { t } = useLanguage();

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(query.trim() ? `/catalog?q=${encodeURIComponent(query.trim())}` : '/catalog');
  };

  return (
    <header className="header">
      <NavLink to="/" className="logo">ZIYO</NavLink>
      <nav className="header__nav">
        <NavLink to="/catalog">{t('nav.catalog')}</NavLink>
        <NavLink to="/instructors">{t('nav.instructors')}</NavLink>
        <NavLink to="/business">{t('nav.business')}</NavLink>
        <NavLink to="/teach">{t('nav.teach')}</NavLink>
      </nav>
      <form className="header__search" onSubmit={handleSearch}>
        <input
          placeholder={t('nav.searchPlaceholder')}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </form>
      <LanguageSwitcher />
      <ThemeToggle />
      {user ? (
        <NavLink to="/student/profile" className="avatar">
          {user.name[0].toUpperCase()}
        </NavLink>
      ) : (
        <div className="header__auth">
          <Link to="/login" className="button button--secondary">{t('nav.login')}</Link>
          <Link to="/register" className="button button--primary">{t('nav.register')}</Link>
        </div>
      )}
    </header>
  );
}

function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useApp((state) => ({ user: state.user, logout: state.logout }));
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      {sidebarGroups.map((group) => (
        <div key={group.titleKey} className="sidebar__group">
          <span>{t(group.titleKey)}</span>
          {group.items.map(([to, labelKey]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {t(labelKey)}
            </NavLink>
          ))}
        </div>
      ))}
      <div className="sidebar__group">
        <span>{t('nav.forAuthor')}</span>
        <NavLink to="/instructor">{t('nav.studio')}</NavLink>
      </div>
      <div className="sidebar__group">
        <span>{t('nav.management')}</span>
        <NavLink to="/admin">{t('nav.adminPanel')}</NavLink>
        {user ? (
          <button type="button" className="sidebar__logout" onClick={handleLogout}>{t('nav.logout')}</button>
        ) : (
          <NavLink to="/login">{t('nav.login')}</NavLink>
        )}
      </div>
    </aside>
  );
}

function CoursesLoadError() {
  const { t } = useLanguage();
  const { coursesError, refreshCourses } = useApp((state) => ({
    coursesError: state.coursesError,
    refreshCourses: state.refreshCourses,
  }));

  return (
    <div className="panel empty-state">
      <h2>{t('common.loadErrorTitle')}</h2>
      <p>{coursesError}</p>
      <button type="button" className="button button--primary" onClick={() => refreshCourses()}>{t('common.retry')}</button>
    </div>
  );
}

export default function MainLayout() {
  const { coursesError, hasCourses } = useApp((state) => ({
    coursesError: state.coursesError,
    hasCourses: state.courses.length > 0,
  }));

  return (
    <div className="app-shell">
      <Header />
      <Sidebar />
      <main className="main-content">
        {coursesError && !hasCourses ? <CoursesLoadError /> : <Outlet />}
      </main>
    </div>
  );
}
