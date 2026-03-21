import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image_url: '',
    category: '',
    author: '',
    tags: ''
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/blogs`);
      setBlogs(response.data);
    } catch (error) {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const openForm = (blog = null) => {
    if (blog) {
      setCurrentBlog(blog.slug);
      setFormData({
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt,
        image_url: blog.image_url,
        category: blog.category,
        author: blog.author,
        tags: blog.tags.join(', ')
      });
    } else {
      setCurrentBlog(null);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        image_url: '',
        category: '',
        author: '',
        tags: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (currentBlog) {
        await axios.put(`${API_URL}/blogs/${currentBlog}`, payload, config);
        toast.success("Blog updated successfully!");
      } else {
        await axios.post(`${API_URL}/blogs`, payload, config);
        toast.success("Blog created successfully!");
      }
      setIsFormOpen(false);
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error saving blog");
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await axios.delete(`${API_URL}/blogs/${slug}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Blog deleted!");
      fetchBlogs();
    } catch (error) {
      toast.error("Error deleting blog");
    }
  };

  if (loading) return <p>Loading blogs...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold text-primary">Manage Blogs</h1>
        <Button onClick={() => openForm()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Blog
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-xl font-bold mb-4">{currentBlog ? 'Edit Blog' : 'New Blog'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required type="text" className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Author</label>
                <input required type="text" className="w-full border p-2 rounded" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input required type="text" className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Health" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input required type="url" className="w-full border p-2 rounded" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Excerpt (Short Summary)</label>
                <input required type="text" className="w-full border p-2 rounded" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <input type="text" className="w-full border p-2 rounded" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="NGO, Education, Charity" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content (Markdown / Text)</label>
              <textarea required className="w-full border p-2 rounded h-48" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">Save Blog</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted text-muted-foreground text-sm border-b">
              <th className="p-4 font-medium">Blog Title</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Author</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map(blog => (
              <tr key={blog.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="p-4 font-medium">{blog.title}</td>
                <td className="p-4 text-sm text-muted-foreground">{blog.category}</td>
                <td className="p-4 text-sm">{blog.author}</td>
                <td className="p-4 text-sm">
                  {new Date(blog.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => openForm(blog)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(blog.slug)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {blogs.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-muted-foreground py-8">No blogs found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
