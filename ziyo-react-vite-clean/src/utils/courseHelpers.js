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

export function getCourseThumbnail(course) {
  const isBunnyUrl = (url) => url?.includes('mediadelivery.net/embed/');
  const videoUrl = isBunnyUrl(course.previewVideoUrl)
    ? course.previewVideoUrl
    : getLessons(course).find((item) => item.type === 'video' && isBunnyUrl(item.videoUrl))?.videoUrl;
  if (!isBunnyUrl(videoUrl)) return null;
  const guid = videoUrl.split('?')[0].split('/').filter(Boolean).pop();
  const hostname = import.meta.env.VITE_BUNNY_CDN_HOSTNAME;
  if (!hostname || !guid) return null;
  return `https://${hostname}/${guid}/thumbnail.jpg`;
}

export function getCourseProgress(course, enrollment) {
  const total = getLessonCount(course);
  if (!enrollment || total === 0) return 0;
  const completedIds = new Set(enrollment.completedLessonIds ?? []);
  const completed = Array.isArray(course.sections)
    ? getLessons(course).filter((lesson) => completedIds.has(lesson.id)).length
    : Math.min(completedIds.size, total);
  return Math.round((completed / total) * 100);
}
