import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Button from '../components/Button.jsx';
import CourseGrid from '../components/CourseGrid.jsx';
import { useApp } from '../store/appStore.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { categories, levels } from '../data/courses.js';
import { getAverageRating, getLessonCount, getReviewCount } from '../utils/courseHelpers.js';

let localId = 0;
const nextLocalId = () => { localId += 1; return localId; };

function emptyLesson() {
  return { id: nextLocalId(), title: '', type: 'article', content: '', videoUrl: '' };
}

function emptySection() {
  return { id: nextLocalId(), title: '', lessons: [emptyLesson()] };
}

export function InstructorDashboardPage() {
  const navigate = useNavigate();
  const { courses, instructorCourseIds } = useApp((state) => ({
    courses: state.courses, instructorCourseIds: state.instructorCourseIds,
  }));
  const { t } = useLanguage();
  const myCourses = courses.filter((course) => instructorCourseIds.includes(course.id));
  const totalReviews = myCourses.reduce((sum, course) => sum + getReviewCount(course), 0);
  const ratings = myCourses.map(getAverageRating).filter((rating) => rating != null);
  const avgRating = ratings.length > 0 ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null;
  const totalLessons = myCourses.reduce((sum, course) => sum + getLessonCount(course), 0);

  return (
    <>
      <PageHeader eyebrow={t('instructor.studioEyebrow')} title={t('instructor.overview')} description={t('instructor.manageDescription')} action={<Button onClick={() => navigate('/instructor/create')}>{t('common.createCourse')}</Button>} />
      <div className="stats-grid">
        <StatCard value={String(myCourses.length)} label={t('instructor.statCourses')} />
        <StatCard value={String(totalLessons)} label={t('instructor.statLessonsCreated')} />
        <StatCard value={String(totalReviews)} label={t('instructor.statReviewsReceived')} />
        <StatCard value={avgRating != null ? String(avgRating) : '—'} label={t('instructor.statAvgRating')} />
      </div>
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>{t('admin.courseColumn')}</th><th>{t('instructor.lessonsColumn')}</th><th>{t('admin.ratingColumn')}</th><th>{t('instructor.priceColumn')}</th></tr></thead>
          <tbody>
            {myCourses.length === 0 ? (
              <tr><td colSpan={4}>{t('instructor.noCoursesCreated')}</td></tr>
            ) : myCourses.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>{getLessonCount(course)}</td>
                <td>{getAverageRating(course) ?? '—'}</td>
                <td>{course.discountPrice ?? course.price} TJS</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function CreateCoursePage() {
  const navigate = useNavigate();
  const { addCourse } = useApp((state) => ({ addCourse: state.addCourse }));
  const { t, translateCategory, translateLevel } = useLanguage();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[1]);
  const [level, setLevel] = useState(levels[0]);
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState([emptySection()]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateSection = (sectionId, patch) => {
    setSections((prev) => prev.map((section) => (section.id === sectionId ? { ...section, ...patch } : section)));
  };

  const updateLesson = (sectionId, lessonId, patch) => {
    setSections((prev) => prev.map((section) => (
      section.id !== sectionId ? section : {
        ...section,
        lessons: section.lessons.map((lesson) => (lesson.id === lessonId ? { ...lesson, ...patch } : lesson)),
      }
    )));
  };

  const addSection = () => setSections((prev) => [...prev, emptySection()]);
  const removeSection = (sectionId) => setSections((prev) => prev.filter((section) => section.id !== sectionId));
  const addLesson = (sectionId) => setSections((prev) => prev.map((section) => (
    section.id === sectionId ? { ...section, lessons: [...section.lessons, emptyLesson()] } : section
  )));
  const removeLesson = (sectionId, lessonId) => setSections((prev) => prev.map((section) => (
    section.id === sectionId ? { ...section, lessons: section.lessons.filter((lesson) => lesson.id !== lessonId) } : section
  )));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!title.trim()) { setError(t('instructor.errorTitleRequired')); return; }
    if (!price || Number(price) <= 0) { setError(t('instructor.errorPriceRequired')); return; }
    const cleanSections = sections
      .map((section) => ({
        ...section,
        lessons: section.lessons.filter((lesson) => lesson.title.trim()),
      }))
      .filter((section) => section.title.trim() && section.lessons.length > 0);
    if (cleanSections.length === 0) {
      setError(t('instructor.errorSectionRequired'));
      return;
    }
    setSubmitting(true);
    try {
      await addCourse({
        title: title.trim(),
        category,
        level,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        description: description.trim(),
        sections: cleanSections,
      });
      navigate('/instructor/courses');
    } catch (err) {
      setError(err.message ?? t('instructor.errorSaveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow={t('instructor.studioEyebrow')} title={t('instructor.createCourseTitle')} description={t('instructor.createCourseDescription')} />
      <form className="panel form" onSubmit={handleSubmit}>
        {error && <p style={{ color: '#c0392b' }}>{error}</p>}
        <label>{t('instructor.courseNameLabel')}<input required placeholder={t('instructor.courseNamePlaceholder')} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label>{t('instructor.categoryLabel')}<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.filter((c) => c !== 'Все').map((c) => <option key={c} value={c}>{translateCategory(c)}</option>)}</select></label>
        <label>{t('instructor.levelLabel')}<select value={level} onChange={(event) => setLevel(event.target.value)}>{levels.map((l) => <option key={l} value={l}>{translateLevel(l)}</option>)}</select></label>
        <label>{t('instructor.priceLabel')}<input required type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} /></label>
        <label>{t('instructor.discountPriceLabel')}<input type="number" min="0" value={discountPrice} onChange={(event) => setDiscountPrice(event.target.value)} /></label>
        <label>{t('instructor.descriptionLabel')}<textarea rows="4" value={description} onChange={(event) => setDescription(event.target.value)} /></label>

        <h2>{t('instructor.curriculumTitle')}</h2>
        <div className="curriculum-editor">
          {sections.map((section) => (
            <div className="curriculum-section" key={section.id}>
              <div className="curriculum-section__header">
                <input
                  placeholder={t('instructor.sectionNamePlaceholder')}
                  value={section.title}
                  onChange={(event) => updateSection(section.id, { title: event.target.value })}
                />
                <Button type="button" variant="secondary" onClick={() => removeSection(section.id)}>{t('instructor.removeSection')}</Button>
              </div>
              {section.lessons.map((lesson) => (
                <div className="curriculum-lesson" key={lesson.id}>
                  <div className="curriculum-lesson__row">
                    <input
                      type="text"
                      placeholder={t('instructor.lessonNamePlaceholder')}
                      value={lesson.title}
                      onChange={(event) => updateLesson(section.id, lesson.id, { title: event.target.value })}
                    />
                    <Button type="button" variant="secondary" onClick={() => removeLesson(section.id, lesson.id)}>{t('instructor.removeLesson')}</Button>
                  </div>
                  <div className="curriculum-lesson__type">
                    <label><input type="radio" checked={lesson.type === 'article'} onChange={() => updateLesson(section.id, lesson.id, { type: 'article' })} /> {t('instructor.article')}</label>
                    <label><input type="radio" checked={lesson.type === 'video'} onChange={() => updateLesson(section.id, lesson.id, { type: 'video' })} /> {t('instructor.video')}</label>
                  </div>
                  {lesson.type === 'video' && (
                    <input
                      placeholder={t('instructor.videoLinkPlaceholder')}
                      value={lesson.videoUrl}
                      onChange={(event) => updateLesson(section.id, lesson.id, { videoUrl: event.target.value })}
                    />
                  )}
                  <textarea
                    rows="2"
                    placeholder={t('instructor.lessonContentPlaceholder')}
                    value={lesson.content}
                    onChange={(event) => updateLesson(section.id, lesson.id, { content: event.target.value })}
                  />
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={() => addLesson(section.id)}>{t('instructor.addLesson')}</Button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addSection}>{t('instructor.addSection')}</Button>
        </div>

        <Button type="submit" disabled={submitting}>{submitting ? t('instructor.saving') : t('instructor.saveCourse')}</Button>
      </form>
    </>
  );
}

export function InstructorCoursesPage() {
  const { courses, instructorCourseIds } = useApp((state) => ({
    courses: state.courses, instructorCourseIds: state.instructorCourseIds,
  }));
  const { t } = useLanguage();
  const myCourses = courses.filter((course) => instructorCourseIds.includes(course.id));

  return (
    <>
      <PageHeader eyebrow={t('instructor.studioEyebrow')} title={t('instructor.myCoursesTitle')} description={t('instructor.myCoursesDescription')} />
      {myCourses.length > 0 ? (
        <CourseGrid courses={myCourses} />
      ) : (
        <div className="panel empty-state">
          <h2>{t('instructor.noCoursesCreatedTitle')}</h2>
          <p>{t('instructor.noCoursesCreatedDescription')}</p>
          <Link className="button button--primary" to="/instructor/create">{t('common.createCourse')}</Link>
        </div>
      )}
    </>
  );
}

export function SimpleInstructorPage({ title, description }) {
  const { t } = useLanguage();
  return <><PageHeader eyebrow={t('instructor.studioEyebrow')} title={title} description={description} /><div className="panel empty-state"><h2>{title}</h2><p>{description}</p></div></>;
}
