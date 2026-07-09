import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Calendar, MapPin, Image as ImageIcon, Video, ArrowRight, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ActivitiesPage = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${API_URL}/activities`);
      setActivities(res.data);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Education', 'Healthcare', 'Women Empowerment', 'Environment'];

  const filtered = activities.filter(
    (act) => selectedCategory === 'All' || act.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-slate-50/50" data-testid="activities-page">
      <Navbar />

      {/* Hero Banner */}
      <section className="py-16 md:py-24 bg-primary text-white text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="inline-block bg-secondary/20 text-secondary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-secondary/30">
            Ground Impact & Events
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">Our Ground Activities</h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
            Discover our live field activities, medical camps, educational distribution drives, and community development events across India.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-secondary text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                data-testid={`activity-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid Layout */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <Sparkles className="w-8 h-8 text-secondary animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Loading field activities...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => navigate(`/activities/${activity.id}`)}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
                  data-testid={`activity-card-${activity.id}`}
                >
                  <div className="relative h-60 overflow-hidden bg-slate-900">
                    <img
                      src={activity.media_url}
                      alt={activity.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                      {activity.media_type === 'video' ? <Video className="w-3.5 h-3.5 text-amber-400" /> : <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />}
                      {activity.category}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {activity.event_date && (
                          <span className="flex items-center font-medium">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-secondary" />
                            {new Date(activity.event_date).toLocaleDateString()}
                          </span>
                        )}
                        {activity.location && (
                          <span className="flex items-center text-slate-600 font-medium">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-rose-500" />
                            {activity.location}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-heading font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2">
                        {activity.title}
                      </h3>

                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {activity.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-secondary">
                      <span>View Gallery & Details</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No activities found in this category.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ActivitiesPage;
