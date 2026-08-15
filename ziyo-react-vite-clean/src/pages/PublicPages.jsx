import { Link, useNavigate, useParams } from 'react-router-dom';
import CourseGrid from '../components/CourseGrid.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import { useApp } from '../store/appStore.js';
import { useLanguage } from '../context/LanguageContext.jsx';

function getInstructors(courses) {
  const byName = new Map();
  courses.forEach((course) => {
    if (!byName.has(course.teacher)) byName.set(course.teacher, course);
  });
  return [...byName.values()];
}

export function InstructorsPage() {
  const { courses } = useApp((state) => ({ courses: state.courses }));
  const { t } = useLanguage();
  const instructors = getInstructors(courses);

  return (
    <>
      <PageHeader eyebrow={t('publicPages.expertsEyebrow')} title={t('publicPages.instructorsTitle')} description={t('publicPages.instructorsDescription')} />
      {instructors.length === 0 ? (
        <div className="panel empty-state">
          <h2>{t('publicPages.noInstructorsTitle')}</h2>
          <p>{t('publicPages.noInstructorsDescription')}</p>
          <Link className="button button--primary" to="/instructor/create">{t('common.createCourse')}</Link>
        </div>
      ) : (
        <div className="people-grid">
          {instructors.map((course) => (
            <Link key={course.id} to={`/instructors/${course.id}`} className="person-card panel">
              <div className={`person-card__avatar preview--${course.tone}`}>{course.teacher[0]}</div>
              <h3>{course.teacher}</h3><p>{course.category}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export function InstructorProfilePage() {
  const { instructorId } = useParams();
  const { courses, subscribedInstructorIds, toggleSubscribe } = useApp((state) => ({
    courses: state.courses, subscribedInstructorIds: state.subscribedInstructorIds, toggleSubscribe: state.toggleSubscribe,
  }));
  const { t } = useLanguage();
  const id = Number(instructorId);
  const anchorCourse = courses.find((course) => course.id === id);

  if (!anchorCourse) {
    return (
      <div className="panel empty-state">
        <h2>{t('publicPages.instructorNotFoundTitle')}</h2>
        <Link className="button button--primary" to="/instructors">{t('publicPages.allInstructors')}</Link>
      </div>
    );
  }

  const teacherCourses = courses.filter((course) => course.teacher === anchorCourse.teacher);
  const subscribed = subscribedInstructorIds.includes(id);

  return (
    <>
      <section className="profile-hero panel">
        <div className={`person-card__avatar preview--${anchorCourse.tone}`}>{anchorCourse.teacher[0]}</div>
        <div><span className="eyebrow">{t('publicPages.instructorEyebrow')}</span><h1>{anchorCourse.teacher}</h1><p>{t('publicPages.coursesOnPlatform', { count: teacherCourses.length })}</p></div>
        <Button variant={subscribed ? 'secondary' : 'primary'} onClick={() => toggleSubscribe(id)}>{subscribed ? t('publicPages.subscribed') : t('publicPages.subscribe')}</Button>
      </section>
      <section className="section"><div className="section__header"><h2>{t('publicPages.instructorCoursesTitle')}</h2></div><CourseGrid courses={teacherCourses} /></section>
    </>
  );
}

export function MarketingPage({ title, description, cta, ctaTo = '/register' }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const features = [
    t('publicPages.feature1'), t('publicPages.feature2'), t('publicPages.feature3'),
    t('publicPages.feature4'), t('publicPages.feature5'), t('publicPages.feature6'),
  ];
  return (
    <>
      <section className="marketing-hero panel"><span className="eyebrow">{t('publicPages.ziyoEyebrow')}</span><h1>{title}</h1><p>{description}</p><Button onClick={() => navigate(ctaTo)}>{cta ?? t('publicPages.defaultCta')}</Button></section>
      <section className="section"><div className="feature-grid">{features.map((item) => <div className="panel" key={item}><h3>{item}</h3><p>{t('publicPages.featureCardDescription')}</p></div>)}</div></section>
    </>
  );
}

export function BlogPage() {
  const { courses } = useApp((state) => ({ courses: state.courses }));
  const { t } = useLanguage();
  return (
    <>
      <PageHeader eyebrow={t('publicPages.materialsEyebrow')} title={t('publicPages.blogTitle')} description={t('publicPages.blogDescription')} />
      {courses.length === 0 ? (
        <div className="panel empty-state">
          <h2>{t('publicPages.noArticlesTitle')}</h2>
          <p>{t('publicPages.noArticlesDescription')}</p>
        </div>
      ) : <CourseGrid courses={courses} />}
    </>
  );
}
