import { createContext, useContext, useEffect, useState } from 'react';
import { tones } from '../data/courses.js';

const STORAGE_KEY = 'ziyo_state_v2';

const defaultState = {
  user: null,
  courses: [],
  cartIds: [],
  enrollments: {},
  wishlistIds: [],
  subscribedInstructorIds: [],
  instructorCourseIds: [],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw), user: null };
  } catch {
    return defaultState;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, user: null }));
  }, [state]);

  const updateCourse = (id, updater) => setState((prev) => ({
    ...prev,
    courses: prev.courses.map((course) => (course.id === id ? updater(course) : course)),
  }));

  const login = (email) => {
    const name = email.split('@')[0] || 'Студент';
    setState((prev) => ({ ...prev, user: { name, email } }));
  };

  const register = (name, email) => {
    setState((prev) => ({ ...prev, user: { name: name || email.split('@')[0], email } }));
  };

  const logout = () => setState((prev) => ({ ...prev, user: null }));

  const addToCart = (id) => setState((prev) => (
    prev.cartIds.includes(id) ? prev : { ...prev, cartIds: [...prev.cartIds, id] }
  ));

  const removeFromCart = (id) => setState((prev) => ({
    ...prev, cartIds: prev.cartIds.filter((cartId) => cartId !== id),
  }));

  const enrollCartItems = () => {
    const enrolledCourses = state.courses.filter((course) => state.cartIds.includes(course.id));
    setState((prev) => {
      const enrollments = { ...prev.enrollments };
      prev.cartIds.forEach((id) => {
        if (!enrollments[id]) {
          enrollments[id] = { enrolledAt: Date.now(), completedLessonIds: [] };
        }
      });
      return { ...prev, enrollments, cartIds: [] };
    });
    return enrolledCourses;
  };

  const toggleLessonComplete = (courseId, lessonId) => setState((prev) => {
    const enrollment = prev.enrollments[courseId];
    if (!enrollment) return prev;
    const completedLessonIds = enrollment.completedLessonIds.includes(lessonId)
      ? enrollment.completedLessonIds.filter((id) => id !== lessonId)
      : [...enrollment.completedLessonIds, lessonId];
    return {
      ...prev,
      enrollments: { ...prev.enrollments, [courseId]: { ...enrollment, completedLessonIds } },
    };
  });

  const toggleWishlist = (id) => setState((prev) => ({
    ...prev,
    wishlistIds: prev.wishlistIds.includes(id)
      ? prev.wishlistIds.filter((wishId) => wishId !== id)
      : [...prev.wishlistIds, id],
  }));

  const toggleSubscribe = (instructorId) => setState((prev) => ({
    ...prev,
    subscribedInstructorIds: prev.subscribedInstructorIds.includes(instructorId)
      ? prev.subscribedInstructorIds.filter((subId) => subId !== instructorId)
      : [...prev.subscribedInstructorIds, instructorId],
  }));

  const addCourse = ({ title, category, level, price, discountPrice, description, sections }) => {
    const nextId = state.courses.reduce((max, course) => Math.max(max, course.id), 0) + 1;
    const created = {
      id: nextId,
      title,
      teacher: state.user?.name ?? 'Вы',
      category,
      level,
      price,
      discountPrice: discountPrice ?? null,
      description,
      tone: tones[nextId % tones.length],
      sections,
      reviews: [],
      qna: [],
    };
    setState((prev) => ({
      ...prev,
      courses: [...prev.courses, created],
      instructorCourseIds: [...prev.instructorCourseIds, nextId],
    }));
    return created;
  };

  const addReview = (courseId, { rating, text }) => {
    if (!state.user) return;
    const review = { id: Date.now(), author: state.user.name, rating, text, date: new Date().toISOString() };
    updateCourse(courseId, (course) => ({ ...course, reviews: [...course.reviews, review] }));
  };

  const addQuestion = (courseId, question) => {
    if (!state.user) return;
    const entry = { id: Date.now(), author: state.user.name, question, date: new Date().toISOString(), replies: [] };
    updateCourse(courseId, (course) => ({ ...course, qna: [...course.qna, entry] }));
  };

  const addReply = (courseId, questionId, text) => {
    if (!state.user) return;
    const reply = { id: Date.now(), author: state.user.name, text, date: new Date().toISOString() };
    updateCourse(courseId, (course) => ({
      ...course,
      qna: course.qna.map((item) => (
        item.id === questionId ? { ...item, replies: [...item.replies, reply] } : item
      )),
    }));
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    addToCart,
    removeFromCart,
    enrollCartItems,
    toggleLessonComplete,
    toggleWishlist,
    toggleSubscribe,
    addCourse,
    addReview,
    addQuestion,
    addReply,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
