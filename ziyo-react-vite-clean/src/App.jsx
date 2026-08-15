import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import CoursePage from './pages/CoursePage.jsx';
import { InstructorsPage, InstructorProfilePage, MarketingPage, BlogPage } from './pages/PublicPages.jsx';
import { StudentDashboardPage, MyCoursesPage, WishlistPage, LessonPage, CertificatesPage, SimpleStudentPage } from './pages/StudentPages.jsx';
import { InstructorDashboardPage, CreateCoursePage, InstructorCoursesPage, SimpleInstructorPage } from './pages/InstructorPages.jsx';
import { CartPage, CheckoutPage, PaymentSuccessPage } from './pages/CommercePages.jsx';
import { AdminDashboardPage, AdminListPage } from './pages/AdminPages.jsx';
import AuthPage from './pages/AuthPages.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { useLanguage } from './context/LanguageContext.jsx';

export default function App() {
  const { t } = useLanguage();

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
    </Routes>
  );
}
