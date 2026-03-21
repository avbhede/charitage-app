import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import DonateModal from './DonateModal';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Our Programs', path: '/programs' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Blog', path: '/blog' },
    { name: 'Get Involved', path: '/get-involved' },
    { name: 'Reports', path: '/reports' },
  ];

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 relative">
            {/* Logo */}
            <div className="flex-1 flex items-center justify-start">
              <Link to="/" className="flex items-center" data-testid="navbar-logo">
                <img src="/logo.jpg" alt="Charitage Foundation" className="h-16 w-auto object-contain" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 flex-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm font-semibold text-primary hover:text-secondary transition-colors duration-200"
                  data-testid={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center justify-end space-x-4 flex-1">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    data-testid="dashboard-button"
                  >
                    Dashboard
                  </Button>
                  <Button variant="ghost" onClick={logout} data-testid="logout-button">
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/auth')}
                  data-testid="login-button"
                >
                  Login
                </Button>
              )}
              <Button
                className="bg-secondary text-white hover:bg-secondary/90 shadow-button font-bold tracking-wide px-8 py-3 rounded-full"
                onClick={() => setShowDonate(true)}
                data-testid="donate-now-button"
              >
                Donate Now
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex-1 flex justify-end items-center">
              <button
                className="text-primary p-2"
                onClick={() => setIsOpen(!isOpen)}
                data-testid="mobile-menu-toggle"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden bg-white border-t" data-testid="mobile-menu">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block py-2 text-primary hover:text-secondary transition-colors"
                  onClick={() => setIsOpen(false)}
                  data-testid={`mobile-nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <>
                  <button
                    className="block w-full text-left py-2 text-primary"
                    onClick={() => {
                      navigate('/dashboard');
                      setIsOpen(false);
                    }}
                    data-testid="mobile-dashboard-button"
                  >
                    Dashboard
                  </button>
                  <button
                    className="block w-full text-left py-2 text-primary"
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
                  className="block w-full text-left py-2 text-primary"
                  onClick={() => {
                    navigate('/auth');
                    setIsOpen(false);
                  }}
                  data-testid="mobile-login-button"
                >
                  Login
                </button>
              )}
              <Button
                className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-full"
                onClick={() => {
                  setShowDonate(true);
                  setIsOpen(false);
                }}
                data-testid="mobile-donate-button"
              >
                Donate Now
              </Button>
            </div>
          </div>
        )}
      </nav>

      <DonateModal open={showDonate} onClose={() => setShowDonate(false)} />
    </>
  );
};
