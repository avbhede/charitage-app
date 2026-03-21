import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminRegistrations = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => { fetchVolunteers(); }, []);

  const fetchVolunteers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/volunteers`, { headers: { Authorization: `Bearer ${token}` } });
      setVolunteers(res.data);
    } catch { toast.error('Failed to load registrations'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/admin/volunteers/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Registration ${status}!`);
      fetchVolunteers();
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return <p>Loading registrations...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold text-primary">Registrations</h1>
      <p className="text-muted-foreground">Manage volunteer, member, and partner applications.</p>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted text-muted-foreground text-sm border-b">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">Interest</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map(v => (
              <tr key={v.id} className="border-b hover:bg-muted/50">
                <td className="p-4 font-medium">{v.name}</td>
                <td className="p-4 text-sm">{v.email}</td>
                <td className="p-4 text-sm">{v.phone}</td>
                <td className="p-4 text-sm">{v.interest_area}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    v.status === 'approved' ? 'bg-green-100 text-green-700' :
                    v.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {v.status}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-2">
                  {v.status !== 'approved' && (
                    <Button size="sm" variant="outline" className="text-xs border-green-500 text-green-600 hover:bg-green-50" onClick={() => updateStatus(v.id, 'approved')}>
                      Approve
                    </Button>
                  )}
                  {v.status !== 'rejected' && (
                    <Button size="sm" variant="outline" className="text-xs border-red-500 text-red-600 hover:bg-red-50" onClick={() => updateStatus(v.id, 'rejected')}>
                      Reject
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {volunteers.length === 0 && (
              <tr><td colSpan="6" className="p-4 text-center text-muted-foreground py-8">No registrations yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
