import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Heart, ChevronDown, BookOpen, Newspaper, Image as ImageIcon, FileText, UserPlus, FileEdit, PhoneCall } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import DonateModal from './DonateModal';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Clean, focused primary navigation links
  const primaryNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Programs', path: '/programs' },
    { name: 'Activities', path: '/activities' },
  ];

  // All secondary links moved cleanly under "More" dropdown
  const moreNavLinks = [
    { name: 'Blogs & Insights', path: '/blogs', icon: FileEdit, desc: 'Field articles and perspectives' },
    { name: 'Contact Us', path: '/contact', icon: PhoneCall, desc: 'Get in touch with our trust team' },
    { name: 'Impact Stories', path: '/stories', icon: BookOpen, desc: 'Real stories of transformation' },
    { name: 'News & Media', path: '/news', icon: Newspaper, desc: 'Press releases and updates' },
    { name: 'Photo Gallery', path: '/gallery', icon: ImageIcon, desc: 'Field activities photos' },
    { name: 'Reports & 80G', path: '/reports', icon: FileText, desc: 'Compliance & certificates' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isMoreActive = moreNavLinks.some((link) => location.pathname.startsWith(link.path));

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-100" data-testid="main-navbar">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="flex justify-between items-center h-20 gap-4 xl:gap-8">
            {/* Top-Left Corner Landscape Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center" data-testid="navbar-logo">
                <img
                  src="/logo-landscape.svg"
                  alt="Charitage Foundation Logo"
                  className="h-11 sm:h-12 md:h-14 w-auto object-contain transition-transform hover:scale-[1.02]"
                />
              </Link>
            </div>

            {/* Desktop Primary Navigation - Streamlined & Clean */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
              {primaryNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(link.path)
                      ? 'text-secondary bg-secondary/10 font-bold'
                      : 'text-slate-700 hover:text-secondary hover:bg-slate-50'
                  }`}
                  data-testid={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.name}
                </Link>
              ))}

              {/* More Dropdown containing Blogs, Contact, Stories, News, Gallery, Reports */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                    isMoreActive || moreDropdownOpen
                      ? 'text-secondary bg-secondary/10 font-bold'
                      : 'text-slate-700 hover:text-secondary hover:bg-slate-50'
                  }`}
                  data-testid="nav-link-more"
                >
                  More Options
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-fadeIn space-y-1">
                    {moreNavLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setMoreDropdownOpen(false)}
                          className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                            isActive(link.path) ? 'bg-secondary/10 text-secondary' : 'hover:bg-slate-50 text-slate-800'
                          }`}
                          data-testid={`nav-more-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <Icon className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-sm font-bold leading-tight">{link.name}</span>
                            <span className="block text-xs text-muted-foreground mt-0.5">{link.desc}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Actions Right Aligned */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-4 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/register')}
                className="rounded-full px-4 text-xs xl:text-sm font-bold text-slate-700 hover:text-secondary hover:bg-slate-50 flex items-center gap-1.5"
                data-testid="get-involved-nav-button"
              >
                <UserPlus className="w-4 h-4 text-secondary" />
                Get Involved
              </Button>

              {user ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="text-xs xl:text-sm font-semibold"
                    data-testid="dashboard-button"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-xs xl:text-sm text-rose-600 hover:bg-rose-50"
                    data-testid="logout-button"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="rounded-full px-5 text-xs xl:text-sm font-bold border-slate-300 hover:border-secondary hover:text-secondary"
                  data-testid="login-button"
                >
                  Login
                </Button>
              )}

              {/* Primary CTA Direct Donation Button */}
              <Button
                className="bg-secondary text-white hover:bg-secondary/90 shadow-button font-bold text-xs xl:text-sm tracking-wide px-6 py-2.5 rounded-full flex items-center gap-1.5 transform hover:scale-105 transition-transform shadow-lg shadow-orange-500/20"
                onClick={() => setShowDonate(true)}
                data-testid="donate-now-button"
              >
                <Heart className="w-4 h-4 fill-white" />
                Donate Now
              </Button>
            </div>

            {/* Mobile Controls */}
            <div className="lg:hidden flex items-center gap-2">
              <Button
                size="sm"
                className="bg-secondary text-white text-xs font-bold rounded-full px-4 shadow-sm"
                onClick={() => setShowDonate(true)}
              >
                Donate
              </Button>
              <button
                className="text-slate-700 p-2 rounded-xl hover:bg-slate-100"
                onClick={() => setIsOpen(!isOpen)}
                data-testid="mobile-menu-toggle"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 animate-fadeIn" data-testid="mobile-menu">
            <div className="px-4 pt-3 pb-6 space-y-1">
              {[...primaryNavLinks, ...moreNavLinks, { name: 'Get Involved', path: '/register' }].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(link.path)
                      ? 'bg-secondary/10 text-secondary font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                  data-testid={`mobile-nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-slate-100 space-y-2">
                {user ? (
                  <>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm font-semibold text-primary"
                      onClick={() => {
                        navigate('/dashboard');
                        setIsOpen(false);
                      }}
                      data-testid="mobile-dashboard-button"
                    >
                      My Dashboard
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm font-semibold text-rose-600"
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      data-testid="mobile-logout-button"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    className="block w-full text-left px-4 py-2 text-sm font-semibold text-primary"
                    onClick={() => {
                      navigate('/auth');
                      setIsOpen(false);
                    }}
                    data-testid="mobile-login-button"
                  >
                    Account Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <DonateModal open={showDonate} onClose={() => setShowDonate(false)} />
    </>
  );
};

export default Navbar;
