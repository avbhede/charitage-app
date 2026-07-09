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
import ActivitiesPage from './pages/ActivitiesPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import StoriesPage from './pages/StoriesPage';
import StoryDetailPage from './pages/StoryDetailPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import ContactPage from './pages/ContactPage';
import RegisterPage from './pages/RegisterPage';
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
    const defaultTitle = 'Charitage Foundation | Leading With Kindness';
    const routes = {
      '/': 'Charitage Foundation | Home',
      '/about': 'Charitage Foundation | About Us',
      '/programs': 'Charitage Foundation | Our Programs',
      '/activities': 'Charitage Foundation | Field Activities',
      '/blogs': 'Charitage Foundation | Blogs & Insights',
      '/blog': 'Charitage Foundation | Blogs & Insights',
      '/stories': 'Charitage Foundation | Impact Stories',
      '/news': 'Charitage Foundation | News & Media',
      '/gallery': 'Charitage Foundation | Photo Gallery',
      '/register': 'Charitage Foundation | Community Registration',
      '/get-involved': 'Charitage Foundation | Get Involved',
      '/contact': 'Charitage Foundation | Contact Us',
      '/reports': 'Charitage Foundation | Reports & Certificates',
      '/auth': 'Charitage Foundation |  Login',
      '/dashboard': 'Charitage Foundation | My Dashboard',
      '/admin/login': 'Charitage Foundation | Admin Panel Login'
    };

    if (location.pathname.startsWith('/blogs/') || location.pathname.startsWith('/blog/')) {
      document.title = 'Charitage Foundation | Blog Insight';
    } else if (location.pathname.startsWith('/activities/')) {
      document.title = 'Charitage Foundation | Activity Details';
    } else if (location.pathname.startsWith('/stories/')) {
      document.title = 'Charitage Foundation | Story of Impact';
    } else if (location.pathname.startsWith('/news/')) {
      document.title = 'Charitage Foundation | News Article';
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
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/:id" element={<ActivityDetailPage />} />

            <Route path="/blogs" element={<BlogPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blogs/:slug" element={<BlogDetailPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />

            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/stories/:id" element={<StoryDetailPage />} />

            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />

            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/get-involved" element={<RegisterPage />} />

            <Route path="/contact" element={<ContactPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Panel Routes */}
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
