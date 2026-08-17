import { Link } from 'react-router-dom';
import { useApp } from '../store/appStore.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import StarRating from './StarRating.jsx';
import { getAverageRating, getEffectivePrice, getLessonCount, getReviewCount, hasDiscount } from '../utils/courseHelpers.js';

export default function CourseCard({ course, showProgress = false, progress = 0 }) {
  const { wishlistIds, toggleWishlist } = useApp((state) => ({
    wishlistIds: state.wishlistIds,
    toggleWishlist: state.toggleWishlist,
  }));
  const { t, translateLevel } = useLanguage();
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
        <span className="course-card__badge">{getLessonCount(course)} {t('common.lessonsWord')}</span>
        <span className="course-card__duration">{translateLevel(course.level)}</span>
        <button
          type="button"
          className={`course-card__wishlist${saved ? ' active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={saved ? t('courseCard.removeFromWishlist') : t('courseCard.addToWishlist')}
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
            <span>{t('common.noReviews')}</span>
          )}
        </div>
        {showProgress ? (
          <div className="progress">
            <div className="progress__bar" style={{ width: `${progress}%` }} />
          </div>
        ) : (
          <strong>
            {hasDiscount(course) && <span className="price-original">{course.price} TJS</span>}
            <span className="course-card__price">{getEffectivePrice(course)} TJS</span>
          </strong>
        )}
      </div>
    </Link>
  );
}
