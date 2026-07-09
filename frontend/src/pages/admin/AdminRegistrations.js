import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Users, ShieldCheck, HelpCircle, Target, CheckCircle2, XCircle, Eye, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminRegistrations = () => {
  const [activeTab, setActiveTab] = useState('volunteers');
  const [volunteers, setVolunteers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [fundseekers, setFundseekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [vRes, mRes, iRes, fsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/volunteers`, config),
        axios.get(`${API_URL}/admin/memberships`, config),
        axios.get(`${API_URL}/admin/inquiries`, config),
        axios.get(`${API_URL}/admin/fundseekers`, config),
      ]);
      setVolunteers(vRes.data);
      setMemberships(mRes.data);
      setInquiries(iRes.data);
      setFundseekers(fsRes.data);
    } catch (err) {
      toast.error('Failed to load form submissions');
    } finally {
      setLoading(false);
    }
  };

  const updateVolunteerStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/admin/volunteers/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Volunteer application ${status}!`);
      fetchAllData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const updateMembershipStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/admin/memberships/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Membership status updated to ${status}!`);
      fetchAllData();
    } catch {
      toast.error('Failed to update membership status');
    }
  };

  const updateInquiryStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/admin/inquiries/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Inquiry marked as ${status}!`);
      fetchAllData();
    } catch {
      toast.error('Failed to update inquiry status');
    }
  };

  const approveFundseeker = async (id) => {
    try {
      await axios.post(`${API_URL}/admin/fundseekers/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Campaign proposal approved and published live on the website! 🎉');
      fetchAllData();
    } catch {
      toast.error('Failed to approve campaign proposal');
    }
  };

  const rejectFundseeker = async (id) => {
    try {
      await axios.post(`${API_URL}/admin/fundseekers/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Campaign proposal rejected.');
      fetchAllData();
    } catch {
      toast.error('Failed to reject proposal');
    }
  };

  if (loading) return <p className="text-muted-foreground p-6">Loading Form Submissions & Records...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary">Website Submissions & Registrations</h1>
        <p className="text-muted-foreground text-sm">
          Review and process all incoming forms submitted by donors, volunteers, members, and campaigners on the website.
        </p>
      </div>

      {/* Tabs Header */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('volunteers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'volunteers' ? 'bg-primary text-white shadow' : 'bg-white text-slate-700 border hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          Volunteers ({volunteers.length})
        </button>

        <button
          onClick={() => setActiveTab('memberships')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'memberships' ? 'bg-primary text-white shadow' : 'bg-white text-slate-700 border hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-secondary" />
          Foundation Members ({memberships.length})
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'inquiries' ? 'bg-primary text-white shadow' : 'bg-white text-slate-700 border hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          General Inquiries ({inquiries.length})
        </button>

        <button
          onClick={() => setActiveTab('fundseekers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'fundseekers' ? 'bg-primary text-white shadow' : 'bg-white text-slate-700 border hover:bg-slate-50'
          }`}
        >
          <Target className="w-4 h-4 text-rose-400" />
          Fund Seeker Proposals ({fundseekers.length})
        </button>
      </div>

      {/* TAB 1: VOLUNTEERS */}
      {activeTab === 'volunteers' && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b">
                <th className="p-4">Applicant</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">ID Proof / Age</th>
                <th className="p-4">Area of Interest</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr key={v.id} className="border-b hover:bg-slate-50/50 text-xs">
                  <td className="p-4 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      {v.photo_url ? (
                        <img src={v.photo_url} alt={v.name} className="w-9 h-9 rounded-full object-cover border" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary">
                          {v.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <span className="block font-bold">{v.name}</span>
                        <span className="text-[11px] text-muted-foreground">{v.city || 'Location N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="block text-slate-700 font-medium">{v.email}</span>
                    <span className="block text-muted-foreground">{v.phone}</span>
                  </td>
                  <td className="p-4 font-mono">
                    <span className="block">{v.id_proof_type || 'Aadhaar'}: {v.aadhaar_number || 'N/A'}</span>
                    <span className="block text-[11px] text-muted-foreground">Age: {v.age} • Gender: {v.gender}</span>
                  </td>
                  <td className="p-4 font-semibold text-secondary">{v.interest_area}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        v.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {v.status || 'pending'}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    {v.status !== 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => updateVolunteerStatus(v.id, 'approved')}
                      >
                        Approve
                      </Button>
                    )}
                    {v.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-rose-500 text-rose-700 hover:bg-rose-50"
                        onClick={() => updateVolunteerStatus(v.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {volunteers.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-muted-foreground text-xs">
                    No volunteer applications received yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: FOUNDATION MEMBERSHIPS */}
      {activeTab === 'memberships' && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b">
                <th className="p-4">Member Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Aadhaar Card</th>
                <th className="p-4">Plan & Fee</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((m) => (
                <tr key={m.id} className="border-b hover:bg-slate-50/50 text-xs">
                  <td className="p-4 font-bold text-slate-900">
                    <span className="block">{m.name}</span>
                    <span className="text-[11px] text-muted-foreground">Age: {m.age} (18+ Validated)</span>
                  </td>
                  <td className="p-4">
                    <span className="block text-slate-700 font-medium">{m.email}</span>
                    <span className="block text-muted-foreground">{m.phone}</span>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-800">{m.aadhaar_card}</td>
                  <td className="p-4">
                    <span className="block font-bold text-secondary capitalize">{m.membership_plan} Plan</span>
                    <span className="block text-slate-900 font-bold">₹{(m.plan_fee || 0).toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        m.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {m.status || 'active'}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    {m.status !== 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => updateMembershipStatus(m.id, 'approved')}
                      >
                        Approve
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {memberships.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-muted-foreground text-xs">
                    No foundation membership applications registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: GENERAL INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b">
                <th className="p-4">Contact Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Area of Interest</th>
                <th className="p-4">Message Summary</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr key={inq.id} className="border-b hover:bg-slate-50/50 text-xs">
                  <td className="p-4 font-bold text-slate-900">
                    <span className="block">{inq.name}</span>
                    <span className="text-[11px] text-muted-foreground">{inq.company_name || 'Individual'}</span>
                  </td>
                  <td className="p-4">
                    <span className="block text-slate-700 font-medium">{inq.email}</span>
                    <span className="block text-muted-foreground">{inq.phone}</span>
                  </td>
                  <td className="p-4 font-semibold text-amber-700">{inq.area_of_interest}</td>
                  <td className="p-4 max-w-xs truncate text-muted-foreground">{inq.message}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        inq.status === 'reviewed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inq.status || 'new'}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    {inq.status !== 'reviewed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-amber-500 text-amber-700 hover:bg-amber-50"
                        onClick={() => updateInquiryStatus(inq.id, 'reviewed')}
                      >
                        Mark Reviewed
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {inquiries.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-muted-foreground text-xs">
                    No website inquiries submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: FUND SEEKER PROPOSALS */}
      {activeTab === 'fundseekers' && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b">
                <th className="p-4">Campaign Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Target Goal</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody>
              {fundseekers.map((fs) => (
                <tr key={fs.id} className="border-b hover:bg-slate-50/50 text-xs">
                  <td className="p-4 font-bold text-primary">
                    <div className="flex items-center gap-3">
                      {fs.image_url && <img src={fs.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border" />}
                      <span>{fs.title}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground font-semibold">{fs.category}</td>
                  <td className="p-4 font-bold text-slate-900">₹{(fs.goal_amount || 0).toLocaleString()}</td>
                  <td className="p-4 max-w-xs truncate text-muted-foreground">{fs.description}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        fs.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fs.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {fs.status === 'active' ? 'Published Live' : fs.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    {fs.status !== 'active' && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs rounded-lg"
                        onClick={() => approveFundseeker(fs.id)}
                      >
                        Approve & Publish Live
                      </Button>
                    )}
                    {fs.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-rose-500 text-rose-700 hover:bg-rose-50 rounded-lg"
                        onClick={() => rejectFundseeker(fs.id)}
                      >
                        Reject
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {fundseekers.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-muted-foreground text-xs">
                    No user-submitted fund seeker campaign proposals yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRegistrations;
