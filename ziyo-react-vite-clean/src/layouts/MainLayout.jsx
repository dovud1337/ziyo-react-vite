import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { sidebarGroups } from '../data/navigation.js';
import { useApp } from '../store/appStore.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';

function Header({ onToggleMenu, menuOpen }) {
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
      <button type="button" className="menu-button" aria-label="Меню" aria-expanded={menuOpen} aria-controls="site-sidebar" onClick={onToggleMenu}>☰</button>
      <NavLink to="/" className="logo"><span className="logo-mark" aria-hidden="true">✳</span>NOOR<span className="logo-dot">.</span></NavLink>
      <nav className="header__nav">
        <NavLink to="/catalog">{t('nav.catalog')}</NavLink>
        <NavLink to="/instructors">{t('nav.instructors')}</NavLink>
        <NavLink to="/business">{t('nav.business')}</NavLink>
        <NavLink to="/teach">{t('nav.teach')}</NavLink>
      </nav>
      <form className="header__search" onSubmit={handleSearch}>
        <input
          aria-label={t('nav.searchPlaceholder')}
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

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate('/');
    } catch {
      onClose();
    }
  };

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside id="site-sidebar" className={`sidebar${open ? ' sidebar--open' : ''}`}>
        {sidebarGroups.map((group) => (
          <div key={group.titleKey} className="sidebar__group">
            <span>{t(group.titleKey)}</span>
            {group.items.map(([to, labelKey]) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={onClose}>
                <span className="nav-symbol" aria-hidden="true">{({ '/': '⌂', '/catalog': '▦', '/instructors': '◈', '/business': '◫', '/teach': '✎', '/student/courses': '▤', '/student/wishlist': '♡', '/student/calendar': '▦', '/student/messages': '✉', '/student/notifications': '♧', '/student/community': '◎', '/student/certificates': '☆', '/student/profile': '◉', '/student/settings': '⚙' })[to] ?? '◇'}</span>{t(labelKey)}
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
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event) => { if (event.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    let frame = null;
    let latestEvent = null;
    const applyMove = () => {
      frame = null;
      const mx = (latestEvent.clientX / window.innerWidth - 0.5) * 2;
      const my = (latestEvent.clientY / window.innerHeight - 0.5) * 2;
      root.style.setProperty('--page-mx', (mx * 40).toFixed(1));
      root.style.setProperty('--page-my', (my * 40).toFixed(1));
    };
    const handleMouseMove = (event) => {
      latestEvent = event;
      if (frame === null) frame = requestAnimationFrame(applyMove);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div className="bg-glow" aria-hidden="true">
        <span className="bg-glow__blob bg-glow__blob--a" />
        <span className="bg-glow__blob bg-glow__blob--b" />
        <span className="bg-glow__blob bg-glow__blob--c" />
      </div>
      <div className="app-shell">
        <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((v) => !v)} />
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
