import { Link, Navigate, useParams } from 'react-router-dom';
import CourseGrid from '../components/CourseGrid.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Button from '../components/Button.jsx';
import { useApp } from '../context/AppContext.jsx';
import { getCourseProgress, getLessons } from '../utils/courseHelpers.js';

function EmptyState({ title, description }) {
  return (
    <div className="panel empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      <Link className="button button--primary" to="/catalog">Перейти в каталог</Link>
    </div>
  );
}

export function StudentDashboardPage() {
  const { user, courses, enrollments } = useApp();
  const enrolledIds = Object.keys(enrollments).map(Number);
  const activeCourses = courses.filter((course) => enrolledIds.includes(course.id));
  const avgProgress = activeCourses.length > 0
    ? Math.round(activeCourses.reduce((sum, course) => sum + getCourseProgress(course, enrollments[course.id]), 0) / activeCourses.length)
    : 0;
  const certificateCount = activeCourses.filter((course) => getCourseProgress(course, enrollments[course.id]) === 100).length;

  return (
    <>
      <PageHeader eyebrow="Кабинет студента" title={`Добрый день, ${user?.name ?? 'Гость'}`} description="Продолжайте обучение с того места, где остановились." />
      <div className="stats-grid">
        <StatCard value={String(activeCourses.length)} label="активных курсов" />
        <StatCard value={`${avgProgress}%`} label="средний прогресс" />
        <StatCard value={String(courses.length)} label="курсов на платформе" />
        <StatCard value={String(certificateCount)} label="сертификата" />
      </div>
      <section className="section">
        <div className="section__header"><h2>Продолжить обучение</h2></div>
        {activeCourses.length > 0 ? (
          <CourseGrid courses={activeCourses} showProgress enrollments={enrollments} limit={4} />
        ) : (
          <EmptyState title="Пока нет активных курсов" description="Запишитесь на курс в каталоге, чтобы начать обучение." />
        )}
      </section>
    </>
  );
}

export function MyCoursesPage() {
  const { courses, enrollments } = useApp();
  const enrolledIds = Object.keys(enrollments).map(Number);
  const myCourses = courses.filter((course) => enrolledIds.includes(course.id));

  return (
    <>
      <PageHeader eyebrow="Обучение" title="Мои курсы" description="Все купленные и сохранённые программы." />
      {myCourses.length > 0 ? (
        <CourseGrid courses={myCourses} showProgress enrollments={enrollments} />
      ) : (
        <EmptyState title="Здесь пока пусто" description="Купленные курсы появятся тут после оформления заказа." />
      )}
    </>
  );
}

export function WishlistPage() {
  const { courses, wishlistIds } = useApp();
  const savedCourses = courses.filter((course) => wishlistIds.includes(course.id));

  return (
    <>
      <PageHeader eyebrow="Сохранённое" title="Избранное" description="Курсы, к которым вы хотите вернуться." />
      {savedCourses.length > 0 ? (
        <CourseGrid courses={savedCourses} />
      ) : (
        <EmptyState title="Список избранного пуст" description="Нажмите на сердце на карточке курса, чтобы сохранить его сюда." />
      )}
    </>
  );
}

export function CertificatesPage() {
  const { user, courses, enrollments } = useApp();
  const completedCourses = courses.filter((course) => {
    const enrollment = enrollments[course.id];
    return enrollment && getCourseProgress(course, enrollment) === 100;
  });

  return (
    <>
      <PageHeader eyebrow="Кабинет студента" title="Сертификаты" description="Полученные сертификаты и проверка подлинности." />
      {completedCourses.length > 0 ? (
        completedCourses.map((course) => {
          const enrollment = enrollments[course.id];
          const date = new Date(enrollment.enrolledAt).toLocaleDateString('ru-RU');
          return (
            <div className="certificate-card" key={course.id}>
              <span className="eyebrow">Сертификат о прохождении</span>
              <h2>{course.title}</h2>
              <p>Выдан: {user?.name ?? 'Студент'} · {date}</p>
              <Button onClick={() => window.print()}>Печать</Button>
            </div>
          );
        })
      ) : (
        <EmptyState title="Сертификатов пока нет" description="Пройдите все уроки курса до конца, чтобы получить сертификат." />
      )}
    </>
  );
}

export function LessonPage() {
  const { courseId, lessonId } = useParams();
  const { courses, enrollments, toggleLessonComplete } = useApp();
  const course = courses.find((item) => item.id === Number(courseId));
  const enrollment = enrollments[Number(courseId)];

  if (!course) return <Navigate to="/student/courses" replace />;

  const lessons = getLessons(course);
  const activeId = Number(lessonId);
  const activeIndex = lessons.findIndex((lesson) => lesson.id === activeId);
  const lesson = activeIndex >= 0 ? lessons[activeIndex] : lessons[0];
  const completed = enrollment?.completedLessonIds.includes(lesson?.id) ?? false;
  const progress = enrollment && lessons.length > 0
    ? Math.round((enrollment.completedLessonIds.length / lessons.length) * 100)
    : 0;
  const prevLesson = activeIndex > 0 ? lessons[activeIndex - 1] : null;
  const nextLesson = activeIndex >= 0 && activeIndex < lessons.length - 1 ? lessons[activeIndex + 1] : null;

  if (!lesson) {
    return (
      <div className="panel empty-state">
        <h2>В этом курсе пока нет уроков</h2>
        <p>Преподаватель ещё не добавил программу курса.</p>
      </div>
    );
  }

  return (
    <div className="lesson-layout">
      <section className="video-column">
        {lesson.type === 'video' && lesson.videoUrl ? (
          <div className="video-placeholder" style={{ padding: 0, overflow: 'hidden' }}>
            <iframe
              title={lesson.title}
              src={lesson.videoUrl}
              style={{ width: '100%', height: '100%', border: 0 }}
              allowFullScreen
            />
          </div>
        ) : (
          <div className="video-placeholder">{lesson.type === 'video' ? '▶' : '📄'}</div>
        )}
        <span className="eyebrow">{lesson.sectionTitle}</span>
        <h1>{lesson.title}</h1>
        <p>{lesson.content || 'Материалы урока скоро появятся.'}</p>
        <div className="progress"><div className="progress__bar" style={{ width: `${progress}%` }} /></div>
        <Button
          variant={completed ? 'secondary' : 'primary'}
          onClick={() => toggleLessonComplete(course.id, lesson.id)}
        >
          {completed ? 'Урок пройден ✓' : 'Отметить как пройденный'}
        </Button>
        {progress === 100 && (
          <div className="panel" style={{ marginTop: 12 }}>
            <strong>Поздравляем, курс завершён! </strong>
            <Link to="/student/certificates">Получить сертификат →</Link>
          </div>
        )}
        <div className="lesson-nav">
          {prevLesson ? <Link to={`/student/lesson/${course.id}/${prevLesson.id}`}>← Предыдущий урок</Link> : <span />}
          {nextLesson ? <Link to={`/student/lesson/${course.id}/${nextLesson.id}`}>Следующий урок →</Link> : <span />}
        </div>
      </section>
      <aside className="lesson-sidebar panel">
        <h3>{course.title}</h3>
        {lessons.map((item) => (
          <Link
            key={item.id}
            to={`/student/lesson/${course.id}/${item.id}`}
            className={[
              item.id === lesson.id ? 'active' : '',
              enrollment?.completedLessonIds.includes(item.id) ? 'done' : '',
            ].filter(Boolean).join(' ')}
          >
            {item.title}
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
