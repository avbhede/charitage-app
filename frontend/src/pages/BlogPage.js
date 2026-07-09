import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Calendar, Tag, Plus, Search, PenTool, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { FileUploadBox } from '../components/FileUploadBox';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BlogPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'Impact',
    excerpt: '',
    content: '',
    image_url: 'https://images.pexels.com/photos/18012463/pexels-photo-18012463.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    tags: 'Education, Community, Impact',
    author: user?.name || 'Charitage Patron'
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/blogs`);
      setBlogs(response.data);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    }
  };

  const categories = ['All', 'Education', 'Healthcare', 'Women Empowerment', 'Impact', 'Stories'];

  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateBlogSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to create and publish blog posts');
      navigate('/auth');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const tagList = blogForm.tags.split(',').map((t) => t.trim()).filter(Boolean);

      await axios.post(
        `${API_URL}/blogs`,
        {
          title: blogForm.title,
          category: blogForm.category,
          excerpt: blogForm.excerpt,
          content: blogForm.content,
          image_url: blogForm.image_url || 'https://images.pexels.com/photos/18012463/pexels-photo-18012463.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
          tags: tagList,
          author: blogForm.author || user.name
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Blog post published successfully! 🎉');
      setShowCreateModal(false);
      setBlogForm({
        title: '',
        category: 'Impact',
        excerpt: '',
        content: '',
        image_url: '',
        tags: 'Education, Community',
        author: user?.name || ''
      });
      fetchBlogs();
    } catch (error) {
      console.error('Failed to publish blog:', error);
      toast.error(error.response?.data?.detail || 'Failed to publish blog post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50" data-testid="blogs-page">
      <Navbar />

      {/* Header Banner */}
      <section className="py-16 md:py-20 bg-primary text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-block bg-secondary/20 text-secondary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-secondary/30">
            Field Insights & News
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">Blogs</h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Stories of hope, grassroots developments, and perspectives from our volunteers, patrons, and impact champions across India.
          </p>

          <Button
            onClick={() => {
              if (!user) {
                toast.info('Please login to create a blog post');
                navigate('/auth');
              } else {
                setShowCreateModal(true);
              }
            }}
            className="bg-secondary text-white hover:bg-secondary/90 rounded-full font-bold px-8 py-3 shadow-lg shadow-orange-500/20"
            data-testid="create-blog-btn"
          >
            <PenTool className="w-4 h-4 mr-2" />
            Create & Publish Blog Post
          </Button>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
              <Input
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-full bg-slate-50 border-slate-200"
                data-testid="blog-search-input"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  data-testid={`blog-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Cards Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <article
                  key={blog.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
                  onClick={() => navigate(`/blogs/${blog.slug}`)}
                  data-testid={`blog-card-${blog.id}`}
                >
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      {blog.category}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-secondary" />
                          {new Date(blog.created_at).toLocaleDateString()}
                        </span>
                        <span className="font-semibold text-slate-700">By {blog.author}</span>
                      </div>

                      <h2 className="text-xl font-heading font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2">
                        {blog.title}
                      </h2>

                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    </div>

                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                        {blog.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px] text-slate-600 font-medium"
                          >
                            <Tag className="w-3 h-3 mr-1 text-slate-400" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
              <PenTool className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-heading font-bold text-primary">No Blog Posts Found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Be the first to share a story or update with the Charitage community!
              </p>
              <Button
                onClick={() => (user ? setShowCreateModal(true) : navigate('/auth'))}
                className="bg-secondary text-white rounded-full font-bold px-6 py-2 text-xs"
              >
                Create Blog Post
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Modal for Registered Users to Create & Publish Blog Posts */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8" data-testid="create-blog-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-primary flex items-center gap-2">
              <PenTool className="w-6 h-6 text-secondary" />
              Create & Publish Blog Post
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateBlogSubmit} className="space-y-5 mt-2">
            <div>
              <Label htmlFor="blog-title" className="text-xs font-semibold">Title *</Label>
              <Input
                id="blog-title"
                required
                placeholder="Enter blog title"
                value={blogForm.title}
                onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                className="rounded-xl"
                data-testid="blog-title-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="blog-category" className="text-xs font-semibold">Category *</Label>
                <select
                  id="blog-category"
                  value={blogForm.category}
                  onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                  data-testid="blog-category-select"
                >
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Women Empowerment">Women Empowerment</option>
                  <option value="Impact">Impact</option>
                  <option value="Stories">Stories</option>
                </select>
              </div>
              <div>
                <Label htmlFor="blog-author" className="text-xs font-semibold">Author Name</Label>
                <Input
                  id="blog-author"
                  value={blogForm.author}
                  onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                  className="rounded-xl"
                  data-testid="blog-author-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="blog-excerpt" className="text-xs font-semibold">Short Summary / Excerpt *</Label>
              <Input
                id="blog-excerpt"
                required
                placeholder="Brief 1-2 sentence overview of your post"
                value={blogForm.excerpt}
                onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                className="rounded-xl"
                data-testid="blog-excerpt-input"
              />
            </div>

            <div>
              <Label htmlFor="blog-content" className="text-xs font-semibold">Full Blog Content *</Label>
              <textarea
                id="blog-content"
                required
                rows={6}
                placeholder="Write your blog post content here..."
                value={blogForm.content}
                onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                className="w-full p-3 rounded-xl border border-input text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                data-testid="blog-content-input"
              />
            </div>

            {/* Native File Manager Upload */}
            <FileUploadBox
              value={blogForm.image_url}
              onChange={(url) => setBlogForm({ ...blogForm, image_url: url })}
              label="Cover Image (Browse from Computer File Manager)"
              accept="image/*"
              fileTypeLabel="Images (JPG, PNG, WEBP)"
            />

            <div>
              <Label htmlFor="blog-tags" className="text-xs font-semibold">Tags (comma separated)</Label>
              <Input
                id="blog-tags"
                placeholder="Education, Community, Rural"
                value={blogForm.tags}
                onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                className="rounded-xl"
                data-testid="blog-tags-input"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-full font-bold py-3 text-base shadow-md"
              data-testid="publish-blog-submit"
            >
              {submitting ? 'Publishing...' : 'Publish Blog Post Now'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default BlogPage;
