import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { StatsSection } from '../components/StatsSection';
import { CampaignCard } from '../components/CampaignCard';
import { Button } from '../components/ui/button';
import { ArrowRight, Heart, Users, Target } from 'lucide-react';
import axios from 'axios';
import DonateModal from '../components/DonateModal';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HomePage = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [showDonate, setShowDonate] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campaignsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/campaigns?status=active`),
        axios.get(`${API_URL}/stats`),
      ]);
      setCampaigns(campaignsRes.data.slice(0, 3));
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      <Navbar />

      {/* Hero Section */}
      <section
        className="hero-section relative flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/18012463/pexels-photo-18012463.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)',
        }}
        data-testid="hero-section"
      >
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="max-w-3xl animate-slide-up">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 leading-tight">
              Empowering Communities,
              <br />
              <span className="text-secondary">Transforming Lives</span>
            </h1>
            <p className="text-base md:text-lg text-white/90 mb-8 leading-relaxed max-w-2xl">
              Join us in our mission to bring hope, dignity, and opportunity to underserved communities across India through education, healthcare, and sustainable development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-secondary text-white hover:bg-secondary/90 shadow-button font-bold tracking-wide px-8 py-6 rounded-full text-lg"
                onClick={() => setShowDonate(true)}
                data-testid="hero-donate-button"
              >
                Donate Now
                <Heart className="ml-2 w-5 h-5" fill="currentColor" />
              </Button>
              <Button
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white hover:text-primary bg-transparent backdrop-blur-sm font-medium px-8 py-6 rounded-full text-lg"
                onClick={() => navigate('/programs')}
                data-testid="hero-explore-button"
              >
                Explore Programs
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection stats={stats} />

      {/* About Preview */}
      <section className="py-16 md:py-24 bg-white" data-testid="about-preview">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
                Who We Are
              </span>
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-primary">
                Building Bridges of Hope Across India
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Charitage Foundation is dedicated to creating sustainable change in rural and underserved communities. Through our integrated approach to education, healthcare, and livelihood development, we've touched the lives of thousands of families.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-primary mb-1">Our Mission</h4>
                    <p className="text-sm text-muted-foreground">Empower communities through sustainable development</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-primary mb-1">Our Approach</h4>
                    <p className="text-sm text-muted-foreground">Community-driven, transparent, and impactful</p>
                  </div>
                </div>
              </div>
              <Button
                className="bg-primary text-white hover:bg-primary/90 rounded-full font-bold px-8 py-3"
                onClick={() => navigate('/about')}
                data-testid="learn-more-button"
              >
                Learn More About Us
              </Button>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/18012458/pexels-photo-18012458.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="Children in classroom"
                className="rounded-xl shadow-card-hover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16 md:py-24 bg-background" data-testid="featured-campaigns">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Our Programs
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-primary mb-4">
              Featured Campaigns
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Support our active campaigns and make a direct impact on communities in need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>

          <div className="text-center">
            <Button
              className="bg-primary text-white hover:bg-primary/90 rounded-full font-bold px-8 py-3"
              onClick={() => navigate('/programs')}
              data-testid="view-all-campaigns-button"
            >
              View All Programs
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white" data-testid="cta-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
            Your Support Can Change Lives
          </h2>
          <p className="text-base md:text-lg text-white/90 mb-8 max-w-3xl mx-auto">
            Every contribution makes a difference. Join thousands of donors who are helping us build a better future for underserved communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-secondary text-white hover:bg-secondary/90 shadow-button font-bold tracking-wide px-8 py-6 rounded-full text-lg"
              onClick={() => setShowDonate(true)}
              data-testid="cta-donate-button"
            >
              Make a Donation
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-primary rounded-full font-bold px-8 py-6 text-lg"
              onClick={() => navigate('/get-involved')}
              data-testid="cta-volunteer-button"
            >
              Become a Volunteer
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <DonateModal open={showDonate} onClose={() => setShowDonate(false)} />
    </div>
  );
};

export default HomePage;
