import CourseCard from './CourseCard.jsx';
import { getCourseProgress } from '../utils/courseHelpers.js';

export default function CourseGrid({ courses, showProgress = false, enrollments = {}, limit }) {
  const visibleCourses = typeof limit === 'number' ? courses.slice(0, limit) : courses;

  return (
    <div className="course-grid">
      {visibleCourses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          showProgress={showProgress}
          progress={getCourseProgress(course, enrollments[course.id])}
        />
      ))}
    </div>
  );
}
