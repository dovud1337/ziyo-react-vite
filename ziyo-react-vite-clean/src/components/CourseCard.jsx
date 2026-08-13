import { Link } from 'react-router-dom';

export default function CourseCard({ course, showProgress = false, progress = 62 }) {
  return (
    <Link to={`/courses/${course.id}`} className="course-card">
      <div className={`course-card__preview preview--${course.tone}`}>
        <span className="course-card__badge">Превью</span>
        <span className="course-card__duration">{course.duration}</span>
      </div>
      <div className="course-card__content">
        <h3>{course.title}</h3>
        <p>{course.teacher}</p>
        <div className="course-card__meta">
          <span>★ {course.rating}</span>
          <span>{course.students.toLocaleString('ru-RU')} студентов</span>
        </div>
        {showProgress ? (
          <div className="progress">
            <div className="progress__bar" style={{ width: `${progress}%` }} />
          </div>
        ) : (
          <strong>{course.price} TJS</strong>
        )}
      </div>
    </Link>
  );
}
