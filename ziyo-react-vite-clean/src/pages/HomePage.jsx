import { Link } from 'react-router-dom';
import CourseGrid from '../components/CourseGrid.jsx';
import SeoHead from '../components/SeoHead.jsx';
import Footer from '../components/Footer.jsx';
import CategoryIcon from '../components/icons/CategoryIcon.jsx';
import { categories } from '../data/courses.js';
import { useApp } from '../store/appStore.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getLessonCount } from '../utils/courseHelpers.js';

export default function HomePage() {
  const { courses, enrollments, coursesLoaded, coursesError, refreshCourses } = useApp((state) => ({
    courses: state.courses,
    enrollments: state.enrollments,
    coursesLoaded: state.coursesLoaded,
    coursesError: state.coursesError,
    refreshCourses: state.refreshCourses,
  }));
  const { t, translateCategory } = useLanguage();
  const enrolledIds = Object.keys(enrollments).map(Number);
  const activeCourses = courses.filter((course) => enrolledIds.includes(course.id));
  const teacherCount = new Set(courses.map((course) => course.teacher)).size;
  const lessonCount = courses.reduce((sum, course) => sum + getLessonCount(course), 0);

  if (!coursesLoaded) {
    return <div className="panel empty-state"><h2>{t('common.loading')}</h2></div>;
  }

  if (coursesError && courses.length === 0) {
    return (
      <div className="panel empty-state">
        <h2>{t('common.loadErrorTitle')}</h2>
        <p>{coursesError}</p>
        <button type="button" className="button button--primary" onClick={() => refreshCourses().catch(() => {})}>{t('common.retry')}</button>
      </div>
    );
  }

  return (
    <>
      <SeoHead />
      <section className="compact-hero">
        <div className="hero-copy">
          <span className="eyebrow">{t('home.badge')}</span>
          <h1>{t('home.title')}</h1>
          <p>{t('home.subtitle')}</p>
          <div className="hero-actions">
            <Link className="button button--primary" to="/catalog">{t('home.viewCourses')} <span aria-hidden="true">↗</span></Link>
            <Link className="button button--secondary" to="/teach">{t('home.becomeInstructor')}</Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="learning-tile learning-tile--code"><span>01 / {translateCategory('Программирование')}</span><CategoryIcon category="Программирование" size={40} /></div>
          <div className="learning-tile learning-tile--design"><span>02 / {translateCategory('Дизайн')}</span><CategoryIcon category="Дизайн" size={40} /></div>
          <div className="learning-tile learning-tile--language"><span>03 / {translateCategory('Языки')}</span><strong>Салом<span> / Hello</span></strong></div>
          <span className="art-signature">NOOR — {t('home.badge')}</span>
        </div>
      </section>
        <div className="hero-metrics">
          <div><strong>{courses.length}</strong><span>{t('home.metricCourses')}</span></div>
          <div><strong>{teacherCount}</strong><span>{t('home.metricInstructors')}</span></div>
          <div><strong>{lessonCount}</strong><span>{t('home.metricLessons')}</span></div>
          <div><strong>{activeCourses.length}</strong><span>{t('home.metricYourCourses')}</span></div>
        </div>

      <div className="chips">
        {categories.map((category, index) => (
          <Link className={index === 0 ? 'active' : ''} key={category} to={category === 'Все' ? '/catalog' : `/category/${encodeURIComponent(category)}`}>
            {translateCategory(category)}
          </Link>
        ))}
      </div>

      <section className="section">
        <div className="section__header">
          <div><span className="eyebrow">NOOR / {t('nav.catalog')}</span><h2>{t('home.nowOnPlatform')}</h2></div>
          <Link to="/catalog">{t('home.openCatalog')}</Link>
        </div>
        {courses.length > 0 ? (
          <CourseGrid courses={courses} limit={8} />
        ) : (
          <div className="panel empty-state">
            <h2>{t('home.noCourses')}</h2>
            <p>{t('home.beFirstInstructor')}</p>
            <Link className="button button--primary" to="/instructor/create">{t('common.createCourse')}</Link>
          </div>
        )}
      </section>

      {activeCourses.length > 0 && (
        <section className="section">
          <div className="section__header"><h2>{t('home.continueLearning')}</h2></div>
          <CourseGrid courses={activeCourses} showProgress enrollments={enrollments} limit={4} />
        </section>
      )}

      <section className="instructor-cta">
        <div>
          <h2>{t('home.instructorCtaTitle')}</h2>
          <p>{t('home.instructorCtaText')}</p>
        </div>
        <Link className="button button--primary" to="/teach">{t('home.instructorCtaButton')}</Link>
      </section>

      <Footer />
    </>
  );
}
