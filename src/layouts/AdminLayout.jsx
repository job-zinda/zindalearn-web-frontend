import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CreditCard,
  BarChart3, HelpCircle, Bell, Settings, LogOut, Menu, X,
  ChevronDown, ChevronRight, Shield, UserPlus, PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Students',     icon: Users,          path: '/admin/students' },
      { label: 'Instructors',  icon: GraduationCap,  path: '/admin/instructor-management' },
      { label: 'Courses',      icon: BookOpen,        path: '/admin/courses' },
    ],
  },
  {
    label: 'Enrollments',
    items: [
      { label: 'Manual Enrollment', icon: UserPlus,   path: '/admin/enrollments' },
    ],
  },
  {
    label: 'Courses',
    items: [
      { label: 'Create Course',  icon: PlusCircle,    path: '/admin/create-course' },
      { label: 'Manage Courses', icon: BookOpen,       path: '/admin/courses' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Payments',     icon: CreditCard,      path: '/admin/payments' },
      { label: 'Analytics',    icon: BarChart3,        path: '/admin/analytics' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Support',      icon: HelpCircle,      path: '/admin/support' },
      { label: 'Notifications',icon: Bell,            path: '/admin/notifications' },
      { label: 'Settings',     icon: Settings,        path: '/admin/settings' },
    ],
  },
];

const SidebarLink = ({ item, isActive, onClick }) => (
  <Link
    to={item.path}
    onClick={onClick}
    className={`
      flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
      ${isActive
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
      }
    `}
  >
    <item.icon className="w-4 h-4 flex-shrink-0" />
    <span>{item.label}</span>
  </Link>
);

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Get current page label for breadcrumb
  const currentPage = NAV_SECTIONS
    .flatMap(s => s.items)
    .find(item => item.path === location.pathname);

  const avatarUrl = user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=6366f1&color=fff&size=80`;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-300">

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ─── Sidebar ─── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-slate-950 border-r border-slate-800 z-50
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">ZL</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-100 leading-none">Zinda Learn</span>
              <span className="block text-[10px] text-slate-500 mt-0.5">Admin Console</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <SidebarLink
                    key={item.label}
                    item={item}
                    isActive={location.pathname === item.path}
                    onClick={() => setSidebarOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom user area */}
        <div className="border-t border-slate-800 p-3 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Super Admin
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ─── Main content ─── */}
      <div className="lg:ml-60 min-h-screen flex flex-col">

        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-14 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 flex items-center px-4 lg:px-6 gap-4">

          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500">
            <span>Admin</span>
            {currentPage && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-300 font-medium">{currentPage.label}</span>
              </>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right section */}
          <div className="flex items-center gap-1">
            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(prev => !prev)}
                className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-800 hover:bg-slate-800 rounded-lg px-2 py-1.5 transition-colors"
              >
                <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                <span className="hidden sm:block text-sm font-medium text-slate-300">
                  {user?.name?.split(' ')[0] || 'Admin'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-sm font-medium text-slate-200">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/admin/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 xl:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

