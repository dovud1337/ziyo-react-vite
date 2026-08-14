export function getLessons(course) {
  return (course.sections ?? []).flatMap((section) => (
    section.lessons.map((lesson) => ({ ...lesson, sectionTitle: section.title }))
  ));
}

export function getLessonCount(course) {
  return getLessons(course).length;
}

export function getReviewCount(course) {
  return (course.reviews ?? []).length;
}

export function getAverageRating(course) {
  const reviews = course.reviews ?? [];
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
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
