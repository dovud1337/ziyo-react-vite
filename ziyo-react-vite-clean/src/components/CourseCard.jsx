import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import StarRating from './StarRating.jsx';
import { getAverageRating, getEffectivePrice, getLessonCount, getReviewCount, hasDiscount } from '../utils/courseHelpers.js';

export default function CourseCard({ course, showProgress = false, progress = 0 }) {
  const { wishlistIds, toggleWishlist } = useApp();
  const saved = wishlistIds.includes(course.id);
  const rating = getAverageRating(course);
  const reviewCount = getReviewCount(course);

  const handleWishlistClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(course.id);
  };

  return (
    <Link to={`/courses/${course.id}`} className="course-card">
      <div className={`course-card__preview preview--${course.tone}`}>
        <span className="course-card__badge">{getLessonCount(course)} уроков</span>
        <span className="course-card__duration">{course.level}</span>
        <button
          type="button"
          className={`course-card__wishlist${saved ? ' active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={saved ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          {saved ? '♥' : '♡'}
        </button>
      </div>
      <div className="course-card__content">
        <h3>{course.title}</h3>
        <p>{course.teacher}</p>
        <div className="course-card__meta">
          {rating != null ? (
            <span><StarRating value={rating} /> {rating} ({reviewCount})</span>
          ) : (
            <span>Нет отзывов</span>
          )}
        </div>
        {showProgress ? (
          <div className="progress">
            <div className="progress__bar" style={{ width: `${progress}%` }} />
          </div>
        ) : (
          <strong>
            {hasDiscount(course) && <span className="price-original">{course.price} TJS</span>}
            {getEffectivePrice(course)} TJS
          </strong>
        )}
      </div>
    </Link>
  );
}
