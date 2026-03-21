import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminReports = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { token } = useAuth();
  const [formData, setFormData] = useState({ title: '', category: '', file_url: '' });

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    try {
      const res = await axios.get(`${API_URL}/documents`);
      setDocuments(res.data);
    } catch { toast.error('Failed to load documents'); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/documents`, formData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Document added!');
      setIsFormOpen(false);
      setFormData({ title: '', category: '', file_url: '' });
      fetchDocs();
    } catch (err) { toast.error(err.response?.data?.detail || 'Error saving'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await axios.delete(`${API_URL}/documents/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Deleted!');
      fetchDocs();
    } catch { toast.error('Error deleting'); }
  };

  if (loading) return <p>Loading documents...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold text-primary">Reports & Documents</h1>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Document
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="">Select category</option>
                  <option value="Annual Report">Annual Report</option>
                  <option value="Financial Report">Financial Report</option>
                  <option value="Audit Report">Audit Report</option>
                  <option value="Activity Report">Activity Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">File URL (PDF/DOC link)</label>
                <input required type="url" className="w-full border p-2 rounded" value={formData.file_url} onChange={e => setFormData({...formData, file_url: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted text-muted-foreground text-sm border-b">
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id} className="border-b hover:bg-muted/50">
                <td className="p-4 font-medium">{doc.title}</td>
                <td className="p-4 text-sm">{doc.category}</td>
                <td className="p-4 text-sm text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</td>
                <td className="p-4 flex justify-end gap-2">
                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm underline">View</a>
                  <button onClick={() => handleDelete(doc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr><td colSpan="4" className="p-4 text-center text-muted-foreground py-8">No documents uploaded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
