import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Calendar, MapPin, ArrowLeft, Image as ImageIcon, Video, Share2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import CampaignShareModal from '../components/CampaignShareModal';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ActivityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    fetchActivity();
  }, [id]);

  const fetchActivity = async () => {
    try {
      const res = await axios.get(`${API_URL}/activities/${id}`);
      setActivity(res.data);
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="py-24 text-center text-muted-foreground">Loading activity detail...</div>
        <Footer />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="py-24 text-center">
          <h2 className="text-2xl font-bold">Activity Not Found</h2>
          <Button onClick={() => navigate('/activities')} className="mt-4">Back to Activities</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50" data-testid="activity-detail-page">
      <Navbar />

      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/activities')} className="text-slate-600 font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Activities
          </Button>
          <Button variant="outline" onClick={() => setShowShare(true)} className="rounded-full">
            <Share2 className="w-4 h-4 mr-2 text-secondary" />
            Share Activity
          </Button>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 space-y-8">
          <div>
            <span className="inline-block bg-secondary/10 text-secondary px-3.5 py-1 rounded-full text-xs font-bold uppercase mb-3">
              {activity.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-primary mb-4 leading-tight">
              {activity.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {activity.event_date && (
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-secondary" />
                  {new Date(activity.event_date).toLocaleDateString()}
                </span>
              )}
              {activity.location && (
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-rose-500" />
                  {activity.location}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900">
            <img src={activity.media_url} alt={activity.title} className="w-full max-h-[500px] object-cover" />
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-2xl font-heading font-bold text-primary">About this Activity</h2>
            <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
              {activity.description}
            </p>
          </div>

          {activity.gallery_urls && activity.gallery_urls.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-heading font-bold text-primary">Activity Photo Gallery</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activity.gallery_urls.map((url, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden shadow border border-slate-200 h-64">
                    <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <CampaignShareModal open={showShare} onClose={() => setShowShare(false)} campaign={activity} />
      <Footer />
    </div>
  );
};

export default ActivityDetailPage;
