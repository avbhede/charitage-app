import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Award, Heart, ShieldCheck, Sparkles } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const TopDonorsSection = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopDonors();
  }, []);

  const fetchTopDonors = async () => {
    try {
      const res = await axios.get(`${API_URL}/donations/top-donors`);
      setDonors(res.data);
    } catch (err) {
      console.error('Error fetching top donors:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-pulse flex justify-center items-center gap-2 text-muted-foreground">
            <Sparkles className="w-5 h-5 text-secondary animate-spin" />
            <span>Loading Wall of Honor...</span>
          </div>
        </div>
      </section>
    );
  }

  if (donors.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden" data-testid="top-donors-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/20">
            <Award className="w-4 h-4 text-amber-500" />
            Wall of Honor
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-primary mb-4">
            Our Top Champions & Donors
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Honoring leaders and patrons who have contributed ₹5,000 or above to fuel life-changing education, healthcare, and community initiatives across India.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {donors.map((donor, idx) => (
            <div
              key={donor.id || idx}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group"
              data-testid={`top-donor-card-${idx}`}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-secondary/15 to-transparent rounded-bl-3xl flex items-start justify-end p-2.5">
                <span className="text-xs font-extrabold text-secondary">#{idx + 1}</span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary font-heading font-bold text-xl flex-shrink-0 group-hover:bg-secondary group-hover:text-white transition-colors">
                  {donor.donor_name ? donor.donor_name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base text-primary leading-tight line-clamp-1">
                    {donor.donor_name}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Patron
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contribution</p>
                  <p className="text-xl font-heading font-extrabold text-secondary mt-0.5">
                    ₹{donor.amount.toLocaleString()}
                    {donor.is_recurring && <span className="text-xs font-normal text-muted-foreground">/mo</span>}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-rose-500">
                  <Heart className="w-4 h-4 fill-rose-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopDonorsSection;
