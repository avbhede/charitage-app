import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Calendar, User, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const StoriesPage = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await axios.get(`${API_URL}/stories`);
      setStories(res.data);
    } catch (err) {
      console.error('Failed to fetch stories:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50" data-testid="stories-page">
      <Navbar />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-primary text-white text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="inline-block bg-secondary/20 text-secondary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-secondary/30">
            Real Lives, Real Impact
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">Impact Stories</h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
            Inspiring journeys of resilience, hope, and transformation made possible by patrons like you.
          </p>
        </div>
      </section>

      {/* Stories Listing */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <Sparkles className="w-8 h-8 text-secondary animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Loading stories of transformation...</p>
            </div>
          ) : stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {stories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => navigate(`/stories/${story.id}`)}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col md:flex-row"
                  data-testid={`story-card-${story.id}`}
                >
                  <div className="md:w-1/2 relative h-64 md:h-auto overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={story.featured_image}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      {story.category}
                    </div>
                  </div>

                  <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-xs text-muted-foreground gap-3">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-secondary" />
                          {new Date(story.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {story.author}
                        </span>
                      </div>

                      <h2 className="text-xl md:text-2xl font-heading font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2">
                        {story.title}
                      </h2>

                      <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                        {story.description}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center font-bold text-xs text-secondary">
                      <span>Read Full Story</span>
                      <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No stories published yet.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StoriesPage;
