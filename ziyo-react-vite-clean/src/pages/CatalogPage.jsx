import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import CourseGrid from '../components/CourseGrid.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { categories, levels } from '../data/courses.js';
import { useApp } from '../context/AppContext.jsx';
import { getAverageRating, getEffectivePrice, getLessonCount } from '../utils/courseHelpers.js';

const SORTS = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'lessons', label: 'По количеству уроков' },
];

export default function CatalogPage() {
  const { courses } = useApp();
  const { category: categoryParam } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [activeCategory, setActiveCategory] = useState(categoryParam ?? 'Все');
  const [activeLevels, setActiveLevels] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    setActiveCategory(categoryParam ?? 'Все');
  }, [categoryParam]);

  const toggleLevel = (level) => {
    setActiveLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]));
  };

  const filteredCourses = useMemo(() => {
    let list = activeCategory === 'Все' ? courses : courses.filter((course) => course.category === activeCategory);

    if (query) {
      const needle = query.toLowerCase();
      list = list.filter((course) => `${course.title} ${course.teacher} ${course.category}`.toLowerCase().includes(needle));
    }
    if (activeLevels.length > 0) {
      list = list.filter((course) => activeLevels.includes(course.level));
    }
    if (minPrice) {
      list = list.filter((course) => getEffectivePrice(course) >= Number(minPrice));
    }
    if (maxPrice) {
      list = list.filter((course) => getEffectivePrice(course) <= Number(maxPrice));
    }
    if (Number(minRating) > 0) {
      list = list.filter((course) => (getAverageRating(course) ?? 0) >= Number(minRating));
    }

    const sorted = [...list];
    switch (sort) {
      case 'price-asc': sorted.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b)); break;
      case 'price-desc': sorted.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a)); break;
      case 'rating': sorted.sort((a, b) => (getAverageRating(b) ?? 0) - (getAverageRating(a) ?? 0)); break;
      case 'lessons': sorted.sort((a, b) => getLessonCount(b) - getLessonCount(a)); break;
      default: sorted.sort((a, b) => b.id - a.id);
    }
    return sorted;
  }, [courses, activeCategory, query, activeLevels, minPrice, maxPrice, minRating, sort]);

  return (
    <>
      <PageHeader
        eyebrow={query ? `Результаты по «${query}»` : `${filteredCourses.length} курсов`}
        title="Каталог"
        description="Выберите направление, уровень и формат обучения."
      />
      <div className="chips">
        {categories.map((category) => (
          <button
            key={category}
            className={activeCategory === category ? 'active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <div className="filter-field filter-field--checks">
          {levels.map((level) => (
            <label key={level}>
              <input type="checkbox" checked={activeLevels.includes(level)} onChange={() => toggleLevel(level)} />
              {level}
            </label>
          ))}
        </div>
        <label className="filter-field">Цена от<input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} style={{ width: 90 }} /></label>
        <label className="filter-field">Цена до<input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} style={{ width: 90 }} /></label>
        <label className="filter-field">Рейтинг от
          <select value={minRating} onChange={(event) => setMinRating(event.target.value)}>
            <option value="0">Любой</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
          </select>
        </label>
        <label className="filter-field">Сортировка
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            {SORTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="panel empty-state">
          <h2>{courses.length === 0 ? 'Курсов пока нет' : 'Ничего не найдено'}</h2>
          <p>{courses.length === 0 ? 'Станьте первым преподавателем на платформе.' : 'Попробуйте изменить фильтры или запрос поиска.'}</p>
          {courses.length === 0 && <Link className="button button--primary" to="/instructor/create">Создать курс</Link>}
        </div>
      ) : (
        <CourseGrid courses={filteredCourses} />
      )}
    </>
  );
}
