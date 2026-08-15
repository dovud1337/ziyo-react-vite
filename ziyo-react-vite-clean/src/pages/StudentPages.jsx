import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import CourseGrid from '../components/CourseGrid.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Button from '../components/Button.jsx';
import { useApp } from '../store/appStore.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getCourseProgress, getLessons, isCourseDetailLoaded } from '../utils/courseHelpers.js';

function EmptyState({ title, description }) {
  const { t } = useLanguage();
  return (
    <div className="panel empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      <Link className="button button--primary" to="/catalog">{t('common.goToCatalog')}</Link>
    </div>
  );
}

export function StudentDashboardPage() {
  const { user, courses, enrollments } = useApp((state) => ({
    user: state.user, courses: state.courses, enrollments: state.enrollments,
  }));
  const { t } = useLanguage();
  const enrolledIds = Object.keys(enrollments).map(Number);
  const activeCourses = courses.filter((course) => enrolledIds.includes(course.id));
  const avgProgress = activeCourses.length > 0
    ? Math.round(activeCourses.reduce((sum, course) => sum + getCourseProgress(course, enrollments[course.id]), 0) / activeCourses.length)
    : 0;
  const certificateCount = activeCourses.filter((course) => getCourseProgress(course, enrollments[course.id]) === 100).length;

  return (
    <>
      <PageHeader eyebrow={t('student.cabinetEyebrow')} title={t('student.greeting', { name: user?.name ?? t('student.guest') })} description={t('student.dashboardDescription')} />
      <div className="stats-grid">
        <StatCard value={String(activeCourses.length)} label={t('student.statActiveCourses')} />
        <StatCard value={`${avgProgress}%`} label={t('student.statAvgProgress')} />
        <StatCard value={String(courses.length)} label={t('student.statCoursesOnPlatform')} />
        <StatCard value={String(certificateCount)} label={t('student.statCertificates')} />
      </div>
      <section className="section">
        <div className="section__header"><h2>{t('home.continueLearning')}</h2></div>
        {activeCourses.length > 0 ? (
          <CourseGrid courses={activeCourses} showProgress enrollments={enrollments} limit={4} />
        ) : (
          <EmptyState title={t('student.noActiveCoursesTitle')} description={t('student.noActiveCoursesDescription')} />
        )}
      </section>
    </>
  );
}

export function MyCoursesPage() {
  const { courses, enrollments } = useApp((state) => ({ courses: state.courses, enrollments: state.enrollments }));
  const { t } = useLanguage();
  const enrolledIds = Object.keys(enrollments).map(Number);
  const myCourses = courses.filter((course) => enrolledIds.includes(course.id));

  return (
    <>
      <PageHeader eyebrow={t('sidebar.learning')} title={t('student.myCoursesTitle')} description={t('student.myCoursesDescription')} />
      {myCourses.length > 0 ? (
        <CourseGrid courses={myCourses} showProgress enrollments={enrollments} />
      ) : (
        <EmptyState title={t('student.emptyHereTitle')} description={t('student.emptyHereDescription')} />
      )}
    </>
  );
}

export function WishlistPage() {
  const { courses, wishlistIds } = useApp((state) => ({ courses: state.courses, wishlistIds: state.wishlistIds }));
  const { t } = useLanguage();
  const savedCourses = courses.filter((course) => wishlistIds.includes(course.id));

  return (
    <>
      <PageHeader eyebrow={t('student.savedEyebrow')} title={t('student.wishlistTitle')} description={t('student.wishlistDescription')} />
      {savedCourses.length > 0 ? (
        <CourseGrid courses={savedCourses} />
      ) : (
        <EmptyState title={t('student.wishlistEmptyTitle')} description={t('student.wishlistEmptyDescription')} />
      )}
    </>
  );
}

export function CertificatesPage() {
  const { user, courses, enrollments } = useApp((state) => ({
    user: state.user, courses: state.courses, enrollments: state.enrollments,
  }));
  const { t, dateLocale } = useLanguage();
  const completedCourses = courses.filter((course) => {
    const enrollment = enrollments[course.id];
    return enrollment && getCourseProgress(course, enrollment) === 100;
  });

  return (
    <>
      <PageHeader eyebrow={t('student.cabinetEyebrow')} title={t('student.certificatesTitle')} description={t('student.certificatesDescription')} />
      {completedCourses.length > 0 ? (
        completedCourses.map((course) => {
          const enrollment = enrollments[course.id];
          const date = new Date(enrollment.enrolledAt).toLocaleDateString(dateLocale);
          return (
            <div className="certificate-card" key={course.id}>
              <span className="eyebrow">{t('student.certificateBadge')}</span>
              <h2>{course.title}</h2>
              <p>{t('student.issuedTo', { name: user?.name ?? t('student.guest'), date })}</p>
              <Button onClick={() => window.print()}>{t('common.print')}</Button>
            </div>
          );
        })
      ) : (
        <EmptyState title={t('student.noCertificatesTitle')} description={t('student.noCertificatesDescription')} />
      )}
    </>
  );
}

export function LessonPage() {
  const { courseId, lessonId } = useParams();
  const { courses, enrollments, toggleLessonComplete, coursesLoaded, fetchCourseDetail } = useApp((state) => ({
    courses: state.courses,
    enrollments: state.enrollments,
    toggleLessonComplete: state.toggleLessonComplete,
    coursesLoaded: state.coursesLoaded,
    fetchCourseDetail: state.fetchCourseDetail,
  }));
  const { t } = useLanguage();
  const course = courses.find((item) => item.id === Number(courseId));
  const enrollment = enrollments[Number(courseId)];

  useEffect(() => {
    fetchCourseDetail(Number(courseId));
  }, [courseId, fetchCourseDetail]);

  if (!course) return coursesLoaded ? <Navigate to="/student/courses" replace /> : null;
  if (!isCourseDetailLoaded(course)) return <div className="panel empty-state"><h2>{t('common.loading')}</h2></div>;

  const lessons = getLessons(course);
  const activeId = Number(lessonId);
  const activeIndex = lessons.findIndex((lesson) => lesson.id === activeId);
  const lesson = activeIndex >= 0 ? lessons[activeIndex] : lessons[0];
  const completed = enrollment?.completedLessonIds.includes(lesson?.id) ?? false;
  const progress = enrollment && lessons.length > 0
    ? Math.round((enrollment.completedLessonIds.length / lessons.length) * 100)
    : 0;
  const prevLesson = activeIndex > 0 ? lessons[activeIndex - 1] : null;
  const nextLesson = activeIndex >= 0 && activeIndex < lessons.length - 1 ? lessons[activeIndex + 1] : null;

  if (!lesson) {
    return (
      <div className="panel empty-state">
        <h2>{t('student.noLessonsTitle')}</h2>
        <p>{t('student.noLessonsDescription')}</p>
      </div>
    );
  }

  return (
    <div className="lesson-layout">
      <section className="video-column">
        {lesson.type === 'video' && lesson.videoUrl ? (
          <div className="video-placeholder" style={{ padding: 0, overflow: 'hidden' }}>
            <iframe
              title={lesson.title}
              src={lesson.videoUrl}
              style={{ width: '100%', height: '100%', border: 0 }}
              allowFullScreen
            />
          </div>
        ) : (
          <div className="video-placeholder">{lesson.type === 'video' ? '▶' : '📄'}</div>
        )}
        <span className="eyebrow">{lesson.sectionTitle}</span>
        <h1>{lesson.title}</h1>
        <p>{lesson.content || t('student.lessonMaterialsSoon')}</p>
        <div className="progress"><div className="progress__bar" style={{ width: `${progress}%` }} /></div>
        <Button
          variant={completed ? 'secondary' : 'primary'}
          onClick={() => toggleLessonComplete(course.id, lesson.id)}
        >
          {completed ? t('student.lessonCompleted') : t('student.markComplete')}
        </Button>
        {progress === 100 && (
          <div className="panel" style={{ marginTop: 12 }}>
            <strong>{t('student.courseCompleted')}</strong>
            <Link to="/student/certificates">{t('student.getCertificate')}</Link>
          </div>
        )}
        <div className="lesson-nav">
          {prevLesson ? <Link to={`/student/lesson/${course.id}/${prevLesson.id}`}>{t('student.prevLesson')}</Link> : <span />}
          {nextLesson ? <Link to={`/student/lesson/${course.id}/${nextLesson.id}`}>{t('student.nextLesson')}</Link> : <span />}
        </div>
      </section>
      <aside className="lesson-sidebar panel">
        <h3>{course.title}</h3>
        {lessons.map((item) => (
          <Link
            key={item.id}
            to={`/student/lesson/${course.id}/${item.id}`}
            className={[
              item.id === lesson.id ? 'active' : '',
              enrollment?.completedLessonIds.includes(item.id) ? 'done' : '',
            ].filter(Boolean).join(' ')}
          >
            {item.title}
          </Link>
        ))}
      </aside>
    </div>
  );
}

export function SimpleStudentPage({ title, description }) {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader eyebrow={t('student.cabinetEyebrow')} title={title} description={description} />
      <div className="panel empty-state">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </>
  );
}
