import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Button from '../components/Button.jsx';
import { courses } from '../data/courses.js';

export function InstructorDashboardPage() {
  return (
    <>
      <PageHeader eyebrow="Студия преподавателя" title="Обзор" description="Управляйте курсами, студентами и доходами." action={<Button>Создать курс</Button>} />
      <div className="stats-grid">
        <StatCard value="12 480" label="студентов" />
        <StatCard value="8" label="курсов" />
        <StatCard value="42 580 TJS" label="доход за месяц" />
        <StatCard value="4.9" label="средний рейтинг" />
      </div>
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>Курс</th><th>Студенты</th><th>Рейтинг</th><th>Доход</th></tr></thead>
          <tbody>{courses.slice(0, 6).map((course) => <tr key={course.id}><td>{course.title}</td><td>{course.students}</td><td>{course.rating}</td><td>{course.price * 12} TJS</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

export function CreateCoursePage() {
  return (
    <>
      <PageHeader eyebrow="Студия" title="Создание курса" description="Заполните основные данные курса." />
      <form className="panel form">
        <label>Название курса<input placeholder="Например: React с нуля" /></label>
        <label>Категория<select><option>Программирование</option><option>Дизайн</option><option>Маркетинг</option></select></label>
        <label>Описание<textarea rows="6" /></label>
        <Button type="submit">Сохранить</Button>
      </form>
    </>
  );
}

export function SimpleInstructorPage({ title, description }) {
  return <><PageHeader eyebrow="Студия преподавателя" title={title} description={description} /><div className="panel empty-state"><h2>{title}</h2><p>{description}</p></div></>;
}
