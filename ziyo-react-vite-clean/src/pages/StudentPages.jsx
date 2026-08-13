import { Link } from 'react-router-dom';
import CourseGrid from '../components/CourseGrid.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import { courses } from '../data/courses.js';

export function StudentDashboardPage() {
  return (
    <>
      <PageHeader eyebrow="Кабинет студента" title="Добрый день, Довуд" description="Продолжайте обучение с того места, где остановились." />
      <div className="stats-grid">
        <StatCard value="7" label="активных курсов" />
        <StatCard value="62%" label="средний прогресс" />
        <StatCard value="24 ч" label="время обучения" />
        <StatCard value="3" label="сертификата" />
      </div>
      <section className="section"><div className="section__header"><h2>Продолжить обучение</h2></div><CourseGrid courses={courses} showProgress limit={4} /></section>
    </>
  );
}

export function MyCoursesPage() {
  return <><PageHeader eyebrow="Обучение" title="Мои курсы" description="Все купленные и сохранённые программы." /><CourseGrid courses={courses} showProgress /></>;
}

export function WishlistPage() {
  return <><PageHeader eyebrow="Сохранённое" title="Избранное" description="Курсы, к которым вы хотите вернуться." /><CourseGrid courses={courses.slice(2)} /></>;
}

export function LessonPage() {
  return (
    <div className="lesson-layout">
      <section className="video-column">
        <div className="video-placeholder">▶</div>
        <h1>Функции и модули в Python</h1>
        <p>В этом уроке мы разберём, как создавать функции и разделять проект на модули.</p>
      </section>
      <aside className="lesson-sidebar panel">
        <h3>Программа курса</h3>
        {Array.from({ length: 10 }, (_, index) => (
          <Link key={index} to="/student/lesson" className={index === 3 ? 'active' : ''}>
            {index + 1}. Урок по Python
          </Link>
        ))}
      </aside>
    </div>
  );
}

export function SimpleStudentPage({ title, description }) {
  return (
    <>
      <PageHeader eyebrow="Кабинет студента" title={title} description={description} />
      <div className="panel empty-state">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </>
  );
}
