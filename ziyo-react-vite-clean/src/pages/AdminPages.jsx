import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import { useApp } from '../store/appStore.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getAverageRating, getLessonCount } from '../utils/courseHelpers.js';

export function AdminDashboardPage() {
  const { courses, enrollments } = useApp((state) => ({ courses: state.courses, enrollments: state.enrollments }));
  const { t, translateCategory } = useLanguage();
  const teacherCount = new Set(courses.map((course) => course.teacher)).size;
  const totalLessons = courses.reduce((sum, course) => sum + getLessonCount(course), 0);
  const totalEnrollments = Object.keys(enrollments).length;

  return (
    <>
      <PageHeader eyebrow={t('admin.adminPanel')} title={t('admin.platformOverview')} description={t('admin.keyMetrics')} />
      <div className="stats-grid">
        <StatCard value={String(courses.length)} label={t('admin.statCourses')} />
        <StatCard value={String(teacherCount)} label={t('admin.statInstructors')} />
        <StatCard value={String(totalLessons)} label={t('admin.statLessons')} />
        <StatCard value={String(totalEnrollments)} label={t('admin.statEnrollments')} />
      </div>
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>{t('admin.courseColumn')}</th><th>{t('admin.authorColumn')}</th><th>{t('admin.categoryColumn')}</th><th>{t('admin.ratingColumn')}</th></tr></thead>
          <tbody>
            {courses.length === 0 ? (
              <tr><td colSpan={4}>{t('admin.noCoursesYet')}</td></tr>
            ) : courses.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>{course.teacher}</td>
                <td>{translateCategory(course.category)}</td>
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
  const { t } = useLanguage();
  return (
    <>
      <PageHeader eyebrow={t('admin.adminPanel')} title={title} description={t('admin.manageSectionDescription', { title })} />
      <div className="panel table-wrap">
        <table>
          <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
          <tbody>{Array.from({ length: 10 }, (_, row) => <tr key={row}>{columns.map((column, index) => <td key={column}>{index === 0 ? `${title} ${row + 1}` : `${120 + row * 13}`}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </>
  );
}
