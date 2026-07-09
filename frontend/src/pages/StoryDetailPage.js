import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import CampaignShareModal from '../components/CampaignShareModal';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const StoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    fetchStory();
  }, [id]);

  const fetchStory = async () => {
    try {
      const res = await axios.get(`${API_URL}/stories/${id}`);
      setStory(res.data);
    } catch (err) {
      console.error('Failed to fetch story:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="py-24 text-center text-muted-foreground">Loading story...</div>
        <Footer />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="py-24 text-center">
          <h2 className="text-2xl font-bold">Story Not Found</h2>
          <Button onClick={() => navigate('/stories')} className="mt-4">Back to Stories</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50" data-testid="story-detail-page">
      <Navbar />

      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/stories')} className="text-slate-600 font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Impact Stories
          </Button>
          <Button variant="outline" onClick={() => setShowShare(true)} className="rounded-full">
            <Share2 className="w-4 h-4 mr-2 text-secondary" />
            Share Story
          </Button>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <div>
            <span className="inline-block bg-secondary/10 text-secondary px-3.5 py-1 rounded-full text-xs font-bold uppercase mb-3">
              {story.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-primary mb-4 leading-tight">
              {story.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-secondary" />
                {new Date(story.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1 text-slate-400" />
                By {story.author}
              </span>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100">
            <img src={story.featured_image} alt={story.title} className="w-full max-h-[500px] object-cover" />
          </div>

          <article className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-base sm:text-lg">
              {story.description}
            </div>
          </article>
        </div>
      </section>

      <CampaignShareModal open={showShare} onClose={() => setShowShare(false)} campaign={story} />
      <Footer />
    </div>
  );
};

export default StoryDetailPage;
