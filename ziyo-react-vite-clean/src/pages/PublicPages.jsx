import { Link } from 'react-router-dom';
import CourseGrid from '../components/CourseGrid.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import { courses } from '../data/courses.js';

export function InstructorsPage() {
  return (
    <>
      <PageHeader eyebrow="Эксперты" title="Преподаватели" description="Практики из Центральной Азии и международных компаний." />
      <div className="people-grid">
        {courses.slice(0, 8).map((course) => (
          <Link key={course.id} to={`/instructors/${course.id}`} className="person-card panel">
            <div className={`person-card__avatar preview--${course.tone}`}>{course.teacher[0]}</div>
            <h3>{course.teacher}</h3><p>{course.category}</p><strong>★ {course.rating}</strong>
          </Link>
        ))}
      </div>
    </>
  );
}

export function InstructorProfilePage() {
  return (
    <>
      <section className="profile-hero panel"><div className="person-card__avatar preview--green">Д</div><div><span className="eyebrow">Преподаватель</span><h1>Даврон Саидов</h1><p>Python-разработчик и преподаватель. Более 8 лет практического опыта.</p></div><Button>Подписаться</Button></section>
      <section className="section"><div className="section__header"><h2>Курсы преподавателя</h2></div><CourseGrid courses={courses} limit={4} /></section>
    </>
  );
}

export function MarketingPage({ title, description, cta = 'Начать обучение' }) {
  return (
    <>
      <section className="marketing-hero panel"><span className="eyebrow">ZIYO</span><h1>{title}</h1><p>{description}</p><Button>{cta}</Button></section>
      <section className="section"><div className="feature-grid">{['Локальный контекст', 'Практические проекты', 'Понятные цены', 'Сильные преподаватели', 'Сертификаты', 'Мобильное обучение'].map((item) => <div className="panel" key={item}><h3>{item}</h3><p>Понятный и полезный опыт для пользователей нашего региона.</p></div>)}</div></section>
    </>
  );
}

export function BlogPage() {
  return <><PageHeader eyebrow="Материалы" title="Блог ZIYO" description="Карьера, образование и технологии." /><CourseGrid courses={courses} /></>;
}
