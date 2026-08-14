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

const studentSimplePages = [
  ['calendar', 'Календарь', 'Расписание занятий и дедлайнов.'],
  ['messages', 'Сообщения', 'Чаты с преподавателями и студентами.'],
  ['notifications', 'Уведомления', 'Все важные обновления платформы.'],
  ['community', 'Сообщество', 'Обсуждения, вопросы и ответы.'],
  ['profile', 'Профиль', 'Личная информация и достижения.'],
  ['settings', 'Настройки', 'Язык, безопасность и уведомления.'],
  ['quiz', 'Тест', 'Проверка знаний после урока.'],
  ['assignment', 'Задание', 'Практическая работа и обратная связь.'],
];

const instructorSimplePages = [
  ['curriculum', 'Программа курса', 'Модули, уроки и порядок обучения.'],
  ['upload', 'Загрузка урока', 'Добавьте видео, материалы и задания.'],
  ['analytics', 'Аналитика', 'Просмотры, завершения и активность студентов.'],
  ['students', 'Студенты', 'Список студентов и их прогресс.'],
  ['earnings', 'Доходы', 'Продажи, выплаты и финансовые отчёты.'],
  ['reviews', 'Отзывы', 'Оценки и обратная связь по курсам.'],
];

export default function App() {
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
        <Route path="/about" element={<MarketingPage title="О платформе" description="Онлайн-обучение для Центральной Азии и СНГ." ctaTo="/register" />} />
        <Route path="/business" element={<MarketingPage title="ZIYO для бизнеса" description="Обучайте команды и отслеживайте прогресс." cta="Запросить демо" ctaTo="/contact" />} />
        <Route path="/teach" element={<MarketingPage title="Станьте преподавателем" description="Создавайте курсы и зарабатывайте на знаниях." cta="Создать курс" ctaTo="/instructor/create" />} />
        <Route path="/faq" element={<MarketingPage title="Частые вопросы" description="Ответы о курсах, оплате и сертификатах." ctaTo="/register" />} />
        <Route path="/contact" element={<MarketingPage title="Свяжитесь с нами" description="Поддержка студентов и преподавателей." ctaTo="/register" />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:articleId" element={<MarketingPage title="Статья ZIYO" description="Полезные материалы об обучении и карьере." ctaTo="/catalog" />} />

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
        <Route path="/admin/users" element={<AdminListPage title="Пользователи" columns={['Имя', 'Email', 'Страна', 'Статус']} />} />
        <Route path="/admin/courses" element={<AdminListPage title="Курсы" columns={['Курс', 'Автор', 'Студенты', 'Статус']} />} />
        <Route path="/admin/instructors" element={<AdminListPage title="Преподаватели" columns={['Имя', 'Курсы', 'Рейтинг', 'Статус']} />} />
        <Route path="/admin/orders" element={<AdminListPage title="Заказы" columns={['Заказ', 'Покупатель', 'Сумма', 'Статус']} />} />
        <Route path="/admin/reports" element={<AdminListPage title="Отчёты" columns={['Отчёт', 'Период', 'Формат', 'Статус']} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
    </Routes>
  );
}
