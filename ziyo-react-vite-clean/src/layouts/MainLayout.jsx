import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { sidebarGroups } from '../data/navigation.js';
import { useApp } from '../context/AppContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

function Header() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useApp();

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(query.trim() ? `/catalog?q=${encodeURIComponent(query.trim())}` : '/catalog');
  };

  return (
    <header className="header">
      <NavLink to="/" className="logo">ZIYO</NavLink>
      <nav className="header__nav">
        <NavLink to="/catalog">Каталог</NavLink>
        <NavLink to="/instructors">Преподаватели</NavLink>
        <NavLink to="/business">Для бизнеса</NavLink>
        <NavLink to="/teach">Преподавать</NavLink>
      </nav>
      <form className="header__search" onSubmit={handleSearch}>
        <input
          placeholder="Поиск курсов и навыков"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </form>
      <ThemeToggle />
      {user ? (
        <NavLink to="/student/profile" className="avatar">
          {user.name[0].toUpperCase()}
        </NavLink>
      ) : (
        <div className="header__auth">
          <Link to="/login" className="button button--secondary">Войти</Link>
          <Link to="/register" className="button button--primary">Регистрация</Link>
        </div>
      )}
    </header>
  );
}

function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      {sidebarGroups.map((group) => (
        <div key={group.title} className="sidebar__group">
          <span>{group.title}</span>
          {group.items.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </div>
      ))}
      <div className="sidebar__group">
        <span>Для автора</span>
        <NavLink to="/instructor">Студия</NavLink>
      </div>
      <div className="sidebar__group">
        <span>Управление</span>
        <NavLink to="/admin">Админ-панель</NavLink>
        {user ? (
          <button type="button" className="sidebar__logout" onClick={handleLogout}>Выйти</button>
        ) : (
          <NavLink to="/login">Войти</NavLink>
        )}
      </div>
    </aside>
  );
}

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Header />
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
