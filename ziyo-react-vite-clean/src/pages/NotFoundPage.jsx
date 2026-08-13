import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <div className="empty-state panel"><h1>404</h1><p>Страница не найдена.</p><Link className="button button--primary" to="/">На главную</Link></div>;
}
