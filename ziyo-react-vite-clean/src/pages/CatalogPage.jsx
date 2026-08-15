import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import CourseGrid from '../components/CourseGrid.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SeoHead from '../components/SeoHead.jsx';
import { categories, levels } from '../data/courses.js';
import { useApp } from '../store/appStore.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getAverageRating, getEffectivePrice, getLessonCount } from '../utils/courseHelpers.js';

export default function CatalogPage() {
  const { courses } = useApp((state) => ({ courses: state.courses }));
  const { t, translateCategory, translateLevel } = useLanguage();
  const { category: categoryParam } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [activeCategory, setActiveCategory] = useState(categoryParam ?? 'Все');
  const [activeLevels, setActiveLevels] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [sort, setSort] = useState('newest');

  const SORTS = [
    { value: 'newest', label: t('catalog.sortNewest') },
    { value: 'price-asc', label: t('catalog.sortPriceAsc') },
    { value: 'price-desc', label: t('catalog.sortPriceDesc') },
    { value: 'rating', label: t('catalog.sortRating') },
    { value: 'lessons', label: t('catalog.sortLessons') },
  ];

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
      <SeoHead title={t('catalog.title')} description={t('catalog.description')} />
      <PageHeader
        eyebrow={query ? t('catalog.resultsFor', { query }) : t('catalog.coursesCount', { count: filteredCourses.length })}
        title={t('catalog.title')}
        description={t('catalog.description')}
      />
      <div className="chips">
        {categories.map((category) => (
          <button
            key={category}
            className={activeCategory === category ? 'active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            {translateCategory(category)}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <div className="filter-field filter-field--checks">
          {levels.map((level) => (
            <label key={level}>
              <input type="checkbox" checked={activeLevels.includes(level)} onChange={() => toggleLevel(level)} />
              {translateLevel(level)}
            </label>
          ))}
        </div>
        <label className="filter-field">{t('catalog.priceFrom')}<input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} style={{ width: 90 }} /></label>
        <label className="filter-field">{t('catalog.priceTo')}<input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} style={{ width: 90 }} /></label>
        <label className="filter-field">{t('catalog.ratingFrom')}
          <select value={minRating} onChange={(event) => setMinRating(event.target.value)}>
            <option value="0">{t('catalog.ratingAny')}</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
          </select>
        </label>
        <label className="filter-field">{t('catalog.sortLabel')}
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            {SORTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="panel empty-state">
          <h2>{courses.length === 0 ? t('home.noCourses') : t('catalog.nothingFound')}</h2>
          <p>{courses.length === 0 ? t('home.beFirstInstructor') : t('catalog.tryDifferentFilters')}</p>
          {courses.length === 0 && <Link className="button button--primary" to="/instructor/create">{t('common.createCourse')}</Link>}
        </div>
      ) : (
        <CourseGrid courses={filteredCourses} />
      )}
    </>
  );
}
