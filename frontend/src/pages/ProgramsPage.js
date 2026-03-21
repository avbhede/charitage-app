import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CampaignCard } from '../components/CampaignCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProgramsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${API_URL}/campaigns`);
      setCampaigns(response.data);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    }
  };

  const filterCampaigns = (status) => {
    if (status === 'all') return campaigns;
    return campaigns.filter((c) => c.status === status);
  };

  return (
    <div className="min-h-screen" data-testid="programs-page">
      <Navbar />

      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">Our Programs</h1>
          <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto">
            Discover our initiatives across education, healthcare, and community development
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="all" data-testid="tab-all">All Campaigns</TabsTrigger>
              <TabsTrigger value="active" data-testid="tab-active">Active</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {campaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="active" className="mt-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filterCampaigns('active').map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {campaigns.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No campaigns available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProgramsPage;
