import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/appStore.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import StarRating from './StarRating.jsx';
import CategoryIcon, { getCategoryToneKey } from './icons/CategoryIcon.jsx';
import { getAverageRating, getCourseThumbnail, getEffectivePrice, getLessonCount, getReviewCount, hasDiscount } from '../utils/courseHelpers.js';

export default function CourseCard({ course, showProgress = false, progress = 0 }) {
  const { wishlistIds, toggleWishlist } = useApp((state) => ({
    wishlistIds: state.wishlistIds,
    toggleWishlist: state.toggleWishlist,
  }));
  const { t, translateLevel } = useLanguage();
  const saved = wishlistIds.includes(course.id);
  const rating = getAverageRating(course);
  const reviewCount = getReviewCount(course);
  const cover = getCourseThumbnail(course);
  const [coverLoaded, setCoverLoaded] = useState(false);

  const handleWishlistClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(course.id);
  };

  return (
    <Link to={`/courses/${course.id}`} className="course-card">
      <div className={`course-card__preview ${!cover ? `category-tile--${getCategoryToneKey(course.category)}` : ''}`}>
        {!cover && <CategoryIcon category={course.category} />}
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
        <span className="course-card__badge">{getLessonCount(course)} {t('common.lessonsWord')}</span>
        <span className="course-card__duration">{translateLevel(course.level)}</span>
        <button
          type="button"
          className={`course-card__wishlist${saved ? ' active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={saved ? t('courseCard.removeFromWishlist') : t('courseCard.addToWishlist')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'oklch(62% 0.19 20)' : 'none'} stroke={saved ? 'oklch(62% 0.19 20)' : 'var(--ink-faint)'} strokeWidth="1.7">
            <path d="M12 20s-7-4.3-9.5-8.4C.6 8.1 2 4.6 5.5 4.6c2 0 3.3 1.1 4 2.2.7-1.1 2-2.2 4-2.2 3.5 0 4.9 3.5 3 7C19 15.7 12 20 12 20z" />
          </svg>
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
