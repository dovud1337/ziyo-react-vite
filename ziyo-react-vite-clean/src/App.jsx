import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import { useLanguage } from './context/LanguageContext.jsx';
import { supabase } from './lib/supabaseClient.js';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const CatalogPage = lazy(() => import('./pages/CatalogPage.jsx'));
const CoursePage = lazy(() => import('./pages/CoursePage.jsx'));
const AuthPage = lazy(() => import('./pages/AuthPages.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

const InstructorsPage = lazy(() => import('./pages/PublicPages.jsx').then((m) => ({ default: m.InstructorsPage })));
const InstructorProfilePage = lazy(() => import('./pages/PublicPages.jsx').then((m) => ({ default: m.InstructorProfilePage })));
const MarketingPage = lazy(() => import('./pages/PublicPages.jsx').then((m) => ({ default: m.MarketingPage })));
const BlogPage = lazy(() => import('./pages/PublicPages.jsx').then((m) => ({ default: m.BlogPage })));

const StudentDashboardPage = lazy(() => import('./pages/StudentPages.jsx').then((m) => ({ default: m.StudentDashboardPage })));
const MyCoursesPage = lazy(() => import('./pages/StudentPages.jsx').then((m) => ({ default: m.MyCoursesPage })));
const WishlistPage = lazy(() => import('./pages/StudentPages.jsx').then((m) => ({ default: m.WishlistPage })));
const LessonPage = lazy(() => import('./pages/StudentPages.jsx').then((m) => ({ default: m.LessonPage })));
const CertificatesPage = lazy(() => import('./pages/StudentPages.jsx').then((m) => ({ default: m.CertificatesPage })));
const SimpleStudentPage = lazy(() => import('./pages/StudentPages.jsx').then((m) => ({ default: m.SimpleStudentPage })));

const InstructorDashboardPage = lazy(() => import('./pages/InstructorPages.jsx').then((m) => ({ default: m.InstructorDashboardPage })));
const CreateCoursePage = lazy(() => import('./pages/InstructorPages.jsx').then((m) => ({ default: m.CreateCoursePage })));
const InstructorCoursesPage = lazy(() => import('./pages/InstructorPages.jsx').then((m) => ({ default: m.InstructorCoursesPage })));
const SimpleInstructorPage = lazy(() => import('./pages/InstructorPages.jsx').then((m) => ({ default: m.SimpleInstructorPage })));

const CartPage = lazy(() => import('./pages/CommercePages.jsx').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CommercePages.jsx').then((m) => ({ default: m.CheckoutPage })));
const PaymentSuccessPage = lazy(() => import('./pages/CommercePages.jsx').then((m) => ({ default: m.PaymentSuccessPage })));

const AdminDashboardPage = lazy(() => import('./pages/AdminPages.jsx').then((m) => ({ default: m.AdminDashboardPage })));
const AdminListPage = lazy(() => import('./pages/AdminPages.jsx').then((m) => ({ default: m.AdminListPage })));

export default function App() {
  const { t } = useLanguage();

  if (!supabase) return (
    <main className="auth-page"><div className="auth-card panel" role="alert">
      <h1>NOOR</h1><h2>{t('common.setupTitle')}</h2><p>{t('common.setupDescription')}</p>
    </div></main>
  );

  const studentSimplePages = [
    ['calendar', t('pages.studentCalendarTitle'), t('pages.studentCalendarDescription')],
    ['messages', t('pages.studentMessagesTitle'), t('pages.studentMessagesDescription')],
    ['notifications', t('pages.studentNotificationsTitle'), t('pages.studentNotificationsDescription')],
    ['community', t('pages.studentCommunityTitle'), t('pages.studentCommunityDescription')],
    ['profile', t('pages.studentProfileTitle'), t('pages.studentProfileDescription')],
    ['settings', t('pages.studentSettingsTitle'), t('pages.studentSettingsDescription')],
    ['quiz', t('pages.studentQuizTitle'), t('pages.studentQuizDescription')],
    ['assignment', t('pages.studentAssignmentTitle'), t('pages.studentAssignmentDescription')],
  ];

  const instructorSimplePages = [
    ['curriculum', t('pages.instructorCurriculumTitle'), t('pages.instructorCurriculumDescription')],
    ['upload', t('pages.instructorUploadTitle'), t('pages.instructorUploadDescription')],
    ['analytics', t('pages.instructorAnalyticsTitle'), t('pages.instructorAnalyticsDescription')],
    ['students', t('pages.instructorStudentsTitle'), t('pages.instructorStudentsDescription')],
    ['earnings', t('pages.instructorEarningsTitle'), t('pages.instructorEarningsDescription')],
    ['reviews', t('pages.instructorReviewsTitle'), t('pages.instructorReviewsDescription')],
  ];

  return (
    <Suspense fallback={<div className="panel empty-state"><h2>{t('common.loading')}</h2></div>}>
      <Routes>
        <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/search" element={<CatalogPage />} />
            <Route path="/category/:category" element={<CatalogPage />} />
            <Route path="/courses/:courseId" element={<CoursePage />} />
            <Route path="/instructors" element={<InstructorsPage />} />
            <Route path="/instructors/:instructorId" element={<InstructorProfilePage />} />
            <Route path="/about" element={<MarketingPage title={t('pages.aboutTitle')} description={t('pages.aboutDescription')} ctaTo="/register" />} />
            <Route path="/business" element={<MarketingPage title={t('pages.businessTitle')} description={t('pages.businessDescription')} cta={t('pages.businessCta')} ctaTo="/contact" />} />
            <Route path="/teach" element={<MarketingPage title={t('pages.teachTitle')} description={t('pages.teachDescription')} cta={t('pages.teachCta')} ctaTo="/instructor/create" />} />
            <Route path="/faq" element={<MarketingPage title={t('pages.faqTitle')} description={t('pages.faqDescription')} ctaTo="/register" />} />
            <Route path="/contact" element={<MarketingPage title={t('pages.contactTitle')} description={t('pages.contactDescription')} ctaTo="/register" />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:articleId" element={<MarketingPage title={t('pages.blogArticleTitle')} description={t('pages.blogArticleDescription')} ctaTo="/catalog" />} />

            <Route path="/student" element={<StudentDashboardPage />} />
            <Route path="/student/courses" element={<MyCoursesPage />} />
            <Route path="/student/wishlist" element={<WishlistPage />} />
            <Route path="/student/certificates" element={<CertificatesPage />} />
            <Route path="/student/lesson/:courseId/:lessonId" element={<LessonPage />} />
            {studentSimplePages.map(([path, title, description]) => (
              <Route key={path} path={`/student/${path}`} element={<SimpleStudentPage title={title} description={description} />} />
            ))}

            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />

            <Route path="/instructor" element={<InstructorDashboardPage />} />
            <Route path="/instructor/create" element={<CreateCoursePage />} />
            <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
            {instructorSimplePages.map(([path, title, description]) => (
              <Route key={path} path={`/instructor/${path}`} element={<SimpleInstructorPage title={title} description={description} />} />
            ))}

            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminListPage title={t('pages.adminUsersTitle')} columns={t('pages.adminUsersColumns')} />} />
            <Route path="/admin/courses" element={<AdminListPage title={t('pages.adminCoursesTitle')} columns={t('pages.adminCoursesColumns')} />} />
            <Route path="/admin/instructors" element={<AdminListPage title={t('pages.adminInstructorsTitle')} columns={t('pages.adminInstructorsColumns')} />} />
            <Route path="/admin/orders" element={<AdminListPage title={t('pages.adminOrdersTitle')} columns={t('pages.adminOrdersColumns')} />} />
            <Route path="/admin/reports" element={<AdminListPage title={t('pages.adminReportsTitle')} columns={t('pages.adminReportsColumns')} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
          <Route path="/reset-password" element={<AuthPage mode="reset" />} />
        </Routes>
    </Suspense>
  );
}
