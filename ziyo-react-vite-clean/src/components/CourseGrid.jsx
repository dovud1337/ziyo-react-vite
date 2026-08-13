import CourseCard from './CourseCard.jsx';

export default function CourseGrid({ courses, showProgress = false, limit }) {
  const visibleCourses = typeof limit === 'number' ? courses.slice(0, limit) : courses;

  return (
    <div className="course-grid">
      {visibleCourses.map((course, index) => (
        <CourseCard
          key={course.id}
          course={course}
          showProgress={showProgress}
          progress={45 + (index % 4) * 12}
        />
      ))}
    </div>
  );
}
