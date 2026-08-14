import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Button from '../components/Button.jsx';
import CourseGrid from '../components/CourseGrid.jsx';
import { useApp } from '../context/AppContext.jsx';
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
  const { courses, instructorCourseIds } = useApp();
  const myCourses = courses.filter((course) => instructorCourseIds.includes(course.id));
  const totalReviews = myCourses.reduce((sum, course) => sum + getReviewCount(course), 0);
  const ratings = myCourses.map(getAverageRating).filter((rating) => rating != null);
  const avgRating = ratings.length > 0 ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null;
  const totalLessons = myCourses.reduce((sum, course) => sum + getLessonCount(course), 0);

  return (
    <>
      <PageHeader eyebrow="Студия преподавателя" title="Обзор" description="Управляйте курсами, студентами и доходами." action={<Button onClick={() => navigate('/instructor/create')}>Создать курс</Button>} />
      <div className="stats-grid">
        <StatCard value={String(myCourses.length)} label="курсов" />
        <StatCard value={String(totalLessons)} label="уроков создано" />
        <StatCard value={String(totalReviews)} label="отзывов получено" />
        <StatCard value={avgRating != null ? String(avgRating) : '—'} label="средний рейтинг" />
      </div>
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>Курс</th><th>Уроков</th><th>Рейтинг</th><th>Цена</th></tr></thead>
          <tbody>
            {myCourses.length === 0 ? (
              <tr><td colSpan={4}>Вы ещё не создали ни одного курса.</td></tr>
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
  const { addCourse } = useApp();
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
    if (!title.trim()) { setError('Укажите название курса.'); return; }
    if (!price || Number(price) <= 0) { setError('Укажите цену курса.'); return; }
    const cleanSections = sections
      .map((section) => ({
        ...section,
        lessons: section.lessons.filter((lesson) => lesson.title.trim()),
      }))
      .filter((section) => section.title.trim() && section.lessons.length > 0);
    if (cleanSections.length === 0) {
      setError('Добавьте хотя бы один раздел с уроком (укажите названия).');
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
      setError(err.message ?? 'Не удалось сохранить курс. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Студия" title="Создание курса" description="Заполните основные данные и программу курса." />
      <form className="panel form" onSubmit={handleSubmit}>
        {error && <p style={{ color: '#c0392b' }}>{error}</p>}
        <label>Название курса<input required placeholder="Например: React с нуля" value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label>Категория<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.filter((c) => c !== 'Все').map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Уровень<select value={level} onChange={(event) => setLevel(event.target.value)}>{levels.map((l) => <option key={l}>{l}</option>)}</select></label>
        <label>Цена, TJS<input required type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} /></label>
        <label>Цена со скидкой, TJS (необязательно)<input type="number" min="0" value={discountPrice} onChange={(event) => setDiscountPrice(event.target.value)} /></label>
        <label>Описание<textarea rows="4" value={description} onChange={(event) => setDescription(event.target.value)} /></label>

        <h2>Программа курса</h2>
        <div className="curriculum-editor">
          {sections.map((section) => (
            <div className="curriculum-section" key={section.id}>
              <div className="curriculum-section__header">
                <input
                  placeholder="Название раздела"
                  value={section.title}
                  onChange={(event) => updateSection(section.id, { title: event.target.value })}
                />
                <Button type="button" variant="secondary" onClick={() => removeSection(section.id)}>Удалить раздел</Button>
              </div>
              {section.lessons.map((lesson) => (
                <div className="curriculum-lesson" key={lesson.id}>
                  <div className="curriculum-lesson__row">
                    <input
                      type="text"
                      placeholder="Название урока"
                      value={lesson.title}
                      onChange={(event) => updateLesson(section.id, lesson.id, { title: event.target.value })}
                    />
                    <Button type="button" variant="secondary" onClick={() => removeLesson(section.id, lesson.id)}>Удалить</Button>
                  </div>
                  <div className="curriculum-lesson__type">
                    <label><input type="radio" checked={lesson.type === 'article'} onChange={() => updateLesson(section.id, lesson.id, { type: 'article' })} /> Статья</label>
                    <label><input type="radio" checked={lesson.type === 'video'} onChange={() => updateLesson(section.id, lesson.id, { type: 'video' })} /> Видео</label>
                  </div>
                  {lesson.type === 'video' && (
                    <input
                      placeholder="Ссылка на видео (embed URL)"
                      value={lesson.videoUrl}
                      onChange={(event) => updateLesson(section.id, lesson.id, { videoUrl: event.target.value })}
                    />
                  )}
                  <textarea
                    rows="2"
                    placeholder="Текст урока / заметки"
                    value={lesson.content}
                    onChange={(event) => updateLesson(section.id, lesson.id, { content: event.target.value })}
                  />
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={() => addLesson(section.id)}>+ Добавить урок</Button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addSection}>+ Добавить раздел</Button>
        </div>

        <Button type="submit" disabled={submitting}>{submitting ? 'Сохраняем…' : 'Сохранить курс'}</Button>
      </form>
    </>
  );
}

export function InstructorCoursesPage() {
  const { courses, instructorCourseIds } = useApp();
  const myCourses = courses.filter((course) => instructorCourseIds.includes(course.id));

  return (
    <>
      <PageHeader eyebrow="Студия преподавателя" title="Мои курсы" description="Управляйте опубликованными и черновыми курсами." />
      {myCourses.length > 0 ? (
        <CourseGrid courses={myCourses} />
      ) : (
        <div className="panel empty-state">
          <h2>Вы ещё не создали курсы</h2>
          <p>Нажмите «Создать курс», чтобы опубликовать первую программу.</p>
          <Link className="button button--primary" to="/instructor/create">Создать курс</Link>
        </div>
      )}
    </>
  );
}

export function SimpleInstructorPage({ title, description }) {
  return <><PageHeader eyebrow="Студия преподавателя" title={title} description={description} /><div className="panel empty-state"><h2>{title}</h2><p>{description}</p></div></>;
}
