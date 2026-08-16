import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { sidebarGroups } from '../data/navigation.js';
import { useApp } from '../store/appStore.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';

function Header({ onToggleMenu }) {
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
      <button type="button" className="menu-button" aria-label="Меню" onClick={onToggleMenu}>☰</button>
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
          {user.name?.[0]?.toUpperCase() ?? '?'}
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

function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useApp((state) => ({ user: state.user, logout: state.logout }));
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
        {sidebarGroups.map((group) => (
          <div key={group.titleKey} className="sidebar__group">
            <span>{t(group.titleKey)}</span>
            {group.items.map(([to, labelKey]) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={onClose}>
                {t(labelKey)}
              </NavLink>
            ))}
          </div>
        ))}
        <div className="sidebar__group">
          <span>{t('nav.forAuthor')}</span>
          <NavLink to="/instructor" onClick={onClose}>{t('nav.studio')}</NavLink>
        </div>
        <div className="sidebar__group">
          <span>{t('nav.management')}</span>
          <NavLink to="/admin" onClick={onClose}>{t('nav.adminPanel')}</NavLink>
          {user ? (
            <button type="button" className="sidebar__logout" onClick={handleLogout}>{t('nav.logout')}</button>
          ) : (
            <>
              <NavLink to="/login" onClick={onClose}>{t('nav.login')}</NavLink>
              <NavLink to="/register" onClick={onClose}>{t('nav.register')}</NavLink>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Header onToggleMenu={() => setMenuOpen((v) => !v)} />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
