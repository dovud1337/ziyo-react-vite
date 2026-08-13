import { Link } from 'react-router-dom';
import CourseGrid from '../components/CourseGrid.jsx';
import { categories, courses } from '../data/courses.js';

export default function HomePage() {
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
          <div><strong>25 000+</strong><span>студентов</span></div>
          <div><strong>612</strong><span>курсов</span></div>
          <div><strong>184</strong><span>эксперта</span></div>
          <div><strong>6</strong><span>языков</span></div>
        </div>
      </section>

      <div className="chips">
        {categories.map((category) => <button key={category}>{category}</button>)}
      </div>

      <section className="section">
        <div className="section__header">
          <h2>Сейчас на платформе</h2>
          <Link to="/catalog">Открыть каталог →</Link>
        </div>
        <CourseGrid courses={courses} />
      </section>

      <section className="section">
        <div className="section__header"><h2>Продолжить обучение</h2></div>
        <CourseGrid courses={courses} showProgress limit={4} />
      </section>
    </>
  );
}
