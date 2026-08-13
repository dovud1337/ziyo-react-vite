import { NavLink, Outlet } from 'react-router-dom';
import { sidebarGroups } from '../data/navigation.js';

function Header() {
  return (
    <header className="header">
      <NavLink to="/" className="logo">ZIYO</NavLink>
      <nav className="header__nav">
        <NavLink to="/catalog">Каталог</NavLink>
        <NavLink to="/instructors">Преподаватели</NavLink>
        <NavLink to="/business">Для бизнеса</NavLink>
        <NavLink to="/teach">Преподавать</NavLink>
      </nav>
      <div className="header__search">
        <input placeholder="Поиск курсов и навыков" />
      </div>
      <NavLink to="/student/profile" className="avatar">Д</NavLink>
    </header>
  );
}

function Sidebar() {
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
