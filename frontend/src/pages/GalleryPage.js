import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Play } from 'lucide-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const GalleryPage = () => {
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await axios.get(`${API_URL}/gallery`);
      const data = response.data;
      setPhotos(data.filter((item) => item.type === 'photo'));
      setVideos(data.filter((item) => item.type === 'video'));
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
    }
  };

  return (
    <div className="min-h-screen" data-testid="gallery-page">
      <Navbar />

      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">Gallery</h1>
          <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto">
            Moments that capture our impact and the smiles we create
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="photos">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="photos" data-testid="tab-photos">Photos</TabsTrigger>
              <TabsTrigger value="videos" data-testid="tab-videos">Videos</TabsTrigger>
            </TabsList>

            <TabsContent value="photos">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group overflow-hidden rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300"
                    data-testid={`photo-${photo.id}`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4">
                        <h3 className="text-white font-heading font-semibold">{photo.title}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {photos.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No photos available yet.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="videos">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="relative group overflow-hidden rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300"
                    data-testid={`video-${video.id}`}
                  >
                    <img
                      src={video.thumbnail_url || 'https://via.placeholder.com/400x300?text=Video'}
                      alt={video.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-8 h-8 text-secondary ml-1" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="text-white font-heading font-semibold">{video.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
              {videos.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No videos available yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GalleryPage;
