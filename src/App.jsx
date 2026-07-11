import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { CallProvider } from './features/calls/context/CallContext';
import CallModal from './features/calls/components/CallModal';
import IncomingCallModal from './features/calls/components/IncomingCallModal';
import Loader from './components/Loader';

// Layouts
const StudentLayout = lazy(() => import('./layouts/StudentLayout'));
const InstructorLayout = lazy(() => import('./layouts/InstructorLayout'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));

// Public Pages
const Home = lazy(() => import('./pages/Home'));
const StudentLogin = lazy(() => import('./pages/StudentLogin'));
const StudentRegister = lazy(() => import('./pages/auth/StudentRegister'));
const InstructorLogin = lazy(() => import('./pages/auth/InstructorLogin'));
const InstructorSignup = lazy(() => import('./pages/auth/InstructorSignup'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CourseDetailsPage = lazy(() => import('./pages/student/CourseDetailsPage'));
const VideoTest = lazy(() => import('./pages/test/VideoTest'));
// Static / Legal pages
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage'));
const FAQsPage = lazy(() => import('./pages/FAQsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));

// Student Pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const MyLearning = lazy(() => import('./pages/student/MyLearning'));
const BrowseCourses = lazy(() => import('./pages/student/BrowseCourses'));
const Messages = lazy(() => import('./pages/student/Messages'));
const StudentNotifications = lazy(() => import('./pages/student/Notifications'));
const ProgressPage = lazy(() => import('./pages/student/Progress'));
const CertificatesPage = lazy(() => import('./pages/student/CertificatesPage'));
const SettingsPage = lazy(() => import('./pages/student/SettingsPage'));
const StudentHelpCenter = lazy(() => import('./pages/student/HelpCenter'));
const StudentLiveClasses = lazy(() => import('./features/liveClasses/pages/StudentLiveClasses'));
const LiveClassDetail = lazy(() => import('./features/liveClasses/pages/LiveClassDetail'));

// Instructor Pages
const InstructorDashboard = lazy(() => import('./pages/instructor/Dashboard'));
const MyCourses = lazy(() => import('./pages/instructor/MyCourses'));
const CourseDetail = lazy(() => import('./pages/instructor/CourseDetail'));
const EditCourse = lazy(() => import('./pages/instructor/EditCourse'));
const CreateCourse = lazy(() => import('./pages/instructor/CreateCourse'));
const Students = lazy(() => import('./pages/instructor/Students'));
const InstructorNotifications = lazy(() => import('./pages/instructor/Notifications'));
const InstructorLiveClasses = lazy(() => import('./features/liveClasses/pages/InstructorLiveClasses'));
const CreateLiveClass = lazy(() => import('./features/liveClasses/pages/CreateLiveClass'));
const EditLiveClass = lazy(() => import('./features/liveClasses/pages/EditLiveClass'));
const InstructorPayouts = lazy(() => import('./pages/instructor/Payouts'));
const InstructorReviews = lazy(() => import('./pages/instructor/Reviews'));
const InstructorSettings = lazy(() => import('./pages/instructor/Settings'));
const InstructorHelpCenter = lazy(() => import('./pages/instructor/HelpCenter'));
const InstructorSupport = lazy(() => import('./pages/instructor/Support'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const CoursesManagement = lazy(() => import('./pages/admin/CoursesManagement'));
const StudentsManagement = lazy(() => import('./pages/admin/StudentsManagement'));
const InstructorManagement = lazy(() => import('./pages/admin/InstructorManagement'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const Payments = lazy(() => import('./pages/admin/Payments'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const AdminSupportTickets = lazy(() => import('./pages/admin/SupportTickets'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const ManualEnrollment = lazy(() => import('./pages/admin/ManualEnrollment'));
const AccountBlocked = lazy(() => import('./pages/AccountBlocked'));
const VerifyEmailPage = lazy(() => import('./pages/student/VerifyEmailPage'));

import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';

function AppContent() {
  const { maintenanceMode, user, loading } = useAuth();
  
  const isMaintenanceRedirectNeeded = maintenanceMode && user?.role !== 'admin';
  const isCurrentlyOnAdminRoute = window.location.pathname.startsWith('/admin');
  const isCurrentlyOnMaintenance = window.location.pathname === '/maintenance';

  // Wait until Auth is loaded before executing redirect flow to prevent flickers
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
  }

  if (isMaintenanceRedirectNeeded && !isCurrentlyOnAdminRoute && !isCurrentlyOnMaintenance) {
    return <Navigate to="/maintenance" replace />;
  }

  if (!isMaintenanceRedirectNeeded && isCurrentlyOnMaintenance) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/'} replace />;
  }

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-center" reverseOrder={false} />
      <CallModal />
      <IncomingCallModal />
      <ErrorBoundary>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader /></div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<StudentLogin />} />
            <Route path="/register" element={<StudentRegister />} />
            <Route path="/instructor/login" element={<InstructorLogin />} />
            <Route path="/instructor/signup" element={<InstructorSignup />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/courses/:id" element={<CourseDetailsPage />} />
            <Route path="/test-video" element={<VideoTest />} />
            <Route path="/account-blocked" element={<AccountBlocked />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />

            {/* Static / Legal Routes */}
            <Route path="/help-center" element={<HelpCenterPage />} />
            <Route path="/faqs" element={<FAQsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />

            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="my-learning" element={<MyLearning />} />
              <Route path="browse-courses" element={<BrowseCourses />} />
              <Route path="messages" element={<Messages />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="live-classes" element={<StudentLiveClasses />} />
              <Route path="live-classes/:id" element={<LiveClassDetail />} />

              <Route path="progress" element={<ProgressPage />} />
              <Route path="certificates" element={<CertificatesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="help" element={<StudentHelpCenter />} />
            </Route>

            {/* Instructor Routes */}
            <Route path="/instructor" element={<ProtectedRoute roles={['instructor', 'admin']}><InstructorLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/instructor/dashboard" replace />} />
              <Route path="dashboard" element={<InstructorDashboard />} />
              <Route path="my-courses" element={<MyCourses />} />
              <Route path="courses/:id" element={<CourseDetail />} />
              <Route path="edit-course/:id" element={<EditCourse />} />
              <Route path="create-course" element={<CreateCourse />} />
              <Route path="earnings" element={<InstructorPayouts />} />
              <Route path="students" element={<Students />} />
              <Route path="reviews" element={<InstructorReviews />} />
              <Route path="messages" element={<Messages />} />
              <Route path="notifications" element={<InstructorNotifications />} />
              <Route path="settings" element={<InstructorSettings />} />
              <Route path="help" element={<InstructorHelpCenter />} />
              <Route path="support" element={<InstructorSupport />} />
              <Route path="live-classes" element={<InstructorLiveClasses />} />
              <Route path="live-classes/create" element={<CreateLiveClass />} />
              <Route path="live-classes/edit/:id" element={<EditLiveClass />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="courses" element={<CoursesManagement />} />
              <Route path="students" element={<StudentsManagement />} />
              <Route path="instructor-management" element={<InstructorManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="payments" element={<Payments />} />
              <Route path="settings" element={<Settings />} />
              <Route path="support" element={<AdminSupportTickets />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="enrollments" element={<ManualEnrollment />} />
              <Route path="create-course" element={<CreateCourse />} />
              <Route path="edit-course/:id" element={<EditCourse />} />
              <Route path="courses/:id" element={<CourseDetail />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<div className="min-h-screen flex items-center justify-center font-bold text-slate-500">404 - Page Not Found</div>} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CallProvider>
          <Router>
            <AppContent />
          </Router>
        </CallProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
