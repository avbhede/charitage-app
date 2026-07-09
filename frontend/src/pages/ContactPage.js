import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Youtube, Landmark } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import BankDetailsSection from '../components/BankDetailsSection';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    area_of_interest: 'General Contact',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/inquiries`, form);
      toast.success('Thank you for contacting Charitage Foundation! We will respond within 24 hours.');
      setForm({
        name: '',
        email: '',
        phone: '',
        area_of_interest: 'General Contact',
        message: ''
      });
    } catch (err) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50" data-testid="contact-page">
      <Navbar />

      {/* Header Banner */}
      <section className="py-16 md:py-24 bg-primary text-white text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="inline-block bg-secondary/20 text-secondary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-secondary/30">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">Contact Us</h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
            We are here to answer your queries, facilitate corporate partnerships, and welcome patrons to our center.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Top Contact Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Address */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-primary mb-1">Registered Address</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Charitage Foundation Trust<br />
                  Plot No 31, Pandan Road Wathoda Layout, Bhandewadi, NAGPUR, Maharashtra, INDIA - 440008
                </p>
              </div>
            </div>

            {/* Phone & Working Hours */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-primary mb-1">Phone & Operating Hours</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  +91 7770093373<br />
                  <span className="text-xs text-slate-500">Mon - Sat: 9:30 AM - 6:30 PM</span>
                </p>
              </div>
            </div>

            {/* Email & Socials */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-primary mb-1">Email & Social Links</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  info@charitage.org
                </p>
                <div className="flex space-x-3 text-slate-600">
                  <a href="https://www.facebook.com/profile.php?id=61588498050844" target="_blank" rel="noreferrer" className="hover:text-secondary"><Facebook className="w-4 h-4" /></a>
                  <a href="https://www.instagram.com/charitage_foundation?igsh=c2ZndHlpdGZjNWx2" target="_blank" rel="noreferrer" className="hover:text-secondary"><Instagram className="w-4 h-4" /></a>
                  <a href="https://youtube.com/@charitagefoundationngo?si=hNQP2ruWtrQm1oVf" target="_blank" rel="noreferrer" className="hover:text-secondary"><Youtube className="w-4 h-4" /></a>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Bank Details Section: RTGS / NEFT / IMPS */}
          <div className="space-y-4">
            <BankDetailsSection />
          </div>

          {/* Direct Inquiry Message Form */}
          <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <div className="text-center">
              <span className="inline-block bg-secondary/10 text-secondary px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                Inquiries & Support
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-primary">Send Us a Direct Message</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fill out the form below and our trust response team will get back to you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="c-name" className="text-xs font-semibold">Your Full Name *</Label>
                <Input
                  id="c-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl h-11"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="c-email" className="text-xs font-semibold">Email Address *</Label>
                  <Input
                    id="c-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="c-phone" className="text-xs font-semibold">Phone Number *</Label>
                  <Input
                    id="c-phone"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="c-msg" className="text-xs font-semibold">Your Message *</Label>
                <textarea
                  id="c-msg"
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full p-3 rounded-xl border border-input text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-full font-bold py-6 text-base shadow-lg shadow-orange-500/20"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Sending Message...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
