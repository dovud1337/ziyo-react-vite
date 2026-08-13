import { useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import CourseGrid from '../components/CourseGrid.jsx';
import { courses } from '../data/courses.js';

export default function CoursePage() {
  const { courseId } = useParams();
  const course = courses.find((item) => item.id === Number(courseId)) ?? courses[0];

  return (
    <>
      <section className="course-hero">
        <div>
          <span className="eyebrow">{course.category}</span>
          <h1>{course.title}</h1>
          <p>Практический курс с заданиями, проектами и обратной связью от преподавателя.</p>
          <div className="course-facts">
            <span>★ {course.rating}</span>
            <span>{course.students.toLocaleString('ru-RU')} студентов</span>
            <span>{course.duration}</span>
          </div>
        </div>
        <aside className="purchase-card">
          <div className={`purchase-card__preview preview--${course.tone}`} />
          <strong>{course.price} TJS</strong>
          <Button>Записаться на курс</Button>
        </aside>
      </section>
      <section className="section panel">
        <h2>Чему вы научитесь</h2>
        <ul className="check-list">
          <li>Работать с реальными задачами</li>
          <li>Создавать проекты для портфолио</li>
          <li>Получать обратную связь</li>
          <li>Подготовиться к работе</li>
        </ul>
      </section>
      <section className="section">
        <div className="section__header"><h2>Похожие курсы</h2></div>
        <CourseGrid courses={courses.filter((item) => item.id !== course.id)} limit={4} />
      </section>
    </>
  );
}
