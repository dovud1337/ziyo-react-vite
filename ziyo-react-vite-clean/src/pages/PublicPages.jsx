import { Link, useNavigate, useParams } from 'react-router-dom';
import CourseGrid from '../components/CourseGrid.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import { useApp } from '../context/AppContext.jsx';

function getInstructors(courses) {
  const byName = new Map();
  courses.forEach((course) => {
    if (!byName.has(course.teacher)) byName.set(course.teacher, course);
  });
  return [...byName.values()];
}

export function InstructorsPage() {
  const { courses } = useApp();
  const instructors = getInstructors(courses);

  return (
    <>
      <PageHeader eyebrow="Эксперты" title="Преподаватели" description="Практики из Центральной Азии и международных компаний." />
      {instructors.length === 0 ? (
        <div className="panel empty-state">
          <h2>Пока нет преподавателей</h2>
          <p>Как только кто-то создаст курс, он появится здесь.</p>
          <Link className="button button--primary" to="/instructor/create">Создать курс</Link>
        </div>
      ) : (
        <div className="people-grid">
          {instructors.map((course) => (
            <Link key={course.id} to={`/instructors/${course.id}`} className="person-card panel">
              <div className={`person-card__avatar preview--${course.tone}`}>{course.teacher[0]}</div>
              <h3>{course.teacher}</h3><p>{course.category}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export function InstructorProfilePage() {
  const { instructorId } = useParams();
  const { courses, subscribedInstructorIds, toggleSubscribe } = useApp();
  const id = Number(instructorId);
  const anchorCourse = courses.find((course) => course.id === id);

  if (!anchorCourse) {
    return (
      <div className="panel empty-state">
        <h2>Преподаватель не найден</h2>
        <Link className="button button--primary" to="/instructors">Все преподаватели</Link>
      </div>
    );
  }

  const teacherCourses = courses.filter((course) => course.teacher === anchorCourse.teacher);
  const subscribed = subscribedInstructorIds.includes(id);

  return (
    <>
      <section className="profile-hero panel">
        <div className={`person-card__avatar preview--${anchorCourse.tone}`}>{anchorCourse.teacher[0]}</div>
        <div><span className="eyebrow">Преподаватель</span><h1>{anchorCourse.teacher}</h1><p>{teacherCourses.length} курс(ов) на платформе.</p></div>
        <Button variant={subscribed ? 'secondary' : 'primary'} onClick={() => toggleSubscribe(id)}>{subscribed ? 'Вы подписаны ✓' : 'Подписаться'}</Button>
      </section>
      <section className="section"><div className="section__header"><h2>Курсы преподавателя</h2></div><CourseGrid courses={teacherCourses} /></section>
    </>
  );
}

export function MarketingPage({ title, description, cta = 'Начать обучение', ctaTo = '/register' }) {
  const navigate = useNavigate();
  return (
    <>
      <section className="marketing-hero panel"><span className="eyebrow">ZIYO</span><h1>{title}</h1><p>{description}</p><Button onClick={() => navigate(ctaTo)}>{cta}</Button></section>
      <section className="section"><div className="feature-grid">{['Локальный контекст', 'Практические проекты', 'Понятные цены', 'Сильные преподаватели', 'Сертификаты', 'Мобильное обучение'].map((item) => <div className="panel" key={item}><h3>{item}</h3><p>Понятный и полезный опыт для пользователей нашего региона.</p></div>)}</div></section>
    </>
  );
}

export function BlogPage() {
  const { courses } = useApp();
  return (
    <>
      <PageHeader eyebrow="Материалы" title="Блог ZIYO" description="Карьера, образование и технологии." />
      {courses.length === 0 ? (
        <div className="panel empty-state">
          <h2>Материалов пока нет</h2>
          <p>Загляните позже.</p>
        </div>
      ) : <CourseGrid courses={courses} />}
    </>
  );
}
