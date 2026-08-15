export function getLessons(course) {
  return (course.sections ?? []).flatMap((section) => (
    (section.lessons ?? []).map((lesson) => ({ ...lesson, sectionTitle: section.title }))
  ));
}

export function isCourseDetailLoaded(course) {
  return Array.isArray(course.sections);
}

export function getLessonCount(course) {
  if (Array.isArray(course.sections)) return getLessons(course).length;
  return course.lessonCount ?? 0;
}

export function getReviewCount(course) {
  if (Array.isArray(course.reviews)) return course.reviews.length;
  return course.reviewCount ?? 0;
}

export function getAverageRating(course) {
  if (Array.isArray(course.reviews)) {
    if (course.reviews.length === 0) return null;
    const total = course.reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / course.reviews.length) * 10) / 10;
  }
  return course.avgRating ?? null;
}

export function getEffectivePrice(course) {
  return course.discountPrice ?? course.price;
}

export function hasDiscount(course) {
  return course.discountPrice != null && course.discountPrice < course.price;
}

export function getCourseProgress(course, enrollment) {
  const total = getLessonCount(course);
  if (!enrollment || total === 0) return 0;
  const completed = enrollment.completedLessonIds.length;
  return Math.round((completed / total) * 100);
}
