import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ROLES = ['donor', 'volunteer', 'member', 'fundraiser', 'admin'];

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const changeRole = async (userId, newRole) => {
    try {
      await axios.put(`${API_URL}/admin/users/${userId}/role`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch { toast.error('Failed to update role'); }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold text-primary">Users & Roles</h1>
      <p className="text-muted-foreground">Manage users, assign roles, monitor registrations.</p>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted text-muted-foreground text-sm border-b">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Current Role</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium text-right">Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b hover:bg-muted/50">
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 text-sm">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'fundraiser' ? 'bg-blue-100 text-blue-700' :
                    u.role === 'member' ? 'bg-teal-100 text-teal-700' :
                    u.role === 'volunteer' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{u.role}</span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <select
                    value={u.role}
                    onChange={e => changeRole(u.id, e.target.value)}
                    className="border rounded p-1 text-sm"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="5" className="p-4 text-center text-muted-foreground py-8">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
