import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { FileUploadBox } from '../components/FileUploadBox';
import { Heart, Users, Target, HelpCircle, ShieldCheck, Mail, Lock, KeyRound, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTabParam = searchParams.get('tab') || 'donor';
  const [activeTab, setActiveTab] = useState(activeTabParam);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // 1. Donor Registration State
  const [donorForm, setDonorForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    pan: ''
  });

  // 2. Fund Seeker Campaign Submission State
  const [fundseekerForm, setFundseekerForm] = useState({
    title: '',
    category: 'Education',
    goal_amount: '',
    description: '',
    image_url: 'https://images.pexels.com/photos/18012463/pexels-photo-18012463.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    beneficiaries_count: 50
  });

  // 3. General Inquiry Form State
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    area_of_interest: 'General CSR Partnership',
    message: ''
  });

  // 4. Foundation Member State
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    aadhaar_card: '',
    membership_plan: 'annual',
    plan_fee: 1000,
    age: 25,
    address: ''
  });

  // 5. Volunteer Registration State
  const [volunteerForm, setVolunteerForm] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '1998-05-12',
    age: 28,
    gender: 'Male',
    id_proof_type: 'Aadhaar Card',
    aadhaar_number: '',
    city: 'Mumbai',
    photo_url: '',
    interest_area: 'Teaching & Mentorship',
    message: ''
  });

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab'));
    }
  }, [searchParams]);

  // Handle Donor Register
  const handleDonorRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        ...donorForm,
        role: 'donor'
      });
      localStorage.setItem('token', res.data.access_token);
      toast.success(`Welcome to Charitage Foundation, ${donorForm.name}! ✉️ Welcome email dispatched.`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your registered email');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email: forgotEmail });
      toast.success(res.data.message);
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (err) {
      toast.error('Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  // Handle Fund Seeker Submit
  const handleFundseekerSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please login or register as a donor first to submit campaigns');
      setActiveTab('donor');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/fundseekers/campaigns`,
        {
          title: fundseekerForm.title,
          category: fundseekerForm.category,
          goal_amount: parseFloat(fundseekerForm.goal_amount),
          description: fundseekerForm.description,
          image_url: fundseekerForm.image_url || 'https://images.pexels.com/photos/18012463/pexels-photo-18012463.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
          beneficiaries_count: parseInt(fundseekerForm.beneficiaries_count)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      setFundseekerForm({
        title: '',
        category: 'Education',
        goal_amount: '',
        description: '',
        image_url: '',
        beneficiaries_count: 50
      });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit campaign');
    } finally {
      setLoading(false);
    }
  };

  // Handle General Inquiry Submit
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/inquiries`, inquiryForm);
      toast.success('Thank you! Your inquiry has been received. Our team will contact you shortly.');
      setInquiryForm({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        area_of_interest: 'General CSR Partnership',
        message: ''
      });
    } catch (err) {
      toast.error('Failed to submit inquiry');
    } finally {
      setLoading(false);
    }
  };

  // Handle Foundation Member Submit
  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    if (memberForm.age < 18) {
      toast.error('Foundation Members must be at least 18 years of age.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/memberships`, memberForm);
      toast.success('Foundation Member Registration successful! Welcome to the Charitage Trust.');
      setMemberForm({
        name: '',
        email: '',
        phone: '',
        aadhaar_card: '',
        membership_plan: 'annual',
        plan_fee: 1000,
        age: 25,
        address: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Volunteer Submit
  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/volunteers`, volunteerForm);
      toast.success('Volunteer application submitted successfully! Pending admin approval.');
      setVolunteerForm({
        name: '',
        email: '',
        phone: '',
        date_of_birth: '1998-05-12',
        age: 28,
        gender: 'Male',
        id_proof_type: 'Aadhaar Card',
        aadhaar_number: '',
        city: 'Mumbai',
        photo_url: '',
        interest_area: 'Teaching & Mentorship',
        message: ''
      });
    } catch (err) {
      toast.error('Failed to submit volunteer application');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (plan) => {
    let fee = 1000;
    if (plan === '5_years') fee = 4500;
    if (plan === '10_years') fee = 8000;
    setMemberForm({ ...memberForm, membership_plan: plan, plan_fee: fee });
  };

  return (
    <div className="min-h-screen bg-slate-50/50" data-testid="register-module-page">
      <Navbar />

      <section className="py-14 bg-primary text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-secondary/20 text-secondary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-secondary/30">
            Join Our Mission
          </span>
          <h1 className="text-3xl md:text-5xl font-heading font-bold mb-3">Registration & Community Hub</h1>
          <p className="text-base text-white/80 max-w-2xl mx-auto">
            Choose your role and register to get involved with Charitage Foundation as a Patron, Campaigner, Member, or Volunteer.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-6 bg-white border-b border-slate-200 sticky top-20 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-4xl w-full">
            <button
              onClick={() => setActiveTab('donor')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'donor' ? 'bg-secondary text-white shadow-md' : 'text-slate-600 hover:text-primary'
              }`}
              data-testid="tab-donor"
            >
              <Heart className="w-4 h-4" />
              Donor Registration
            </button>

            <button
              onClick={() => setActiveTab('fundseeker')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'fundseeker' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:text-primary'
              }`}
              data-testid="tab-fundseeker"
            >
              <Target className="w-4 h-4" />
              Fund Seeker
            </button>

            <button
              onClick={() => setActiveTab('member')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'member' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-primary'
              }`}
              data-testid="tab-member"
            >
              <ShieldCheck className="w-4 h-4" />
              Foundation Member
            </button>

            <button
              onClick={() => setActiveTab('volunteer')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'volunteer' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-primary'
              }`}
              data-testid="tab-volunteer"
            >
              <Users className="w-4 h-4" />
              Volunteer
            </button>

            <button
              onClick={() => setActiveTab('inquiry')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'inquiry' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-600 hover:text-primary'
              }`}
              data-testid="tab-inquiry"
            >
              <HelpCircle className="w-4 h-4" />
              General Inquiry
            </button>
          </div>
        </div>
      </section>

      {/* Main Form Content Container */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* TAB 1: DONOR REGISTRATION */}
          {activeTab === 'donor' && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6" data-testid="donor-registration-form">
              <div>
                <h2 className="text-2xl font-heading font-bold text-primary">Donor Registration</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Default Role: <strong className="text-secondary">Donor</strong>. Create an account to track contributions and receive tax receipts.
                </p>
              </div>

              <form onSubmit={handleDonorRegister} className="space-y-4">
                <div>
                  <Label htmlFor="donor-reg-name" className="text-xs font-semibold">Full Name *</Label>
                  <Input
                    id="donor-reg-name"
                    required
                    value={donorForm.name}
                    onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="donor-reg-email" className="text-xs font-semibold">Email Address *</Label>
                    <Input
                      id="donor-reg-email"
                      type="email"
                      required
                      value={donorForm.email}
                      onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="donor-reg-pass" className="text-xs font-semibold">Password *</Label>
                    <Input
                      id="donor-reg-pass"
                      type="password"
                      required
                      value={donorForm.password}
                      onChange={(e) => setDonorForm({ ...donorForm, password: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="donor-reg-phone" className="text-xs font-semibold">Phone Number *</Label>
                    <Input
                      id="donor-reg-phone"
                      required
                      value={donorForm.phone}
                      onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="donor-reg-pan" className="text-xs font-semibold">PAN Card (for 80G Receipts)</Label>
                    <Input
                      id="donor-reg-pan"
                      value={donorForm.pan}
                      onChange={(e) => setDonorForm({ ...donorForm, pan: e.target.value })}
                      placeholder="ABCDE1234F"
                      className="rounded-xl h-11 uppercase"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-secondary font-bold hover:underline"
                    data-testid="forgot-password-link"
                  >
                    Forgot Password?
                  </button>
                  <span className="text-xs text-muted-foreground">Welcome credentials dispatched via email</span>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-full font-bold py-6 text-base shadow-lg shadow-orange-500/20"
                  data-testid="donor-register-submit"
                >
                  {loading ? 'Creating Account...' : 'Complete Donor Registration'}
                </Button>
              </form>
            </div>
          )}

          {/* TAB 2: FUND SEEKER REGISTRATION & CAMPAIGN SUBMISSION */}
          {activeTab === 'fundseeker' && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6" data-testid="fundseeker-registration-form">
              <div>
                <h2 className="text-2xl font-heading font-bold text-primary">Fund Seeker Campaign Submission</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Submit a fundraising campaign proposal. All campaigns require <strong className="text-rose-600">Admin Approval</strong> before going live.
                </p>
              </div>

              <form onSubmit={handleFundseekerSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fs-title" className="text-xs font-semibold">Campaign Title *</Label>
                  <Input
                    id="fs-title"
                    required
                    placeholder="e.g. Clean Drinking Water for 5 Villages"
                    value={fundseekerForm.title}
                    onChange={(e) => setFundseekerForm({ ...fundseekerForm, title: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fs-category" className="text-xs font-semibold">Category *</Label>
                    <select
                      id="fs-category"
                      value={fundseekerForm.category}
                      onChange={(e) => setFundseekerForm({ ...fundseekerForm, category: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                      <option value="Education">Education</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Women Empowerment">Women Empowerment</option>
                      <option value="Environment">Environment</option>
                      <option value="Disaster Relief">Disaster Relief</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="fs-goal" className="text-xs font-semibold">Target Goal Amount (₹) *</Label>
                    <Input
                      id="fs-goal"
                      type="number"
                      required
                      min="5000"
                      placeholder="100000"
                      value={fundseekerForm.goal_amount}
                      onChange={(e) => setFundseekerForm({ ...fundseekerForm, goal_amount: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fs-desc" className="text-xs font-semibold">Campaign Description & Impact Goal *</Label>
                  <textarea
                    id="fs-desc"
                    required
                    rows={4}
                    placeholder="Detailed explanation of why funds are required and how beneficiaries will be served..."
                    value={fundseekerForm.description}
                    onChange={(e) => setFundseekerForm({ ...fundseekerForm, description: e.target.value })}
                    className="w-full p-3 rounded-xl border border-input text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    {/* Native File Manager Upload for Campaign Cover Image */}
                    <FileUploadBox
                      value={fundseekerForm.image_url}
                      onChange={(url) => setFundseekerForm({ ...fundseekerForm, image_url: url })}
                      label="Campaign Cover Image (Browse from Computer File Manager)"
                      accept="image/*"
                      fileTypeLabel="Images (JPG, PNG, WEBP)"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="fs-ben" className="text-xs font-semibold">Estimated Beneficiaries Count</Label>
                    <Input
                      id="fs-ben"
                      type="number"
                      value={fundseekerForm.beneficiaries_count}
                      onChange={(e) => setFundseekerForm({ ...fundseekerForm, beneficiaries_count: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900">
                  ⚠️ Note: Campaign proposals start in <strong>Pending Status</strong>. Our trust review committee will evaluate your proposal within 24-48 hours.
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white hover:bg-primary/90 rounded-full font-bold py-6 text-base"
                >
                  {loading ? 'Submitting Proposal...' : 'Submit Campaign for Approval'}
                </Button>
              </form>
            </div>
          )}

          {/* TAB 3: FOUNDATION MEMBER REGISTRATION */}
          {activeTab === 'member' && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6" data-testid="member-registration-form">
              <div>
                <h2 className="text-2xl font-heading font-bold text-primary">Foundation Member Registration</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Join Charitage Foundation as an official registered member (18+ Age Validation Required).
                </p>
              </div>

              <form onSubmit={handleMemberSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="mem-name" className="text-xs font-semibold">Full Name *</Label>
                  <Input
                    id="mem-name"
                    required
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mem-email" className="text-xs font-semibold">Email Address *</Label>
                    <Input
                      id="mem-email"
                      type="email"
                      required
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mem-phone" className="text-xs font-semibold">Phone Number *</Label>
                    <Input
                      id="mem-phone"
                      required
                      value={memberForm.phone}
                      onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mem-aadhaar" className="text-xs font-semibold">Aadhaar Card Number *</Label>
                    <Input
                      id="mem-aadhaar"
                      required
                      placeholder="12 digit Aadhaar Number"
                      value={memberForm.aadhaar_card}
                      onChange={(e) => setMemberForm({ ...memberForm, aadhaar_card: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mem-age" className="text-xs font-semibold">Age (18+ Validation) *</Label>
                    <Input
                      id="mem-age"
                      type="number"
                      min="18"
                      required
                      value={memberForm.age}
                      onChange={(e) => setMemberForm({ ...memberForm, age: parseInt(e.target.value) || 18 })}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold uppercase text-muted-foreground block mb-2">Select Membership Plan</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { plan: 'annual', label: 'Annual', fee: 1000 },
                      { plan: '5_years', label: '5 Years', fee: 4500 },
                      { plan: '10_years', label: '10 Years', fee: 8000 },
                    ].map((p) => (
                      <button
                        key={p.plan}
                        type="button"
                        onClick={() => handlePlanChange(p.plan)}
                        className={`p-4 rounded-2xl border text-center transition-all ${
                          memberForm.membership_plan === p.plan
                            ? 'border-secondary bg-secondary/10 font-bold text-secondary'
                            : 'border-slate-200 text-slate-700 hover:border-secondary'
                        }`}
                      >
                        <span className="block text-sm font-heading">{p.label}</span>
                        <span className="block text-xs font-bold text-slate-900 mt-1">₹{p.fee.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center text-sm font-semibold">
                  <span>Selected Membership Plan Fee:</span>
                  <span className="text-lg font-bold text-secondary">₹{memberForm.plan_fee.toLocaleString()}</span>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-full font-bold py-6 text-base"
                >
                  {loading ? 'Processing...' : `Submit Membership Application (₹${memberForm.plan_fee.toLocaleString()})`}
                </Button>
              </form>
            </div>
          )}

          {/* TAB 4: VOLUNTEER REGISTRATION */}
          {activeTab === 'volunteer' && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6" data-testid="volunteer-registration-form">
              <div>
                <h2 className="text-2xl font-heading font-bold text-primary">Volunteer Registration</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Join our grassroots volunteer team for field activities, drives, and event execution.
                </p>
              </div>

              <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="vol-name" className="text-xs font-semibold">Full Name *</Label>
                  <Input
                    id="vol-name"
                    required
                    value={volunteerForm.name}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vol-email" className="text-xs font-semibold">Email Address *</Label>
                    <Input
                      id="vol-email"
                      type="email"
                      required
                      value={volunteerForm.email}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, email: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vol-phone" className="text-xs font-semibold">Phone Number *</Label>
                    <Input
                      id="vol-phone"
                      required
                      value={volunteerForm.phone}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, phone: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="vol-dob" className="text-xs font-semibold">Date of Birth *</Label>
                    <Input
                      id="vol-dob"
                      type="date"
                      required
                      value={volunteerForm.date_of_birth}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, date_of_birth: e.target.value })}
                      className="rounded-xl h-11 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vol-age" className="text-xs font-semibold">Age *</Label>
                    <Input
                      id="vol-age"
                      type="number"
                      required
                      value={volunteerForm.age}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, age: parseInt(e.target.value) || 18 })}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vol-gender" className="text-xs font-semibold">Gender *</Label>
                    <select
                      id="vol-gender"
                      value={volunteerForm.gender}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, gender: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-input bg-white text-sm"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vol-idtype" className="text-xs font-semibold">ID Proof Type *</Label>
                    <select
                      id="vol-idtype"
                      value={volunteerForm.id_proof_type}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, id_proof_type: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-input bg-white text-sm"
                    >
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="PAN Card">PAN Card</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="Passport">Passport</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="vol-aadhaar" className="text-xs font-semibold">Aadhaar / ID Number *</Label>
                    <Input
                      id="vol-aadhaar"
                      required
                      value={volunteerForm.aadhaar_number}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, aadhaar_number: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="vol-city" className="text-xs font-semibold">City *</Label>
                    <Input
                      id="vol-city"
                      required
                      value={volunteerForm.city}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, city: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div>
                    {/* Native File Manager Upload for Volunteer Photo */}
                    <FileUploadBox
                      value={volunteerForm.photo_url}
                      onChange={(url) => setVolunteerForm({ ...volunteerForm, photo_url: url })}
                      label="Volunteer Passport Photo (Browse from Computer File Manager)"
                      accept="image/*"
                      fileTypeLabel="Photo (JPG, PNG, WEBP)"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="vol-interest" className="text-xs font-semibold">Area of Interest *</Label>
                  <select
                    id="vol-interest"
                    value={volunteerForm.interest_area}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, interest_area: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-input bg-white text-sm"
                  >
                    <option value="Teaching & Mentorship">Teaching & Mentorship</option>
                    <option value="Medical Camp Assistance">Medical Camp Assistance</option>
                    <option value="Event Organization">Event Organization</option>
                    <option value="Social Media & Content">Social Media & Content</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="vol-msg" className="text-xs font-semibold">Why do you want to volunteer? *</Label>
                  <textarea
                    id="vol-msg"
                    required
                    rows={3}
                    value={volunteerForm.message}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, message: e.target.value })}
                    className="w-full p-3 rounded-xl border border-input text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 rounded-full font-bold py-6 text-base"
                >
                  {loading ? 'Submitting...' : 'Submit Volunteer Application'}
                </Button>
              </form>
            </div>
          )}

          {/* TAB 5: GENERAL INQUIRY FORM */}
          {activeTab === 'inquiry' && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6" data-testid="general-inquiry-form">
              <div>
                <h2 className="text-2xl font-heading font-bold text-primary">General Inquiry Form</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Have questions, CSR partnership queries, or press requests? Get in touch with our team.
                </p>
              </div>

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <Label htmlFor="inq-name" className="text-xs font-semibold">Full Name *</Label>
                  <Input
                    id="inq-name"
                    required
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inq-email" className="text-xs font-semibold">Email Address *</Label>
                    <Input
                      id="inq-email"
                      type="email"
                      required
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inq-phone" className="text-xs font-semibold">Phone Number *</Label>
                    <Input
                      id="inq-phone"
                      required
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inq-company" className="text-xs font-semibold">Company / Organization Name</Label>
                    <Input
                      id="inq-company"
                      placeholder="Optional"
                      value={inquiryForm.company_name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, company_name: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inq-area" className="text-xs font-semibold">Area of Interest *</Label>
                    <select
                      id="inq-area"
                      value={inquiryForm.area_of_interest}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, area_of_interest: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-input bg-white text-sm"
                    >
                      <option value="General CSR Partnership">General CSR Partnership</option>
                      <option value="Education Projects">Education Projects</option>
                      <option value="Healthcare Drives">Healthcare Drives</option>
                      <option value="Media & Press Inquiry">Media & Press Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="inq-msg" className="text-xs font-semibold">Message / Query Details *</Label>
                  <textarea
                    id="inq-msg"
                    required
                    rows={4}
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                    className="w-full p-3 rounded-xl border border-input text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-600 text-white hover:bg-amber-700 rounded-full font-bold py-6 text-base"
                >
                  {loading ? 'Sending Inquiry...' : 'Submit General Inquiry'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Forgot Password Modal */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="max-w-md rounded-3xl p-6" data-testid="forgot-password-modal">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-bold text-primary flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-secondary" />
              Reset Your Password
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-4 mt-2">
            <p className="text-xs text-muted-foreground">
              Enter your registered email address below. Password reset instructions and credentials will be sent to your inbox.
            </p>
            <div>
              <Label htmlFor="forgot-email" className="text-xs font-semibold">Registered Email</Label>
              <Input
                id="forgot-email"
                type="email"
                required
                placeholder="your.email@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-secondary text-white rounded-full font-bold py-3 text-xs">
              {loading ? 'Processing...' : 'Send Reset Link'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default RegisterPage;
