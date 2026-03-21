import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    goal_amount: '',
    image_url: '',
    beneficiaries_count: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${API_URL}/campaigns`);
      setCampaigns(response.data);
    } catch (error) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const openForm = (campaign = null) => {
    if (campaign) {
      setCurrentCampaign(campaign.id);
      setFormData({
        title: campaign.title,
        description: campaign.description,
        category: campaign.category,
        goal_amount: campaign.goal_amount,
        image_url: campaign.image_url,
        beneficiaries_count: campaign.beneficiaries_count
      });
    } else {
      setCurrentCampaign(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        goal_amount: '',
        image_url: '',
        beneficiaries_count: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        goal_amount: parseFloat(formData.goal_amount),
        beneficiaries_count: parseInt(formData.beneficiaries_count) || 0
      };
      
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (currentCampaign) {
        await axios.put(`${API_URL}/campaigns/${currentCampaign}`, payload, config);
        toast.success("Campaign updated successfully!");
      } else {
        await axios.post(`${API_URL}/campaigns`, payload, config);
        toast.success("Campaign created successfully!");
      }
      setIsFormOpen(false);
      fetchCampaigns();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error saving campaign");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await axios.delete(`${API_URL}/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Campaign deleted!");
      fetchCampaigns();
    } catch (error) {
      toast.error("Error deleting campaign");
    }
  };

  if (loading) return <p>Loading campaigns...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold text-primary">Manage Campaigns</h1>
        <Button onClick={() => openForm()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Campaign
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-xl font-bold mb-4">{currentCampaign ? 'Edit Campaign' : 'New Campaign'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required type="text" className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input required type="text" className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Education, Health" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Goal Amount (₹)</label>
                <input required type="number" className="w-full border p-2 rounded" value={formData.goal_amount} onChange={e => setFormData({...formData, goal_amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input required type="url" className="w-full border p-2 rounded" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea required className="w-full border p-2 rounded h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">Save Campaign</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted text-muted-foreground text-sm border-b">
              <th className="p-4 font-medium">Campaign</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Goal</th>
              <th className="p-4 font-medium">Raised</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(camp => (
              <tr key={camp.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="p-4 font-medium">{camp.title}</td>
                <td className="p-4 text-sm text-muted-foreground">{camp.category}</td>
                <td className="p-4 text-sm">₹{camp.goal_amount.toLocaleString()}</td>
                <td className="p-4 text-sm font-medium text-green-600">₹{camp.raised_amount.toLocaleString()}</td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => openForm(camp)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(camp.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-muted-foreground py-8">No campaigns found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
