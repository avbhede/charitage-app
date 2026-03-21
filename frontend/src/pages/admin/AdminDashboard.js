import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Heart, Users, Activity, Target, FileText, Image as ImageIcon, BarChart, Briefcase } from 'lucide-react';
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

  if (loading || !stats) return <p className="text-muted-foreground">Loading Dashboard...</p>;

  const statCards = [
    { label: 'Total Funds Raised', value: `₹${(stats.total_funds_raised || 0).toLocaleString()}`, icon: Heart, color: 'text-secondary' },
    { label: 'Active Campaigns', value: stats.active_campaigns, icon: Target, color: 'text-accent' },
    { label: 'Total Donations', value: stats.total_donations, icon: BarChart, color: 'text-green-600' },
    { label: 'Registered Volunteers', value: stats.total_volunteers, icon: Users, color: 'text-primary' },
    { label: 'Total Users', value: stats.total_users, icon: Briefcase, color: 'text-blue-600' },
    { label: 'Blog Posts', value: stats.total_blogs, icon: FileText, color: 'text-purple-600' },
    { label: 'Gallery Items', value: stats.total_gallery, icon: ImageIcon, color: 'text-orange-500' },
    { label: 'Beneficiaries', value: stats.total_beneficiaries, icon: Activity, color: 'text-secondary' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to the Charitage Foundation Control Panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <Card key={i} className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
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
            <CardTitle className="text-lg font-heading">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Total Campaigns</span>
              <span className="font-bold text-primary">{stats.total_campaigns}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Approved Volunteers</span>
              <span className="font-bold text-green-600">{stats.approved_volunteers}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Uploaded Documents</span>
              <span className="font-bold text-primary">{stats.total_documents}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-heading">System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Platform</span>
              <span className="font-bold text-primary">Charitage CMS v1.0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Backend</span>
              <span className="font-bold text-primary">FastAPI + MongoDB</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Payment Gateway</span>
              <span className="font-bold text-primary">Razorpay</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
