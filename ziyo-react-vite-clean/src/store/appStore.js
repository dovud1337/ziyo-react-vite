import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { supabase } from '../lib/supabaseClient.js';
import { tones } from '../data/courses.js';

function mapCourseCardRow(row) {
  return {
    id: row.id,
    teacher: row.teacher_name,
    category: row.category,
    level: row.level,
    price: Number(row.price),
    discountPrice: row.discount_price != null ? Number(row.discount_price) : null,
    tone: row.tone,
    title: row.title,
    lessonCount: row.lesson_count ?? 0,
    reviewCount: row.review_count ?? 0,
    avgRating: row.avg_rating != null ? Number(row.avg_rating) : null,
  };
}

function mapCourseDetailRow(row) {
  return {
    id: row.id,
    title: row.title,
    teacher: row.teacher_name,
    category: row.category,
    level: row.level,
    price: Number(row.price),
    discountPrice: row.discount_price != null ? Number(row.discount_price) : null,
    description: row.description,
    tone: row.tone,
    sections: [...(row.sections ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((section) => ({
        id: section.id,
        title: section.title,
        lessons: [...(section.lessons ?? [])]
          .sort((a, b) => a.position - b.position)
          .map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            type: lesson.type,
            content: lesson.content,
            videoUrl: lesson.video_url,
          })),
      })),
    reviews: [...(row.reviews ?? [])]
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((review) => ({
        id: review.id,
        author: review.author_name,
        rating: review.rating,
        text: review.text,
        date: review.created_at,
      })),
    qna: [...(row.qna_questions ?? [])]
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((question) => ({
        id: question.id,
        author: question.author_name,
        question: question.question,
        date: question.created_at,
        replies: [...(question.qna_replies ?? [])]
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .map((reply) => ({
            id: reply.id,
            author: reply.author_name,
            text: reply.text,
            date: reply.created_at,
          })),
      })),
  };
}

function mergeCourseIntoList(courses, course) {
  const index = courses.findIndex((item) => item.id === course.id);
  if (index === -1) return [...courses, course];
  const next = [...courses];
  next[index] = { ...next[index], ...course };
  return next;
}

async function fetchCoursesList() {
  const { data, error } = await supabase
    .from('course_cards')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(mapCourseCardRow);
}

async function fetchCourseDetailRow(courseId) {
  const { data, error } = await supabase
    .from('courses')
    .select('*, sections(*, lessons(*)), reviews(*), qna_questions(*, qna_replies(*))')
    .eq('id', courseId)
    .single();
  if (error) throw error;
  return mapCourseDetailRow(data);
}

async function fetchProfileName(userId, fallbackEmail) {
  const { data } = await supabase.from('profiles').select('name').eq('id', userId).maybeSingle();
  return data?.name ?? fallbackEmail?.split('@')[0] ?? 'Студент';
}

async function loadUserData(set, userId) {
  set({ userDataLoaded: false });
  try {
    const [cartRes, enrollRes, completedRes, wishRes, subRes, myCoursesRes] = await Promise.all([
      supabase.from('cart_items').select('course_id').eq('user_id', userId),
      supabase.from('enrollments').select('course_id, enrolled_at').eq('user_id', userId),
      supabase.from('completed_lessons').select('course_id, lesson_id').eq('user_id', userId),
      supabase.from('wishlist_items').select('course_id').eq('user_id', userId),
      supabase.from('instructor_subscriptions').select('instructor_id').eq('user_id', userId),
      supabase.from('courses').select('id').eq('teacher_id', userId),
    ]);

    const enrollmentMap = {};
    (enrollRes.data ?? []).forEach((row) => {
      enrollmentMap[row.course_id] = {
        enrolledAt: new Date(row.enrolled_at).getTime(),
        completedLessonIds: [],
      };
    });
    (completedRes.data ?? []).forEach((row) => {
      if (!enrollmentMap[row.course_id]) {
        enrollmentMap[row.course_id] = { enrolledAt: Date.now(), completedLessonIds: [] };
      }
      enrollmentMap[row.course_id].completedLessonIds.push(row.lesson_id);
    });

    set({
      cartIds: (cartRes.data ?? []).map((row) => row.course_id),
      enrollments: enrollmentMap,
      wishlistIds: (wishRes.data ?? []).map((row) => row.course_id),
      subscribedInstructorIds: (subRes.data ?? []).map((row) => row.instructor_id),
      instructorCourseIds: (myCoursesRes.data ?? []).map((row) => row.id),
      userDataLoaded: true,
    });
  } catch {
    set({ userDataLoaded: true });
  }
}

async function applySession(set, session) {
  if (!session?.user) {
    set({
      user: null, cartIds: [], enrollments: {}, wishlistIds: [],
      subscribedInstructorIds: [], instructorCourseIds: [], userDataLoaded: true,
    });
    return;
  }
  const name = await fetchProfileName(session.user.id, session.user.email);
  set({ user: { id: session.user.id, name, email: session.user.email } });
  await loadUserData(set, session.user.id);
}

export const useAppStore = create((set, get) => ({
  user: null,
  courses: [],
  coursesLoaded: false,
  coursesError: null,
  cartIds: [],
  enrollments: {},
  wishlistIds: [],
  subscribedInstructorIds: [],
  instructorCourseIds: [],
  userDataLoaded: true,

  init: () => {
    get().refreshCourses();
    supabase.auth.getSession().then(({ data }) => applySession(set, data.session));
    supabase.auth.onAuthStateChange((_event, session) => { applySession(set, session); });
  },

  refreshCourses: async () => {
    try {
      const mapped = await fetchCoursesList();
      set({ courses: mapped, coursesLoaded: true, coursesError: null });
      return mapped;
    } catch (err) {
      set({ coursesLoaded: true, coursesError: err.message ?? 'Не удалось загрузить курсы.' });
      throw err;
    }
  },

  fetchCourseDetail: async (courseId) => {
    const detail = await fetchCourseDetailRow(courseId);
    set((state) => ({ courses: mergeCourseIntoList(state.courses, detail) }));
    return detail;
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  register: async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.session) {
      throw new Error('Регистрация прошла, но подтверждение email включено в настройках Supabase — отключите его для этого демо-проекта.');
    }
    const displayName = name?.trim() || email.split('@')[0];
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, name: displayName });
    if (profileError) throw profileError;
    set({ user: { id: data.user.id, name: displayName, email: data.user.email } });
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  addToCart: async (id) => {
    const { user, cartIds } = get();
    if (!user || cartIds.includes(id)) return;
    set({ cartIds: [...cartIds, id] });
    const { error } = await supabase.from('cart_items').insert({ user_id: user.id, course_id: id });
    if (error) {
      set({ cartIds });
      throw error;
    }
  },

  removeFromCart: async (id) => {
    const { user, cartIds } = get();
    if (!user) return;
    set({ cartIds: cartIds.filter((cartId) => cartId !== id) });
    const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id).eq('course_id', id);
    if (error) {
      set({ cartIds });
      throw error;
    }
  },

  enrollCartItems: async () => {
    const { user, cartIds, courses, enrollments } = get();
    if (!user || cartIds.length === 0) return [];
    const enrolledCourses = courses.filter((course) => cartIds.includes(course.id));
    const rows = cartIds.map((courseId) => ({ user_id: user.id, course_id: courseId }));
    const { error } = await supabase
      .from('enrollments')
      .upsert(rows, { onConflict: 'user_id,course_id', ignoreDuplicates: true });
    if (error) throw error;
    await supabase.from('cart_items').delete().eq('user_id', user.id).in('course_id', cartIds);

    const nextEnrollments = { ...enrollments };
    cartIds.forEach((id) => {
      if (!nextEnrollments[id]) nextEnrollments[id] = { enrolledAt: Date.now(), completedLessonIds: [] };
    });
    set({ enrollments: nextEnrollments, cartIds: [] });
    return enrolledCourses;
  },

  toggleLessonComplete: async (courseId, lessonId) => {
    const { user, enrollments } = get();
    if (!user) return;
    const enrollment = enrollments[courseId];
    if (!enrollment) return;
    const isCompleted = enrollment.completedLessonIds.includes(lessonId);
    const nextCompletedLessonIds = isCompleted
      ? enrollment.completedLessonIds.filter((id) => id !== lessonId)
      : [...enrollment.completedLessonIds, lessonId];
    set({ enrollments: { ...enrollments, [courseId]: { ...enrollment, completedLessonIds: nextCompletedLessonIds } } });

    const { error } = isCompleted
      ? await supabase.from('completed_lessons').delete().eq('user_id', user.id).eq('lesson_id', lessonId)
      : await supabase.from('completed_lessons').insert({ user_id: user.id, course_id: courseId, lesson_id: lessonId });
    if (error) {
      set({ enrollments });
      throw error;
    }
  },

  toggleWishlist: async (id) => {
    const { user, wishlistIds } = get();
    if (!user) return;
    const isSaved = wishlistIds.includes(id);
    set({ wishlistIds: isSaved ? wishlistIds.filter((wishId) => wishId !== id) : [...wishlistIds, id] });

    const { error } = isSaved
      ? await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('course_id', id)
      : await supabase.from('wishlist_items').insert({ user_id: user.id, course_id: id });
    if (error) {
      set({ wishlistIds });
      throw error;
    }
  },

  toggleSubscribe: async (instructorId) => {
    const { user, subscribedInstructorIds } = get();
    if (!user) return;
    const isSubscribed = subscribedInstructorIds.includes(instructorId);
    set({
      subscribedInstructorIds: isSubscribed
        ? subscribedInstructorIds.filter((subId) => subId !== instructorId)
        : [...subscribedInstructorIds, instructorId],
    });

    const { error } = isSubscribed
      ? await supabase.from('instructor_subscriptions').delete().eq('user_id', user.id).eq('instructor_id', instructorId)
      : await supabase.from('instructor_subscriptions').insert({ user_id: user.id, instructor_id: instructorId });
    if (error) {
      set({ subscribedInstructorIds });
      throw error;
    }
  },

  addCourse: async ({ title, category, level, price, discountPrice, description, sections }) => {
    const { user, courses, instructorCourseIds } = get();
    if (!user) throw new Error('Войдите, чтобы создать курс.');

    const { data: courseRow, error: courseError } = await supabase
      .from('courses')
      .insert({
        teacher_id: user.id,
        teacher_name: user.name,
        title,
        category,
        level,
        price,
        discount_price: discountPrice ?? null,
        description,
        tone: tones[courses.length % tones.length],
      })
      .select()
      .single();
    if (courseError) throw courseError;

    const sectionRows = sections.map((section, index) => ({
      course_id: courseRow.id,
      title: section.title,
      position: index,
    }));
    const { data: insertedSections, error: sectionsError } = await supabase
      .from('sections')
      .insert(sectionRows)
      .select();
    if (sectionsError) throw sectionsError;

    const orderedSections = [...insertedSections].sort((a, b) => a.position - b.position);
    const lessonRows = sections.flatMap((section, sectionIndex) => (
      section.lessons.map((lesson, lessonIndex) => ({
        section_id: orderedSections[sectionIndex].id,
        title: lesson.title,
        type: lesson.type,
        content: lesson.content,
        video_url: lesson.videoUrl || null,
        position: lessonIndex,
      }))
    ));
    const { error: lessonsError } = await supabase.from('lessons').insert(lessonRows);
    if (lessonsError) throw lessonsError;

    const detail = await fetchCourseDetailRow(courseRow.id);
    set((state) => ({
      courses: mergeCourseIntoList(state.courses, detail),
      instructorCourseIds: [...instructorCourseIds, courseRow.id],
    }));
    return detail;
  },

  addReview: async (courseId, { rating, text }) => {
    const { user } = get();
    if (!user) return;
    const { error } = await supabase.from('reviews').insert({
      course_id: courseId,
      author_id: user.id,
      author_name: user.name,
      rating,
      text,
    });
    if (error) throw error;
    await get().fetchCourseDetail(courseId);
  },

  addQuestion: async (courseId, question) => {
    const { user } = get();
    if (!user) return;
    const { error } = await supabase.from('qna_questions').insert({
      course_id: courseId,
      author_id: user.id,
      author_name: user.name,
      question,
    });
    if (error) throw error;
    await get().fetchCourseDetail(courseId);
  },

  addReply: async (courseId, questionId, text) => {
    const { user } = get();
    if (!user) return;
    const { error } = await supabase.from('qna_replies').insert({
      question_id: questionId,
      author_id: user.id,
      author_name: user.name,
      text,
    });
    if (error) throw error;
    await get().fetchCourseDetail(courseId);
  },
}));

if (!globalThis.__ziyoAppStoreInitialized) {
  globalThis.__ziyoAppStoreInitialized = true;
  useAppStore.getState().init();
}

export function useApp(selector) {
  return useAppStore(useShallow(selector));
}
