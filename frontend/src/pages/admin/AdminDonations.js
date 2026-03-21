import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState({});
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [donRes, campRes] = await Promise.all([
        axios.get(`${API_URL}/admin/donations`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/campaigns`)
      ]);
      setDonations(donRes.data);
      const campMap = {};
      campRes.data.forEach(c => { campMap[c.id] = c.title; });
      setCampaigns(campMap);
    } catch {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = donations.filter(d => d.status === 'completed' || d.status === 'active').reduce((sum, d) => sum + d.amount, 0);
  const completedCount = donations.filter(d => d.status === 'completed').length;
  const recurringCount = donations.filter(d => d.is_recurring).length;
  const activeSubscriptions = donations.filter(d => d.is_recurring && d.status === 'active').length;

  if (loading) return <p>Loading donations...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-heading font-bold text-primary">Donations</h1>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">₹{totalAmount.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">One-Time</p>
            <p className="text-2xl font-bold text-primary">{completedCount}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">SIP/Recurring</p>
            <p className="text-2xl font-bold text-purple-600">{recurringCount}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Active SIPs</p>
            <p className="text-2xl font-bold text-secondary">{activeSubscriptions}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-muted text-muted-foreground text-sm border-b">
              <th className="p-4 font-medium">Donor</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Campaign</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Payment ID</th>
              <th className="p-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {donations.map(d => (
              <tr key={d.id} className="border-b hover:bg-muted/50">
                <td className="p-4 font-medium">{d.donor_name}</td>
                <td className="p-4 text-sm">{d.donor_email}</td>
                <td className="p-4 text-sm font-bold">
                  ₹{d.amount.toLocaleString()}
                  {d.is_recurring && <span className="text-xs text-muted-foreground">/mo</span>}
                </td>
                <td className="p-4">
                  {d.is_recurring ? (
                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                      <RefreshCw className="w-3 h-3" /> SIP
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">One-Time</span>
                  )}
                </td>
                <td className="p-4 text-sm">
                  {d.campaign_id ? (
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      {campaigns[d.campaign_id] || 'Unknown Campaign'}
                    </span>
                  ) : (
                    <span className="bg-gray-50 text-gray-500 px-2 py-1 rounded text-xs">General</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    d.status === 'completed' ? 'bg-green-100 text-green-700' :
                    d.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {d.status === 'active' ? '● Active SIP' : d.status}
                  </span>
                </td>
                <td className="p-4 text-xs text-muted-foreground font-mono">
                  {d.razorpay_payment_id || d.razorpay_subscription_id || '—'}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(d.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </td>
              </tr>
            ))}
            {donations.length === 0 && (
              <tr><td colSpan="8" className="p-4 text-center text-muted-foreground py-8">No donations yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
