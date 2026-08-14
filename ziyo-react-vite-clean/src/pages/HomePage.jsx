import { Link } from 'react-router-dom';
import CourseGrid from '../components/CourseGrid.jsx';
import { categories } from '../data/courses.js';
import { useApp } from '../context/AppContext.jsx';
import { getLessonCount } from '../utils/courseHelpers.js';

export default function HomePage() {
  const { courses, enrollments } = useApp();
  const enrolledIds = Object.keys(enrollments).map(Number);
  const activeCourses = courses.filter((course) => enrolledIds.includes(course.id));
  const teacherCount = new Set(courses.map((course) => course.teacher)).size;
  const lessonCount = courses.reduce((sum, course) => sum + getLessonCount(course), 0);

  return (
    <>
      <section className="compact-hero">
        <div>
          <span className="eyebrow">Центральная Азия · СНГ</span>
          <h1>Учитесь у своих. Работайте где угодно.</h1>
          <p>Практические курсы на русском и локальных языках.</p>
          <div className="hero-actions">
            <Link className="button button--primary" to="/catalog">Смотреть курсы</Link>
            <Link className="button button--secondary" to="/teach">Стать преподавателем</Link>
          </div>
        </div>
        <div className="hero-metrics">
          <div><strong>{courses.length}</strong><span>курсов</span></div>
          <div><strong>{teacherCount}</strong><span>преподавателей</span></div>
          <div><strong>{lessonCount}</strong><span>уроков</span></div>
          <div><strong>{activeCourses.length}</strong><span>ваших курсов</span></div>
        </div>
      </section>

      <div className="chips">
        {categories.map((category) => (
          <Link key={category} to={category === 'Все' ? '/catalog' : `/category/${encodeURIComponent(category)}`}>
            {category}
          </Link>
        ))}
      </div>

      <section className="section">
        <div className="section__header">
          <h2>Сейчас на платформе</h2>
          <Link to="/catalog">Открыть каталог →</Link>
        </div>
        {courses.length > 0 ? (
          <CourseGrid courses={courses} limit={8} />
        ) : (
          <div className="panel empty-state">
            <h2>Курсов пока нет</h2>
            <p>Станьте первым преподавателем на платформе.</p>
            <Link className="button button--primary" to="/instructor/create">Создать курс</Link>
          </div>
        )}
      </section>

      {activeCourses.length > 0 && (
        <section className="section">
          <div className="section__header"><h2>Продолжить обучение</h2></div>
          <CourseGrid courses={activeCourses} showProgress enrollments={enrollments} limit={4} />
        </section>
      )}
    </>
  );
}
