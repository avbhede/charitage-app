import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Heart, Gift, ShieldCheck, Download, CheckCircle2, Info } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DonateModal = ({ open, onClose, campaignId = null, campaignTitle = '' }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [donationType, setDonationType] = useState('monthly'); // 'monthly' (Default) or 'one-time'
  const [durationMonths, setDurationMonths] = useState(1200);
  const [tipOption, setTipOption] = useState('10'); // '0', '5', '10', '15', 'custom'
  const [customTip, setCustomTip] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const [formData, setFormData] = useState({
    amount: '1000',
    donor_name: user?.name || '',
    donor_email: user?.email || '',
    donor_phone: user?.phone || '',
    donor_pan: user?.pan || '',
    gift_address: '',
  });

  const predefinedAmounts = [500, 1000, 2500, 5000, 10000];
  const durationOptions = [
    { label: '3 Months', value: 3 },
    { label: '6 Months', value: 6 },
    { label: '12 Months (1 Yr)', value: 12 },
    { label: '24 Months (2 Yrs)', value: 24 },
    { label: '36 Months (3 Yrs)', value: 36 },
  ];

  const handleAmountSelect = (amount) => {
    setFormData({ ...formData, amount: amount.toString() });
  };

  const calculateTip = () => {
    const baseAmount = parseFloat(formData.amount) || 0;
    if (tipOption === 'custom') {
      return parseFloat(customTip) || 0;
    }
    const pct = parseFloat(tipOption) || 0;
    return Math.round((baseAmount * pct) / 100);
  };

  const tipAmount = calculateTip();
  const baseAmountNum = parseFloat(formData.amount) || 0;
  const totalAmountNum = baseAmountNum + tipAmount;

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
      amount: '1000',
      donor_name: user?.name || '',
      donor_email: user?.email || '',
      donor_phone: user?.phone || '',
      donor_pan: user?.pan || '',
      gift_address: '',
    });
    setDonationType('monthly');
    setDurationMonths(1200);
    setTipOption('10');
    setCustomTip('');
    setIsAnonymous(false);
    setReceiptData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || baseAmountNum < 100) {
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

      const isRecurring = donationType === 'monthly';

      const orderResponse = await axios.post(`${API_URL}/donations/create-order`, {
        campaign_id: campaignId,
        amount: baseAmountNum,
        tip_amount: tipAmount,
        donor_name: formData.donor_name,
        donor_email: formData.donor_email,
        donor_phone: formData.donor_phone,
        donor_pan: formData.donor_pan || null,
        is_recurring: isRecurring,
        duration_months: durationMonths,
        gift_address: (isRecurring && baseAmountNum >= 5000) ? formData.gift_address : null,
        is_anonymous: isAnonymous,
      });

      const responseData = orderResponse.data;

      const handlePaymentSuccess = async (verifyPayload) => {
        try {
          const verifyRes = await axios.post(`${API_URL}/donations/verify`, verifyPayload);
          toast.success(isRecurring ? 'Monthly SIP donation activated! 🎉' : 'Thank you for your generous donation! 🙏');

          const donId = responseData.donation_id || verifyRes.data.donation_id;
          if (donId) {
            try {
              const recRes = await axios.get(`${API_URL}/donations/receipt/${donId}`);
              setReceiptData(recRes.data);
            } catch (rErr) {
              console.error('Receipt fetch error:', rErr);
            }
          } else {
            onClose();
            resetForm();
          }
        } catch (error) {
          toast.error('Payment verification failed');
        } finally {
          setLoading(false);
        }
      };

      if (responseData.type === 'subscription') {
        const options = {
          key: responseData.key_id,
          subscription_id: responseData.subscription_id,
          name: 'Charitage Foundation',
          description: `Monthly SIP Donation${campaignTitle ? ` - ${campaignTitle}` : ''}`,
          handler: function (response) {
            handlePaymentSuccess({
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
          prefill: {
            name: formData.donor_name,
            email: formData.donor_email,
            contact: formData.donor_phone,
          },
          theme: { color: '#16225B' },
          modal: { ondismiss: () => setLoading(false) }
        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else {
        const options = {
          key: responseData.key_id,
          amount: responseData.amount,
          currency: responseData.currency,
          name: 'Charitage Foundation',
          description: campaignTitle || 'Direct Foundation Donation',
          order_id: responseData.order_id,
          handler: function (response) {
            handlePaymentSuccess({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
          prefill: {
            name: formData.donor_name,
            email: formData.donor_email,
            contact: formData.donor_phone,
          },
          theme: { color: '#16225B' },
          modal: { ondismiss: () => setLoading(false) }
        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Failed to process donation. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => { onClose(); resetForm(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8" data-testid="donate-modal">
        {receiptData ? (
          /* Receipt View */
          <div className="space-y-6 text-center py-4" data-testid="donation-receipt-view">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-bold text-primary">Donation Receipt Issued!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Receipt #{receiptData.receipt_number} has been sent to <span className="font-semibold text-primary">{receiptData.donor_email}</span>.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Donor Name:</span>
                <span className="font-bold text-primary">{receiptData.donor_name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Purpose / Campaign:</span>
                <span className="font-bold text-primary">{receiptData.campaign_title}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Donation Amount:</span>
                <span className="font-bold text-secondary text-sm">₹{receiptData.amount.toLocaleString()}</span>
              </div>
              {receiptData.tip_amount > 0 && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Optional Platform Tip:</span>
                  <span className="font-bold text-amber-600">₹{receiptData.tip_amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Total Paid:</span>
                <span className="font-bold text-primary text-sm">₹{receiptData.total_paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Tax Benefit Status:</span>
                <span className="font-bold text-emerald-600">80G Eligible (50% Deduction)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction Ref:</span>
                <span className="font-bold text-slate-700">{receiptData.payment_id}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => window.print()}
                className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-full font-bold py-3"
                data-testid="download-receipt-btn"
              >
                <Download className="w-4 h-4 mr-2" />
                Download / Print Receipt
              </Button>
              <Button
                variant="outline"
                onClick={() => { onClose(); resetForm(); }}
                className="flex-1 rounded-full py-3"
                data-testid="close-receipt-btn"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* Main Donation Form */
          <>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-heading font-bold text-primary">
                {campaignTitle ? `Support Campaign: ${campaignTitle}` : 'Make a Donation'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Requirement 4: Monthly SIP vs One-Time Toggle */}
              <div>
                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground block mb-2">
                  Donation Mode
                </Label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setDonationType('monthly')}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${donationType === 'monthly'
                      ? 'bg-secondary text-white shadow-md'
                      : 'text-slate-600 hover:text-primary'
                      }`}
                    data-testid="mode-monthly"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Donate Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setDonationType('one-time')}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${donationType === 'one-time'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-slate-600 hover:text-primary'
                      }`}
                    data-testid="mode-one-time"
                  >
                    <Heart className="w-4 h-4" />
                    Donate One-Time
                  </button>
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground block mb-2">
                  Select Donation Amount (₹)
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-3">
                  {predefinedAmounts.map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant={formData.amount === amt.toString() ? 'default' : 'outline'}
                      className={`rounded-xl py-5 font-bold ${formData.amount === amt.toString()
                        ? 'bg-secondary text-white border-secondary'
                        : 'border-slate-200 hover:border-secondary text-slate-800'
                        }`}
                      onClick={() => handleAmountSelect(amt)}
                      data-testid={`amount-chip-${amt}`}
                    >
                      ₹{amt.toLocaleString()}{donationType === 'monthly' ? '/mo' : ''}
                    </Button>
                  ))}
                </div>
                <Input
                  id="custom-amount"
                  type="number"
                  min="100"
                  placeholder="Or enter custom amount in ₹"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="rounded-xl h-11"
                  data-testid="custom-amount-input"
                />
              </div>

              {/* Requirement 4: Indefinite SIP Auto-Pay Info */}
              {donationType === 'monthly' && (
                <div className="bg-secondary/5 p-4 rounded-2xl border border-secondary/20 space-y-2">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    📅 Monthly auto-debit of <span className="font-bold text-secondary">₹{baseAmountNum.toLocaleString()}/mo</span>. Active until cancelled. You can pause or cancel anytime from your UPI/payment app or bank account.
                  </p>
                </div>
              )}

              {/* Requirement 4: Conditional Postal Address Field if Monthly & >= ₹5,000 */}
              {donationType === 'monthly' && baseAmountNum >= 5000 && (
                <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30 space-y-2 animate-fadeIn" data-testid="postal-address-section">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
                    <Gift className="w-4 h-4 text-amber-600" />
                    Gift Delivery Address (Eligible for Monthly Donor Patron Gift)
                  </div>
                  <p className="text-xs text-amber-900/80">
                    As a valued Monthly SIP donor contributing ₹5,000+/month, we would love to send you a complimentary Charitage patron gift kit!
                  </p>
                  <Input
                    placeholder="Enter full postal address with PIN code"
                    value={formData.gift_address}
                    onChange={(e) => setFormData({ ...formData, gift_address: e.target.value })}
                    className="bg-white rounded-xl border-amber-300"
                    data-testid="gift-address-input"
                  />
                </div>
              )}

              {/* Requirement 5: Donation Tip Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3" data-testid="tip-section">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-primary font-bold">Charitage charges 0% platform fees</strong> and relies on your support. Add an optional tip to help us continue our work.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {['0', '5', '10', '15'].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => { setTipOption(pct); setCustomTip(''); }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${tipOption === pct
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                        }`}
                      data-testid={`tip-chip-${pct}`}
                    >
                      {pct === '0' ? 'No Tip' : `${pct}% (₹${Math.round((baseAmountNum * parseFloat(pct)) / 100)})`}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTipOption('custom')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${tipOption === 'custom'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                      }`}
                    data-testid="tip-chip-custom"
                  >
                    Custom
                  </button>
                </div>

                {tipOption === 'custom' && (
                  <Input
                    type="number"
                    min="0"
                    placeholder="Enter custom tip amount in ₹"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    className="bg-white rounded-xl h-10 text-xs"
                    data-testid="custom-tip-input"
                  />
                )}
              </div>

              {/* Donor Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="donor-name" className="text-xs font-semibold">Full Name *</Label>
                  <Input
                    id="donor-name"
                    required
                    value={formData.donor_name}
                    onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                    className="rounded-xl"
                    data-testid="donor-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="donor-email" className="text-xs font-semibold">Email *</Label>
                  <Input
                    id="donor-email"
                    type="email"
                    required
                    value={formData.donor_email}
                    onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
                    className="rounded-xl"
                    data-testid="donor-email-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="donor-phone" className="text-xs font-semibold">Phone Number *</Label>
                  <Input
                    id="donor-phone"
                    required
                    value={formData.donor_phone}
                    onChange={(e) => setFormData({ ...formData, donor_phone: e.target.value })}
                    className="rounded-xl"
                    data-testid="donor-phone-input"
                  />
                </div>
                <div>
                  <Label htmlFor="donor-pan" className="text-xs font-semibold">PAN (for 80G tax receipt)</Label>
                  <Input
                    id="donor-pan"
                    value={formData.donor_pan}
                    onChange={(e) => setFormData({ ...formData, donor_pan: e.target.value })}
                    placeholder="ABCDE1234F (Optional)"
                    className="rounded-xl uppercase"
                    data-testid="donor-pan-input"
                  />
                </div>
              </div>

              {/* Requirement 7: Anonymous Donor option */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="anonymous-check"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-secondary rounded"
                  data-testid="anonymous-checkbox"
                />
                <label htmlFor="anonymous-check" className="text-xs text-slate-700 cursor-pointer select-none">
                  Make my donation anonymous on public leaderboards and Top Donors wall
                </label>
              </div>

              {/* Summary Box */}
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="text-muted-foreground block">Total Payable:</span>
                  <span className="font-heading font-extrabold text-lg text-primary">
                    ₹{totalAmountNum.toLocaleString()}{donationType === 'monthly' ? '/mo' : ''}
                  </span>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <span>Base: ₹{baseAmountNum.toLocaleString()}</span>
                  {tipAmount > 0 && <span className="block text-amber-600 font-semibold">+ Tip: ₹{tipAmount.toLocaleString()}</span>}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-full font-bold py-6 text-base sm:text-lg shadow-lg shadow-orange-500/20"
                disabled={loading}
                data-testid="proceed-payment-button"
              >
                {loading
                  ? 'Processing Gateway...'
                  : donationType === 'monthly'
                    ? `Start Monthly SIP – ₹${totalAmountNum.toLocaleString()}/mo`
                    : `Proceed to Pay – ₹${totalAmountNum.toLocaleString()}`
                }
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DonateModal;
