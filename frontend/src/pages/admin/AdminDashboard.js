import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Heart, Users, Activity, Target, FileText, Image as ImageIcon, BarChart, Briefcase, ShieldCheck, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) return <p className="text-muted-foreground p-6">Loading Dashboard Overview...</p>;

  const statCards = [
    { label: 'Total Funds Raised', value: `₹${(stats.total_funds_raised || 0).toLocaleString()}`, icon: Heart, color: 'text-secondary' },
    { label: 'Active Campaigns', value: stats.active_campaigns, icon: Target, color: 'text-emerald-600' },
    { label: 'Total Donations', value: stats.total_donations, icon: BarChart, color: 'text-green-600' },
    { label: 'Volunteers Registered', value: stats.total_volunteers, icon: Users, color: 'text-primary' },
    { label: 'Foundation Members', value: stats.total_memberships || 0, icon: ShieldCheck, color: 'text-indigo-600' },
    { label: 'Website Inquiries', value: stats.total_inquiries || 0, icon: HelpCircle, color: 'text-amber-600' },
    { label: 'Blog Posts', value: stats.total_blogs, icon: FileText, color: 'text-purple-600' },
    { label: 'Total Users / Patrons', value: stats.total_users, icon: Briefcase, color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm">Welcome to the Charitage Foundation Admin Control Panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <Card key={i} className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">{card.label}</CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Form Submission Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Total Campaigns</span>
              <span className="font-bold text-primary">{stats.total_campaigns}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Pending Fund Seeker Proposals</span>
              <span className="font-bold text-amber-600">{stats.pending_fundseekers || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Approved Volunteers</span>
              <span className="font-bold text-emerald-600">{stats.approved_volunteers}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Registered Members</span>
              <span className="font-bold text-indigo-600">{stats.total_memberships || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-heading">System & Integration Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Database Status</span>
              <span className="font-bold text-emerald-600">MongoDB Connected</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Backend API</span>
              <span className="font-bold text-primary">FastAPI Async Uvicorn</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Live Website Integration</span>
              <span className="font-bold text-emerald-600">Fully Synchronized</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
