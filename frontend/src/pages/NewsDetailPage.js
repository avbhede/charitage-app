import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import CampaignShareModal from '../components/CampaignShareModal';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    fetchNewsItem();
  }, [id]);

  const fetchNewsItem = async () => {
    try {
      const res = await axios.get(`${API_URL}/news/${id}`);
      setNewsItem(res.data);
    } catch (err) {
      console.error('Failed to fetch news article:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="py-24 text-center text-muted-foreground">Loading news article...</div>
        <Footer />
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="py-24 text-center">
          <h2 className="text-2xl font-bold">News Article Not Found</h2>
          <Button onClick={() => navigate('/news')} className="mt-4">Back to News</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50" data-testid="news-detail-page">
      <Navbar />

      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/news')} className="text-slate-600 font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News & Media
          </Button>
          <Button variant="outline" onClick={() => setShowShare(true)} className="rounded-full">
            <Share2 className="w-4 h-4 mr-2 text-secondary" />
            Share Article
          </Button>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <div>
            <span className="inline-block bg-secondary/10 text-secondary px-3.5 py-1 rounded-full text-xs font-bold uppercase mb-3">
              {newsItem.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-primary mb-4 leading-tight">
              {newsItem.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-secondary" />
                {new Date(newsItem.published_at).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1 text-slate-400" />
                {newsItem.author}
              </span>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100">
            <img src={newsItem.image_url} alt={newsItem.title} className="w-full max-h-[500px] object-cover" />
          </div>

          <article className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-base sm:text-lg">
              {newsItem.content}
            </div>
          </article>
        </div>
      </section>

      <CampaignShareModal open={showShare} onClose={() => setShowShare(false)} campaign={newsItem} />
      <Footer />
    </div>
  );
};

export default NewsDetailPage;
