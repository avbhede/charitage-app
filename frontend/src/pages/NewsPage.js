import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Calendar, Tag, Newspaper, ArrowRight, Share2, Video } from 'lucide-react';
import { Button } from '../components/ui/button';
import CampaignShareModal from '../components/CampaignShareModal';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const NewsPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareItem, setShareItem] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axios.get(`${API_URL}/news`);
      setNews(res.data);
    } catch (err) {
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50" data-testid="news-page">
      <Navbar />

      <section className="py-16 md:py-24 bg-primary text-white text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="inline-block bg-secondary/20 text-secondary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-secondary/30">
            Press & Announcements
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">News & Media</h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
            Stay updated with Charitage Foundation's latest press releases, recognition, media coverage, and campaign launches.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20 text-muted-foreground text-sm">Loading latest news...</div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                  data-testid={`news-card-${item.id}`}
                >
                  <div className="cursor-pointer" onClick={() => navigate(`/news/${item.id}`)}>
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        {item.category}
                      </div>
                      {item.video_url && (
                        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white p-2 rounded-full">
                          <Video className="w-4 h-4 text-amber-400" />
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-secondary" />
                          {new Date(item.published_at).toLocaleDateString()}
                        </span>
                        <span>{item.author}</span>
                      </div>

                      <h2 className="text-xl font-heading font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2">
                        {item.title}
                      </h2>

                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {item.excerpt || item.content}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/news/${item.id}`)}
                      className="text-xs font-bold text-secondary p-0 hover:bg-transparent hover:underline"
                    >
                      Read Full Article <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                    <button
                      onClick={() => setShareItem(item)}
                      className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-secondary transition-colors"
                      data-testid={`news-share-btn-${item.id}`}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
              <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No news articles published yet.</p>
            </div>
          )}
        </div>
      </section>

      <CampaignShareModal open={Boolean(shareItem)} onClose={() => setShareItem(null)} campaign={shareItem} />
      <Footer />
    </div>
  );
};

export default NewsPage;
