import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import CourseGrid from '../components/CourseGrid.jsx';
import StarRating from '../components/StarRating.jsx';
import { useApp } from '../context/AppContext.jsx';
import { getAverageRating, getEffectivePrice, getLessonCount, getLessons, getReviewCount, hasDiscount } from '../utils/courseHelpers.js';

function ReviewForm({ courseId }) {
  const { addReview } = useApp();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    await addReview(courseId, { rating, text: text.trim() });
    setText('');
  };

  return (
    <form className="form" onSubmit={handleSubmit} style={{ marginTop: 12 }}>
      <label>Ваша оценка<StarRating value={rating} interactive onChange={setRating} /></label>
      <label>Отзыв<textarea rows="3" value={text} onChange={(event) => setText(event.target.value)} placeholder="Поделитесь впечатлением о курсе" /></label>
      <Button type="submit">Оставить отзыв</Button>
    </form>
  );
}

function QnaThread({ course }) {
  const { user, addQuestion, addReply } = useApp();
  const [question, setQuestion] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});

  const handleAsk = async (event) => {
    event.preventDefault();
    if (!question.trim()) return;
    await addQuestion(course.id, question.trim());
    setQuestion('');
  };

  const handleReply = (questionId) => async (event) => {
    event.preventDefault();
    const text = (replyDrafts[questionId] ?? '').trim();
    if (!text) return;
    await addReply(course.id, questionId, text);
    setReplyDrafts((prev) => ({ ...prev, [questionId]: '' }));
  };

  return (
    <>
      {course.qna.length === 0 && <p>Пока нет вопросов. Будьте первым.</p>}
      {course.qna.map((item) => (
        <div className="qna-item" key={item.id}>
          <div className="review-item__meta"><strong>{item.author}</strong><span>{new Date(item.date).toLocaleDateString('ru-RU')}</span></div>
          <p>{item.question}</p>
          {item.replies.map((reply) => (
            <div className="qna-reply" key={reply.id}>
              <strong>{reply.author}: </strong>{reply.text}
            </div>
          ))}
          {user && (
            <form onSubmit={handleReply(item.id)} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                placeholder="Ответить..."
                value={replyDrafts[item.id] ?? ''}
                onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))}
              />
              <Button type="submit" variant="secondary">Ответить</Button>
            </form>
          )}
        </div>
      ))}
      {user ? (
        <form onSubmit={handleAsk} className="form" style={{ marginTop: 14 }}>
          <label>Задать вопрос<textarea rows="2" value={question} onChange={(event) => setQuestion(event.target.value)} /></label>
          <Button type="submit">Спросить</Button>
        </form>
      ) : (
        <p>Войдите, чтобы задать вопрос преподавателю.</p>
      )}
    </>
  );
}

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, cartIds, enrollments, addToCart, user, coursesLoaded } = useApp();
  const course = courses.find((item) => item.id === Number(courseId));

  if (!course) return coursesLoaded ? <Navigate to="/catalog" replace /> : null;

  const isEnrolled = Boolean(enrollments[course.id]);
  const isInCart = cartIds.includes(course.id);
  const rating = getAverageRating(course);
  const reviewCount = getReviewCount(course);
  const lessons = getLessons(course);
  const alreadyReviewed = user && course.reviews.some((review) => review.author === user.name);

  return (
    <>
      <section className="course-hero">
        <div>
          <span className="eyebrow">{course.category} · {course.level}</span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="course-facts">
            {rating != null ? (
              <span><StarRating value={rating} /> {rating} ({reviewCount} отзывов)</span>
            ) : <span>Нет отзывов</span>}
            <span>{getLessonCount(course)} уроков</span>
            <span>Преподаватель: {course.teacher}</span>
          </div>
        </div>
        <aside className="purchase-card">
          <div className={`purchase-card__preview preview--${course.tone}`} />
          <strong>
            {hasDiscount(course) && <span className="price-original">{course.price} TJS</span>}
            {getEffectivePrice(course)} TJS
          </strong>
          {isEnrolled ? (
            lessons.length > 0 ? (
              <Button variant="secondary" onClick={() => navigate(`/student/lesson/${course.id}/${lessons[0].id}`)}>Продолжить обучение</Button>
            ) : (
              <Button variant="secondary">Вы записаны ✓</Button>
            )
          ) : isInCart ? (
            <Button variant="secondary" onClick={() => navigate('/cart')}>В корзине · перейти</Button>
          ) : (
            <Button onClick={() => { addToCart(course.id); navigate('/cart'); }}>Записаться на курс</Button>
          )}
        </aside>
      </section>

      <section className="section panel">
        <h2>Программа курса</h2>
        <div className="curriculum-outline">
          {course.sections.map((section) => (
            <details key={section.id}>
              <summary>{section.title} ({section.lessons.length})</summary>
              <ul>
                {section.lessons.map((lesson) => (
                  <li key={lesson.id}>{lesson.type === 'video' ? '▶' : '📄'} {lesson.title}</li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      <section className="section panel">
        <h2>Отзывы {reviewCount > 0 && `(${reviewCount})`}</h2>
        {course.reviews.length === 0 && <p>Пока нет отзывов об этом курсе.</p>}
        {course.reviews.map((review) => (
          <div className="review-item" key={review.id}>
            <div className="review-item__meta">
              <strong>{review.author}</strong>
              <StarRating value={review.rating} />
              <span>{new Date(review.date).toLocaleDateString('ru-RU')}</span>
            </div>
            <p>{review.text}</p>
          </div>
        ))}
        {isEnrolled && !alreadyReviewed && <ReviewForm courseId={course.id} />}
      </section>

      <section className="section panel">
        <h2>Вопросы и ответы</h2>
        <QnaThread course={course} />
      </section>

      <section className="section">
        <div className="section__header"><h2>Похожие курсы</h2></div>
        <CourseGrid courses={courses.filter((item) => item.id !== course.id && item.category === course.category)} limit={4} />
      </section>
    </>
  );
}
