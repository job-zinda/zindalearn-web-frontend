import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Navbar = ({ showBackground = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isScrolled = scrolled || showBackground;

  const handleHomeClick = (e) => {
    e.preventDefault();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    navigate('/about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    const map = { 
      student: '/student/dashboard',
      instructor: '/instructor/dashboard',
      admin: '/admin/dashboard'
    };
    return map[user.role] || '/';
  };

  const getNavLinkClass = (path, isHash = false) => {
    const base = "px-5 py-2 text-sm font-semibold rounded-full hover:shadow-sm transition-all duration-300 ";
    let active = false;

    if (isHash) {
      active = location.hash === path;
    } else {
      active = location.pathname === path && location.hash === "";
    }

    if (active) {
      return base + (isScrolled ? "bg-white text-primary-600 shadow-sm" : "bg-white/20 text-white shadow-sm");
    }
    return base + (isScrolled ? "text-surface-600 hover:bg-white hover:text-primary-600" : "text-white/90 hover:bg-white/20 hover:text-white");
  };

  return (
    <nav className={`fixed transition-all duration-500 z-50 ${
      isScrolled 
        ? 'top-0 left-0 right-0 bg-white shadow-md py-2 border-b border-surface-100 px-4 md:px-0' 
        : 'top-4 left-4 right-4 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-7xl bg-transparent py-4'
    }`}>
      <div className={`w-full transition-all duration-500 ${isScrolled ? 'max-w-7xl mx-auto px-4 md:px-6' : 'px-4 md:px-6'}`}>
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <button onClick={handleHomeClick} className="flex items-center group">
            <img 
              src="/zinda-learn-logo.png" 
              alt="Zinda Learn" 
              className={`h-8 md:h-10 transition-all duration-300 object-contain ${!isScrolled ? 'brightness-0 invert' : ''}`}
            />
          </button>

          {/* Desktop Nav */}
          <div className={`hidden lg:flex items-center gap-1 p-1.5 rounded-full border backdrop-blur-sm transition-all duration-300 ${
            isScrolled ? 'bg-surface-100/50 border-surface-200/60' : 'bg-white/10 border-white/20'
          }`}>
            <button onClick={handleHomeClick} className={getNavLinkClass("/")}>Home</button>
            <NavLink to="/courses" className={({ isActive }) => getNavLinkClass("/courses")}>Courses</NavLink>
            <button onClick={handleAboutClick} className={getNavLinkClass("/about")}>About</button>
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to={getDashboardLink()}>
                  <Button variant={isScrolled ? "secondary" : "ghost"} size="sm" className={!isScrolled ? "text-white hover:bg-white/20" : ""}>Dashboard</Button>
                </Link>
                <div className="relative group">
                  <button className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${isScrolled ? 'hover:bg-surface-50' : 'hover:bg-white/10'}`}>
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0)}
                    </div>
                    <span className={`text-sm font-medium ${isScrolled ? 'text-surface-700' : 'text-white'}`}>{user?.name?.split(' ')[0]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 ${isScrolled ? 'text-surface-400' : 'text-white/70'}`} />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-surface-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1.5 overflow-hidden">
                    <Link to={getDashboardLink()} className="block px-4 py-2 text-sm text-surface-600 hover:bg-primary-50 hover:text-primary-600">Dashboard</Link>
                    <Link to="/student/settings" className="block px-4 py-2 text-sm text-surface-600 hover:bg-primary-50 hover:text-primary-600">Settings</Link>
                    <hr className="my-1.5 border-surface-100" />
                    <button onClick={() => { logout(); navigate('/'); }} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Sign Out</button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className={!isScrolled ? "text-white hover:bg-white/20" : ""}>Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className={!isScrolled ? "bg-white text-primary-600 hover:bg-surface-50" : ""}>Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-xl transition-colors ${isScrolled ? 'hover:bg-surface-50 text-surface-600' : 'hover:bg-white/10 text-white'}`}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-white/90 backdrop-blur-2xl rounded-2xl shadow-xl border border-surface-200 mt-3 p-5 animate-slide-up">
            <div className="space-y-1">
              <button 
                onClick={handleHomeClick} 
                className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${location.pathname === "/" && location.hash === "" ? "bg-primary-50 text-primary-600" : "text-surface-700 hover:bg-primary-50 hover:text-primary-600"}`}
              >
                Home
              </button>
              <Link 
                to="/courses" 
                className={`block px-4 py-3 rounded-xl font-semibold transition-colors ${location.pathname === "/courses" ? "bg-primary-50 text-primary-600" : "text-surface-700 hover:bg-primary-50 hover:text-primary-600"}`} 
                onClick={() => setIsOpen(false)}
              >
                Courses
              </Link>
              <button 
                onClick={handleAboutClick} 
                className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${location.pathname === "/about" ? "bg-primary-50 text-primary-600" : "text-surface-700 hover:bg-primary-50 hover:text-primary-600"}`}
              >
                About
              </button>
            </div>
            <hr className="my-4 border-surface-100" />
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link to={getDashboardLink()} onClick={() => setIsOpen(false)}>
                  <Button fullWidth variant="secondary">Dashboard</Button>
                </Link>
                <button onClick={() => { logout(); navigate('/'); setIsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl">Sign Out</button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button fullWidth variant="secondary">Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button fullWidth>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
