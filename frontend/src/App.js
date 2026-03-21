import '@/App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProgramsPage from './pages/ProgramsPage';
import GalleryPage from './pages/GalleryPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import GetInvolvedPage from './pages/GetInvolvedPage';
import ReportsPage from './pages/ReportsPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import { AuthProvider } from './context/AuthContext';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCampaigns } from './pages/admin/AdminCampaigns';
import { AdminBlogs } from './pages/admin/AdminBlogs';
import { AdminGallery } from './pages/admin/AdminGallery';
import { AdminDonations } from './pages/admin/AdminDonations';
import { AdminRegistrations } from './pages/admin/AdminRegistrations';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminLogin } from './pages/admin/AdminLogin';

function TitleUpdater() {
  const location = useLocation();
  useEffect(() => {
    const defaultTitle = 'Charitage Foundation';
    const routes = {
      '/': 'Charitage Foundation | Home',
      '/about': 'Charitage Foundation | About Us',
      '/programs': 'Charitage Foundation | Our Programs',
      '/gallery': 'Charitage Foundation | Gallery',
      '/blog': 'Charitage Foundation | Blog',
      '/get-involved': 'Charitage Foundation | Get Involved',
      '/reports': 'Charitage Foundation | Reports',
      '/auth': 'Charitage Foundation | Login',
      '/dashboard': 'Charitage Foundation | Dashboard',
      '/admin/login': 'Charitage Foundation | Admin Login'
    };
    
    if (location.pathname.startsWith('/blog/') && location.pathname !== '/blog') {
      document.title = 'Charitage Foundation | Blog Insight';
    } else if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
      document.title = 'Charitage Foundation | Admin Panel';
    } else {
      document.title = routes[location.pathname] || defaultTitle;
    }
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <TitleUpdater />
          <Routes>
            {/* Public Website Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            <Route path="/get-involved" element={<GetInvolvedPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Admin Login - Separate UI */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Panel Routes - Separate from website */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="campaigns" element={<AdminCampaigns />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="donations" element={<AdminDonations />} />
              <Route path="registrations" element={<AdminRegistrations />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </div>
    </AuthProvider>
  );
}

export default App;
