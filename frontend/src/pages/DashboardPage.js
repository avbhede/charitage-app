import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Heart, Calendar, IndianRupee, Download } from 'lucide-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchDonations();
    }
  }, [user, authLoading, navigate]);

  const fetchDonations = async () => {
    try {
      const response = await axios.get(`${API_URL}/donations/user/${user.id}`);
      setDonations(response.data);
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalDonated = donations
    .filter((d) => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="dashboard-page">
      <Navbar />

      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Welcome, {user?.name}!</h1>
          <p className="text-base md:text-lg text-white/90">
            Thank you for being a part of our mission to transform lives.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                <Heart className="w-4 h-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold text-primary">
                  {donations.filter((d) => d.status === 'completed').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Successful contributions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <IndianRupee className="w-4 h-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold text-primary">
                  ₹{totalDonated.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Lifetime contributions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impact</CardTitle>
                <Calendar className="w-4 h-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold text-primary">
                  {Math.floor(totalDonated / 500)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Lives impacted</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-heading">Donation History</CardTitle>
            </CardHeader>
            <CardContent>
              {donations.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't made any donations yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      data-testid={`donation-${donation.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-heading font-semibold text-primary">
                            ₹{donation.amount.toLocaleString()}
                          </h3>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                              donation.status === 'completed'
                                ? 'bg-accent/10 text-accent'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {donation.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(donation.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        {donation.razorpay_payment_id && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Payment ID: {donation.razorpay_payment_id}
                          </p>
                        )}
                      </div>
                      {donation.status === 'completed' && (
                        <button
                          className="flex items-center space-x-2 text-sm text-secondary hover:text-secondary/80"
                          data-testid={`download-receipt-${donation.id}`}
                        >
                          <Download className="w-4 h-4" />
                          <span>Receipt</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DashboardPage;
