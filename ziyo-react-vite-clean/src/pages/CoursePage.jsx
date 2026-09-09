import { useState } from 'react';
import useCourseDetail from '../hooks/useCourseDetail.js';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import CourseGrid from '../components/CourseGrid.jsx';
import StarRating from '../components/StarRating.jsx';
import SeoHead from '../components/SeoHead.jsx';
import { useApp } from '../store/appStore.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import CategoryIcon, { getCategoryToneKey } from '../components/icons/CategoryIcon.jsx';
import { getAverageRating, getCourseThumbnail, getEffectivePrice, getLessonCount, getLessons, getReviewCount, hasDiscount, isCourseDetailLoaded } from '../utils/courseHelpers.js';

function ReviewForm({ courseId }) {
  const { addReview } = useApp((state) => ({ addReview: state.addReview }));
  const { t } = useLanguage();
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
      <label>{t('course.yourRating')}<StarRating value={rating} interactive onChange={setRating} /></label>
      <label>{t('course.yourReview')}<textarea rows="3" value={text} onChange={(event) => setText(event.target.value)} placeholder={t('course.reviewPlaceholder')} /></label>
      <Button type="submit">{t('course.submitReview')}</Button>
    </form>
  );
}

function QnaThread({ course }) {
  const { user, addQuestion, addReply } = useApp((state) => ({
    user: state.user, addQuestion: state.addQuestion, addReply: state.addReply,
  }));
  const { t, dateLocale } = useLanguage();
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
      {course.qna.length === 0 && <p>{t('course.noQuestionsYet')}</p>}
      {course.qna.map((item) => (
        <div className="qna-item" key={item.id}>
          <div className="review-item__meta"><strong>{item.author}</strong><span>{new Date(item.date).toLocaleDateString(dateLocale)}</span></div>
          <p>{item.question}</p>
          {item.replies.map((reply) => (
            <div className="qna-reply" key={reply.id}>
              <strong>{reply.author}: </strong>{reply.text}
            </div>
          ))}
          {user && (
            <form onSubmit={handleReply(item.id)} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                placeholder={t('course.replyPlaceholder')}
                value={replyDrafts[item.id] ?? ''}
                onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))}
              />
              <Button type="submit" variant="secondary">{t('course.reply')}</Button>
            </form>
          )}
        </div>
      ))}
      {user ? (
        <form onSubmit={handleAsk} className="form" style={{ marginTop: 14 }}>
          <label>{t('course.askQuestion')}<textarea rows="2" value={question} onChange={(event) => setQuestion(event.target.value)} /></label>
          <Button type="submit">{t('course.ask')}</Button>
        </form>
      ) : (
        <p>{t('course.loginToAsk')}</p>
      )}
    </>
  );
}

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, cartIds, enrollments, addToCart, user, coursesLoaded, fetchCourseDetail } = useApp((state) => ({
    courses: state.courses,
    cartIds: state.cartIds,
    enrollments: state.enrollments,
    addToCart: state.addToCart,
    user: state.user,
    coursesLoaded: state.coursesLoaded,
    fetchCourseDetail: state.fetchCourseDetail,
  }));
  const { t, translateCategory, translateLevel, dateLocale } = useLanguage();
  const course = courses.find((item) => item.id === Number(courseId));
  const [coverLoaded, setCoverLoaded] = useState(false);

  const { loading, error, retry } = useCourseDetail(courseId);
  const [enrollError, setEnrollError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  if (error) return <div className="panel empty-state" role="alert"><h2>{t('common.loadErrorTitle')}</h2><p>{error.message}</p><Button onClick={retry}>{t('common.retry')}</Button></div>;
  if (loading) return <div className="panel empty-state"><h2>{t('common.loading')}</h2></div>;

  if (!course) return coursesLoaded ? <Navigate to="/catalog" replace /> : null;
  if (!isCourseDetailLoaded(course)) return <div className="panel empty-state"><h2>{t('common.loading')}</h2></div>;

  const isEnrolled = Boolean(enrollments[course.id]);
  const isInCart = cartIds.includes(course.id);
  const rating = getAverageRating(course);
  const reviewCount = getReviewCount(course);
  const lessons = getLessons(course);
  const cover = getCourseThumbnail(course);
  const alreadyReviewed = user && course.reviews.some((review) => review.authorId === user.id);

  const handleEnroll = async () => {
    if (!user) { navigate('/login', { state: { from: `/courses/${course.id}` } }); return; }
    setEnrolling(true);
    setEnrollError('');
    try { await addToCart(course.id); navigate('/cart'); }
    catch (err) { setEnrollError(err.message ?? t('auth.genericError')); }
    finally { setEnrolling(false); }
  };

  return (
    <>
      <SeoHead title={course.title} description={course.description} />
      <section className="course-hero">
        <div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="eyebrow">{translateCategory(course.category)}</span>
            <span className="eyebrow">{translateLevel(course.level)}</span>
          </div>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="course-facts">
            {rating != null ? (
              <span><StarRating value={rating} /> {rating} ({reviewCount} {t('common.reviewsSuffix')})</span>
            ) : <span>{t('common.noReviews')}</span>}
            <span>{getLessonCount(course)} {t('common.lessonsWord')}</span>
            <span>{t('course.teacherLabel', { name: course.teacher })}</span>
          </div>
        </div>
        <aside className="purchase-card">
          <div className={`purchase-card__preview ${!cover ? `category-tile--${getCategoryToneKey(course.category)}` : ''}`} style={{ position: 'relative' }}>
            {!cover && <CategoryIcon category={course.category} size={40} />}
            {cover && (
              <img
                src={cover}
                alt=""
                loading="lazy"
                decoding="async"
                onLoad={() => setCoverLoaded(true)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: coverLoaded ? 1 : 0,
                  transition: 'opacity .3s ease',
                }}
              />
            )}
          </div>
          <strong>
            {hasDiscount(course) && <span className="price-original">{course.price} TJS</span>}
            {getEffectivePrice(course)} TJS
          </strong>
          {isEnrolled ? (
            lessons.length > 0 ? (
              <Button variant="secondary" onClick={() => navigate(`/student/lesson/${course.id}/${lessons[0].id}`)}>{t('home.continueLearning')}</Button>
            ) : (
              <Button variant="secondary">{t('course.alreadyEnrolled')}</Button>
            )
          ) : isInCart ? (
            <Button variant="secondary" onClick={() => navigate('/cart')}>{t('course.inCartGoTo')}</Button>
          ) : (
            <Button disabled={enrolling} onClick={handleEnroll}>{t('course.enroll')}</Button>
          )}
          {enrollError && <p role="alert">{enrollError}</p>}
        </aside>
      </section>

      <section className="section panel">
        <h2>{t('course.curriculum')}</h2>
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
        <h2>{t('course.reviews')} {reviewCount > 0 && `(${reviewCount})`}</h2>
        {course.reviews.length === 0 && <p>{t('course.noReviewsYet')}</p>}
        {course.reviews.map((review) => (
          <div className="review-item" key={review.id}>
            <div className="review-item__meta">
              <strong>{review.author}</strong>
              <StarRating value={review.rating} />
              <span>{new Date(review.date).toLocaleDateString(dateLocale)}</span>
            </div>
            <p>{review.text}</p>
          </div>
        ))}
        {isEnrolled && !alreadyReviewed && <ReviewForm courseId={course.id} />}
      </section>

      <section className="section panel">
        <h2>{t('course.qna')}</h2>
        <QnaThread course={course} />
      </section>

      <section className="section">
        <div className="section__header"><h2>{t('course.similarCourses')}</h2></div>
        <CourseGrid courses={courses.filter((item) => item.id !== course.id && item.category === course.category)} limit={4} />
      </section>
    </>
  );
}
