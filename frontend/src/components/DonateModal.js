import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { RefreshCw } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DonateModal = ({ open, onClose, campaignId = null, campaignTitle = '' }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    donor_name: user?.name || '',
    donor_email: user?.email || '',
    donor_phone: user?.phone || '',
    donor_pan: user?.pan || '',
  });

  const predefinedAmounts = [500, 1000, 2500, 5000, 10000];

  const handleAmountSelect = (amount) => {
    setFormData({ ...formData, amount: amount.toString() });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      donor_name: user?.name || '',
      donor_email: user?.email || '',
      donor_phone: user?.phone || '',
      donor_pan: user?.pan || '',
    });
    setIsRecurring(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) < 100) {
      toast.error('Minimum donation amount is ₹100');
      return;
    }

    setLoading(true);

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Failed to load payment gateway');
        setLoading(false);
        return;
      }

      const orderResponse = await axios.post(`${API_URL}/donations/create-order`, {
        campaign_id: campaignId,
        amount: parseFloat(formData.amount),
        donor_name: formData.donor_name,
        donor_email: formData.donor_email,
        donor_phone: formData.donor_phone,
        donor_pan: formData.donor_pan || null,
        is_recurring: isRecurring,
      });

      const responseData = orderResponse.data;

      if (responseData.type === 'subscription') {
        // --- RECURRING SUBSCRIPTION FLOW ---
        const options = {
          key: responseData.key_id,
          subscription_id: responseData.subscription_id,
          name: 'Charitage Foundation',
          description: `Monthly Donation${campaignTitle ? ` - ${campaignTitle}` : ''}`,
          handler: async function (response) {
            try {
              await axios.post(`${API_URL}/donations/verify`, {
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              toast.success('Monthly donation activated! 🎉 Auto-debit will continue every month.');
              onClose();
              resetForm();
            } catch (error) {
              toast.error('Subscription verification failed');
            }
          },
          prefill: {
            name: formData.donor_name,
            email: formData.donor_email,
            contact: formData.donor_phone,
          },
          theme: {
            color: '#16225B',
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            }
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else {
        // --- ONE-TIME PAYMENT FLOW ---
        const { order_id, amount, currency, key_id } = responseData;

        const options = {
          key: key_id,
          amount: amount,
          currency: currency,
          name: 'Charitage Foundation',
          description: campaignTitle || 'General Donation',
          order_id: order_id,
          handler: async function (response) {
            try {
              await axios.post(`${API_URL}/donations/verify`, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              toast.success('Thank you for your generous donation! 🙏');
              onClose();
              resetForm();
            } catch (error) {
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: formData.donor_name,
            email: formData.donor_email,
            contact: formData.donor_phone,
          },
          theme: {
            color: '#16225B',
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            }
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Failed to process donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="donate-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">
            {campaignTitle ? `Support: ${campaignTitle}` : 'Make a Donation'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-sm font-semibold mb-3 block">Select Amount</Label>
            <div className="grid grid-cols-3 gap-3">
              {predefinedAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={formData.amount === amount.toString() ? 'default' : 'outline'}
                  className={`rounded-lg ${
                    formData.amount === amount.toString()
                      ? 'bg-secondary text-white'
                      : 'border-2 hover:border-secondary'
                  }`}
                  onClick={() => handleAmountSelect(amount)}
                  data-testid={`amount-${amount}`}
                >
                  ₹{amount.toLocaleString()}{isRecurring ? '/mo' : ''}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="custom-amount">Custom Amount (₹)</Label>
            <Input
              id="custom-amount"
              type="number"
              min="100"
              placeholder="Enter custom amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              data-testid="custom-amount-input"
            />
          </div>

          {/* Recurring / SIP Checkbox */}
          <div 
            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              isRecurring 
                ? 'border-secondary bg-secondary/5' 
                : 'border-gray-200 hover:border-secondary/40'
            }`}
            onClick={() => setIsRecurring(!isRecurring)}
          >
            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${
              isRecurring ? 'bg-secondary border-secondary' : 'border-gray-300'
            }`}>
              {isRecurring && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${isRecurring ? 'text-secondary' : 'text-muted-foreground'}`} />
                <span className="font-semibold text-sm">Enable Monthly Auto-Debit (SIP)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your selected amount will be auto-debited every month for 12 months. You can cancel anytime.
              </p>
            </div>
          </div>

          {isRecurring && formData.amount && (
            <div className="bg-secondary/10 border border-secondary/20 p-3 rounded-lg">
              <p className="text-sm font-medium text-secondary">
                📅 Monthly SIP: ₹{parseFloat(formData.amount).toLocaleString()}/month × 12 months = ₹{(parseFloat(formData.amount) * 12).toLocaleString()} total
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="donor-name">Full Name *</Label>
              <Input
                id="donor-name"
                required
                value={formData.donor_name}
                onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                data-testid="donor-name-input"
              />
            </div>
            <div>
              <Label htmlFor="donor-email">Email *</Label>
              <Input
                id="donor-email"
                type="email"
                required
                value={formData.donor_email}
                onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
                data-testid="donor-email-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="donor-phone">Phone Number *</Label>
              <Input
                id="donor-phone"
                required
                value={formData.donor_phone}
                onChange={(e) => setFormData({ ...formData, donor_phone: e.target.value })}
                data-testid="donor-phone-input"
              />
            </div>
            <div>
              <Label htmlFor="donor-pan">PAN (for 80G receipt)</Label>
              <Input
                id="donor-pan"
                value={formData.donor_pan}
                onChange={(e) => setFormData({ ...formData, donor_pan: e.target.value })}
                placeholder="Optional"
                data-testid="donor-pan-input"
              />
            </div>
          </div>

          <div className="bg-secondary/5 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              • Your donation is eligible for 80G tax benefits<br />
              • You will receive a digital receipt via email<br />
              • 100% secure payment via Razorpay<br />
              {isRecurring && '• Monthly auto-debit can be cancelled anytime from your bank or Razorpay'}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-full font-bold py-6 text-lg"
            disabled={loading}
            data-testid="proceed-payment-button"
          >
            {loading 
              ? 'Processing...' 
              : isRecurring 
                ? `Start Monthly SIP – ₹${formData.amount ? parseFloat(formData.amount).toLocaleString() : '0'}/mo`
                : 'Proceed to Payment'
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DonateModal;
