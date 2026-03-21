import { useState } from 'react';
import { Link, useNavigate, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Users, BarChart, Settings, LayoutDashboard, Heart, Image as ImageIcon, Briefcase, FileText, Menu, X, LogOut } from 'lucide-react';
import { Button } from './ui/button';

export const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Campaigns', icon: Heart, path: '/admin/campaigns' },
    { label: 'Donations', icon: BarChart, path: '/admin/donations' },
    { label: 'Blogs', icon: FileText, path: '/admin/blogs' },
    { label: 'Gallery', icon: ImageIcon, path: '/admin/gallery' },
    { label: 'Users & Roles', icon: Users, path: '/admin/users' },
    { label: 'Registrations', icon: Briefcase, path: '/admin/registrations' },
    { label: 'Reports', icon: FileText, path: '/admin/reports' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-muted/50 font-body">
      {/* Sidebar */}
      <aside className={`bg-primary text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} fixed md:relative z-50 h-full min-h-screen`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10 h-20">
          <div className={`font-heading font-bold overflow-hidden transition-all ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
            Charitage CMS
          </div>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-5rem)]">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
              title={!isSidebarOpen ? item.label : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-all ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b h-20 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center space-x-1">
              <Home className="w-4 h-4" />
              <span>Back to Website</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-right hidden sm:block">
              <div className="font-semibold text-primary">{user.name}</div>
              <div className="text-muted-foreground text-xs capitalize">{user.role}</div>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <span className="font-bold text-primary">{user.name.charAt(0)}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-secondary rounded-full hover:bg-muted transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
