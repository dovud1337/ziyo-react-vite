import { useState } from 'react';
import CourseGrid from '../components/CourseGrid.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { categories, courses } from '../data/courses.js';

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState('Все');
  const filteredCourses = activeCategory === 'Все'
    ? courses
    : courses.filter((course) => course.category === activeCategory);

  return (
    <>
      <PageHeader
        eyebrow="612 курсов"
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
      <CourseGrid courses={filteredCourses} />
    </>
  );
}
