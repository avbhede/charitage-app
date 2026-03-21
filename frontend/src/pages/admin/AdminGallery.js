import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { token } = useAuth();
  const [formData, setFormData] = useState({ title: '', type: 'image', url: '', thumbnail_url: '', category: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_URL}/gallery`);
      setItems(res.data);
    } catch { toast.error('Failed to load gallery'); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/gallery`, formData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Gallery item added!');
      setIsFormOpen(false);
      setFormData({ title: '', type: 'image', url: '', thumbnail_url: '', category: '' });
      fetchItems();
    } catch (err) { toast.error(err.response?.data?.detail || 'Error adding item'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this gallery item?')) return;
    try {
      await axios.delete(`${API_URL}/gallery/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Deleted!');
      fetchItems();
    } catch { toast.error('Error deleting'); }
  };

  if (loading) return <p>Loading gallery...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold text-primary">Manage Gallery</h1>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select className="w-full border p-2 rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL (image link or YouTube/Vimeo URL)</label>
                <input required type="url" className="w-full border p-2 rounded" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category / Album</label>
                <input required className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Events, Education" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden group relative">
            {item.type === 'image' ? (
              <img src={item.url} alt={item.title} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-sm text-muted-foreground">🎬 Video</div>
            )}
            <div className="p-3">
              <p className="font-medium text-sm truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.category} · {item.type}</p>
            </div>
            <button onClick={() => handleDelete(item.id)} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No gallery items yet.</p>}
      </div>
    </div>
  );
};
