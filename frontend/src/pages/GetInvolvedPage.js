import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { Users, UserPlus, Heart } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const GetInvolvedPage = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest_area: '',
    message: '',
  });

  const interestAreas = [
    'Education',
    'Healthcare',
    'Women Empowerment',
    'Rural Development',
    'Fundraising',
    'Event Management',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/volunteers`, formData);
      toast.success('Thank you! We will contact you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        interest_area: '',
        message: '',
      });
    } catch (error) {
      console.error('Failed to submit:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" data-testid="get-involved-page">
      <Navbar />

      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">Get Involved</h1>
          <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto">
            Join our mission to transform lives across India
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-primary mb-3">
                Become a Volunteer
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dedicate your time and skills to make a direct impact in communities
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-primary mb-3">
                Become a Member
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Join our community of changemakers and support our long-term mission
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-primary mb-3">
                Corporate Partnerships
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Partner with us for CSR initiatives and employee engagement programs
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-card">
            <h2 className="text-3xl font-heading font-bold text-primary text-center mb-8">
              Volunteer Application
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    data-testid="volunteer-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    data-testid="volunteer-email-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="volunteer-phone-input"
                  />
                </div>
                <div>
                  <Label htmlFor="interest">Area of Interest *</Label>
                  <Select
                    value={formData.interest_area}
                    onValueChange={(value) => setFormData({ ...formData, interest_area: value })}
                  >
                    <SelectTrigger data-testid="volunteer-interest-select">
                      <SelectValue placeholder="Select an area" />
                    </SelectTrigger>
                    <SelectContent>
                      {interestAreas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Why do you want to volunteer? *</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your motivation and how you'd like to contribute..."
                  data-testid="volunteer-message-input"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-full font-bold py-6 text-lg"
                disabled={loading}
                data-testid="volunteer-submit-button"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GetInvolvedPage;
