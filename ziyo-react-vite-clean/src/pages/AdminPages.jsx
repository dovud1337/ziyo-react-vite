import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import { courses } from '../data/courses.js';

export function AdminDashboardPage() {
  return (
    <>
      <PageHeader eyebrow="Админ-панель" title="Обзор платформы" description="Ключевые показатели и задачи модерации." />
      <div className="stats-grid">
        <StatCard value="25 480" label="пользователей" />
        <StatCard value="612" label="курсов" />
        <StatCard value="184" label="преподавателя" />
        <StatCard value="428 900 TJS" label="оборот" />
      </div>
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>Курс</th><th>Автор</th><th>Категория</th><th>Статус</th></tr></thead>
          <tbody>{courses.map((course, index) => <tr key={course.id}><td>{course.title}</td><td>{course.teacher}</td><td>{course.category}</td><td>{index % 3 === 0 ? 'Проверка' : 'Активен'}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

export function AdminListPage({ title, columns }) {
  return (
    <>
      <PageHeader eyebrow="Админ-панель" title={title} description={`Управление разделом «${title}».`} />
      <div className="panel table-wrap">
        <table>
          <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
          <tbody>{Array.from({ length: 10 }, (_, row) => <tr key={row}>{columns.map((column, index) => <td key={column}>{index === 0 ? `${title} ${row + 1}` : `${120 + row * 13}`}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </>
  );
}
