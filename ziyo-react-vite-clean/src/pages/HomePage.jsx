import { Link } from 'react-router-dom';
import CourseGrid from '../components/CourseGrid.jsx';
import SeoHead from '../components/SeoHead.jsx';
import { categories } from '../data/courses.js';
import { useApp } from '../store/appStore.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getLessonCount } from '../utils/courseHelpers.js';

export default function HomePage() {
  const { courses, enrollments } = useApp((state) => ({ courses: state.courses, enrollments: state.enrollments }));
  const { t, translateCategory } = useLanguage();
  const enrolledIds = Object.keys(enrollments).map(Number);
  const activeCourses = courses.filter((course) => enrolledIds.includes(course.id));
  const teacherCount = new Set(courses.map((course) => course.teacher)).size;
  const lessonCount = courses.reduce((sum, course) => sum + getLessonCount(course), 0);

  return (
    <>
      <SeoHead />
      <section className="compact-hero">
        <div>
          <span className="eyebrow">{t('home.badge')}</span>
          <h1>{t('home.title')}</h1>
          <p>{t('home.subtitle')}</p>
          <div className="hero-actions">
            <Link className="button button--primary" to="/catalog">{t('home.viewCourses')}</Link>
            <Link className="button button--secondary" to="/teach">{t('home.becomeInstructor')}</Link>
          </div>
        </div>
        <div className="hero-metrics">
          <div><strong>{courses.length}</strong><span>{t('home.metricCourses')}</span></div>
          <div><strong>{teacherCount}</strong><span>{t('home.metricInstructors')}</span></div>
          <div><strong>{lessonCount}</strong><span>{t('home.metricLessons')}</span></div>
          <div><strong>{activeCourses.length}</strong><span>{t('home.metricYourCourses')}</span></div>
        </div>
      </section>

      <div className="chips">
        {categories.map((category) => (
          <Link key={category} to={category === 'Все' ? '/catalog' : `/category/${encodeURIComponent(category)}`}>
            {translateCategory(category)}
          </Link>
        ))}
      </div>

      <section className="section">
        <div className="section__header">
          <h2>{t('home.nowOnPlatform')}</h2>
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
    </>
  );
}
