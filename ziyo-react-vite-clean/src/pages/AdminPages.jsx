import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import { useApp } from '../context/AppContext.jsx';
import { getAverageRating, getLessonCount } from '../utils/courseHelpers.js';

export function AdminDashboardPage() {
  const { courses, enrollments } = useApp();
  const teacherCount = new Set(courses.map((course) => course.teacher)).size;
  const totalLessons = courses.reduce((sum, course) => sum + getLessonCount(course), 0);
  const totalEnrollments = Object.keys(enrollments).length;

  return (
    <>
      <PageHeader eyebrow="Админ-панель" title="Обзор платформы" description="Ключевые показатели и задачи модерации." />
      <div className="stats-grid">
        <StatCard value={String(courses.length)} label="курсов" />
        <StatCard value={String(teacherCount)} label="преподавателей" />
        <StatCard value={String(totalLessons)} label="уроков" />
        <StatCard value={String(totalEnrollments)} label="записей на курсы" />
      </div>
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>Курс</th><th>Автор</th><th>Категория</th><th>Рейтинг</th></tr></thead>
          <tbody>
            {courses.length === 0 ? (
              <tr><td colSpan={4}>Курсов пока нет.</td></tr>
            ) : courses.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>{course.teacher}</td>
                <td>{course.category}</td>
                <td>{getAverageRating(course) ?? '—'}</td>
              </tr>
            ))}
          </tbody>
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
