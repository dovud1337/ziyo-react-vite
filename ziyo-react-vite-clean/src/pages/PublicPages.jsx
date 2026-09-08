import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CourseGrid from '../components/CourseGrid.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import SeoHead from '../components/SeoHead.jsx';
import { useApp } from '../store/appStore.js';
import { useLanguage } from '../context/LanguageContext.jsx';

function getInstructors(courses) {
  const byName = new Map();
  courses.forEach((course) => {
    if (!byName.has(course.teacherId)) byName.set(course.teacherId, course);
  });
  return [...byName.values()];
}

export function InstructorsPage() {
  const { courses } = useApp((state) => ({ courses: state.courses }));
  const { t } = useLanguage();
  const instructors = getInstructors(courses);

  return (
    <>
      <SeoHead title={t('publicPages.instructorsTitle')} description={t('publicPages.instructorsDescription')} />
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
            <Link key={course.teacherId} to={`/instructors/${course.teacherId}`} className="person-card panel">
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
  const { courses, coursesLoaded, user, subscribedInstructorIds, toggleSubscribe } = useApp((state) => ({
    courses: state.courses, coursesLoaded: state.coursesLoaded, user: state.user, subscribedInstructorIds: state.subscribedInstructorIds, toggleSubscribe: state.toggleSubscribe,
  }));
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const anchorCourse = courses.find((course) => course.teacherId === instructorId)
    ?? courses.find((course) => course.id === Number(instructorId));

  if (!coursesLoaded) return <div className="panel empty-state">{t('common.loading')}</div>;

  if (!anchorCourse) {
    return (
      <div className="panel empty-state">
        <h2>{t('publicPages.instructorNotFoundTitle')}</h2>
        <Link className="button button--primary" to="/instructors">{t('publicPages.allInstructors')}</Link>
      </div>
    );
  }

  const id = anchorCourse.teacherId;
  const teacherCourses = courses.filter((course) => course.teacherId === id);
  const subscribed = subscribedInstructorIds.includes(id);
  const handleSubscribe = async () => {
    if (!user) { navigate('/login', { state: { from: `/instructors/${id}` } }); return; }
    setPending(true);
    setError('');
    try { await toggleSubscribe(id); }
    catch (err) { setError(err.message ?? t('auth.genericError')); }
    finally { setPending(false); }
  };

  return (
    <>
      <SeoHead title={anchorCourse.teacher} description={t('publicPages.coursesOnPlatform', { count: teacherCourses.length })} />
      <section className="profile-hero panel">
        <div className={`person-card__avatar preview--${anchorCourse.tone}`}>{anchorCourse.teacher[0]}</div>
        <div><span className="eyebrow">{t('publicPages.instructorEyebrow')}</span><h1>{anchorCourse.teacher}</h1><p>{t('publicPages.coursesOnPlatform', { count: teacherCourses.length })}</p></div>
        <Button disabled={pending} variant={subscribed ? 'secondary' : 'primary'} onClick={handleSubscribe}>{subscribed ? t('publicPages.subscribed') : t('publicPages.subscribe')}</Button>
        {error && <p role="alert">{error}</p>}
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
      <SeoHead title={title} description={description} />
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
      <SeoHead title={t('publicPages.blogTitle')} description={t('publicPages.blogDescription')} />
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
