import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { tones } from '../data/courses.js';

const AppContext = createContext(null);

function mapCourseRow(row) {
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

async function fetchCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*, sections(*, lessons(*)), reviews(*), qna_questions(*, qna_replies(*))')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(mapCourseRow);
}

async function fetchProfileName(userId, fallbackEmail) {
  const { data } = await supabase.from('profiles').select('name').eq('id', userId).maybeSingle();
  return data?.name ?? fallbackEmail?.split('@')[0] ?? 'Студент';
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [cartIds, setCartIds] = useState([]);
  const [enrollments, setEnrollments] = useState({});
  const [wishlistIds, setWishlistIds] = useState([]);
  const [subscribedInstructorIds, setSubscribedInstructorIds] = useState([]);
  const [instructorCourseIds, setInstructorCourseIds] = useState([]);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [userDataLoaded, setUserDataLoaded] = useState(true);

  const refreshCourses = useCallback(async () => {
    const mapped = await fetchCourses();
    setCourses(mapped);
    setCoursesLoaded(true);
    return mapped;
  }, []);

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  useEffect(() => {
    let active = true;

    const applySession = async (session) => {
      if (!session?.user) {
        if (active) setUser(null);
        return;
      }
      const name = await fetchProfileName(session.user.id, session.user.email);
      if (active) setUser({ id: session.user.id, name, email: session.user.email });
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setCartIds([]);
      setEnrollments({});
      setWishlistIds([]);
      setSubscribedInstructorIds([]);
      setInstructorCourseIds([]);
      setUserDataLoaded(true);
      return;
    }

    let active = true;
    setUserDataLoaded(false);

    (async () => {
      const [cartRes, enrollRes, completedRes, wishRes, subRes, myCoursesRes] = await Promise.all([
        supabase.from('cart_items').select('course_id').eq('user_id', user.id),
        supabase.from('enrollments').select('course_id, enrolled_at').eq('user_id', user.id),
        supabase.from('completed_lessons').select('course_id, lesson_id').eq('user_id', user.id),
        supabase.from('wishlist_items').select('course_id').eq('user_id', user.id),
        supabase.from('instructor_subscriptions').select('instructor_id').eq('user_id', user.id),
        supabase.from('courses').select('id').eq('teacher_id', user.id),
      ]);
      if (!active) return;

      setCartIds((cartRes.data ?? []).map((row) => row.course_id));

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
      setEnrollments(enrollmentMap);

      setWishlistIds((wishRes.data ?? []).map((row) => row.course_id));
      setSubscribedInstructorIds((subRes.data ?? []).map((row) => row.instructor_id));
      setInstructorCourseIds((myCoursesRes.data ?? []).map((row) => row.id));
      setUserDataLoaded(true);
    })();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (name, email, password) => {
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
    setUser({ id: data.user.id, name: displayName, email: data.user.email });
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const addToCart = async (id) => {
    if (!user || cartIds.includes(id)) return;
    setCartIds((prev) => [...prev, id]);
    const { error } = await supabase.from('cart_items').insert({ user_id: user.id, course_id: id });
    if (error) {
      setCartIds((prev) => prev.filter((cartId) => cartId !== id));
      throw error;
    }
  };

  const removeFromCart = async (id) => {
    if (!user) return;
    setCartIds((prev) => prev.filter((cartId) => cartId !== id));
    await supabase.from('cart_items').delete().eq('user_id', user.id).eq('course_id', id);
  };

  const enrollCartItems = async () => {
    if (!user || cartIds.length === 0) return [];
    const enrolledCourses = courses.filter((course) => cartIds.includes(course.id));
    const rows = cartIds.map((courseId) => ({ user_id: user.id, course_id: courseId }));
    const { error } = await supabase
      .from('enrollments')
      .upsert(rows, { onConflict: 'user_id,course_id', ignoreDuplicates: true });
    if (error) throw error;
    await supabase.from('cart_items').delete().eq('user_id', user.id).in('course_id', cartIds);

    setEnrollments((prev) => {
      const next = { ...prev };
      cartIds.forEach((id) => {
        if (!next[id]) next[id] = { enrolledAt: Date.now(), completedLessonIds: [] };
      });
      return next;
    });
    setCartIds([]);
    return enrolledCourses;
  };

  const toggleLessonComplete = async (courseId, lessonId) => {
    if (!user) return;
    const enrollment = enrollments[courseId];
    if (!enrollment) return;
    const isCompleted = enrollment.completedLessonIds.includes(lessonId);

    setEnrollments((prev) => {
      const current = prev[courseId];
      if (!current) return prev;
      const completedLessonIds = isCompleted
        ? current.completedLessonIds.filter((id) => id !== lessonId)
        : [...current.completedLessonIds, lessonId];
      return { ...prev, [courseId]: { ...current, completedLessonIds } };
    });

    if (isCompleted) {
      await supabase.from('completed_lessons').delete().eq('user_id', user.id).eq('lesson_id', lessonId);
    } else {
      await supabase.from('completed_lessons').insert({ user_id: user.id, course_id: courseId, lesson_id: lessonId });
    }
  };

  const toggleWishlist = async (id) => {
    if (!user) return;
    const isSaved = wishlistIds.includes(id);
    setWishlistIds((prev) => (isSaved ? prev.filter((wishId) => wishId !== id) : [...prev, id]));
    if (isSaved) {
      await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('course_id', id);
    } else {
      await supabase.from('wishlist_items').insert({ user_id: user.id, course_id: id });
    }
  };

  const toggleSubscribe = async (instructorId) => {
    if (!user) return;
    const isSubscribed = subscribedInstructorIds.includes(instructorId);
    setSubscribedInstructorIds((prev) => (
      isSubscribed ? prev.filter((subId) => subId !== instructorId) : [...prev, instructorId]
    ));
    if (isSubscribed) {
      await supabase.from('instructor_subscriptions').delete().eq('user_id', user.id).eq('instructor_id', instructorId);
    } else {
      await supabase.from('instructor_subscriptions').insert({ user_id: user.id, instructor_id: instructorId });
    }
  };

  const addCourse = async ({ title, category, level, price, discountPrice, description, sections }) => {
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

    const refreshed = await refreshCourses();
    setInstructorCourseIds((prev) => [...prev, courseRow.id]);
    return refreshed.find((course) => course.id === courseRow.id);
  };

  const addReview = async (courseId, { rating, text }) => {
    if (!user) return;
    const { error } = await supabase.from('reviews').insert({
      course_id: courseId,
      author_id: user.id,
      author_name: user.name,
      rating,
      text,
    });
    if (error) throw error;
    await refreshCourses();
  };

  const addQuestion = async (courseId, question) => {
    if (!user) return;
    const { error } = await supabase.from('qna_questions').insert({
      course_id: courseId,
      author_id: user.id,
      author_name: user.name,
      question,
    });
    if (error) throw error;
    await refreshCourses();
  };

  const addReply = async (courseId, questionId, text) => {
    if (!user) return;
    const { error } = await supabase.from('qna_replies').insert({
      question_id: questionId,
      author_id: user.id,
      author_name: user.name,
      text,
    });
    if (error) throw error;
    await refreshCourses();
  };

  const value = {
    user,
    courses,
    cartIds,
    enrollments,
    wishlistIds,
    subscribedInstructorIds,
    instructorCourseIds,
    coursesLoaded,
    userDataLoaded,
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
