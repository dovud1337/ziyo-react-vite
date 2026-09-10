import { useEffect, useState } from 'react';
import { useApp } from '../store/appStore.js';
import { isCourseDetailLoaded } from '../utils/courseHelpers.js';

export default function useCourseDetail(courseId) {
  const fetchCourseDetail = useApp((state) => state.fetchCourseDetail);
  const cached = useApp((state) => {
    const course = state.courses.find((item) => item.id === Number(courseId));
    return Boolean(course && isCourseDetailLoaded(course));
  });
  const [result, setResult] = useState({ courseId: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setResult({ courseId, loading: true, error: null });
    fetchCourseDetail(Number(courseId)).then(
      () => { if (active) setResult({ courseId, loading: false, error: null }); },
      (error) => { if (active) setResult({ courseId, loading: false, error }); },
    );
    return () => { active = false; };
  }, [courseId, fetchCourseDetail, attempt]);

  return {
    loading: cached ? false : (result.courseId !== courseId || result.loading),
    error: result.courseId === courseId ? result.error : null,
    retry: () => setAttempt((value) => value + 1),
  };
}
