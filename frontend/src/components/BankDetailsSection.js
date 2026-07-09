import React, { useState } from 'react';
import { Building2, Copy, Check, QrCode, Shield, Landmark } from 'lucide-react';
import { toast } from 'sonner';

export const BankDetailsSection = () => {
  const [copiedField, setCopiedField] = useState(null);

  const bankInfo = {
    accountName: 'Charitage Foundation Trust',
    bankName: 'HDFC Bank Ltd',
    branch: 'BKC Branch, Mumbai',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0000240',
    accountType: 'Current Account',
    upiId: 'charitage@hdfcbank'
  };

  const handleCopy = (field, value) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6" data-testid="bank-details-section">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary flex-shrink-0">
          <Landmark className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">Direct Bank Transfer</span>
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-primary">RTGS / NEFT / IMPS Details</h3>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        Make a direct bank transfer or set up a standing monthly donation using our official trust account details below:
      </p>

      {/* Main Details Grid & QR Code side-by-side or stacked cleanly */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        {/* Left 2 Columns: Bank Information Grid */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
          {/* Account Name */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Account Name</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-heading font-bold text-sm text-primary line-clamp-1">{bankInfo.accountName}</span>
              <button
                onClick={() => handleCopy('Account Name', bankInfo.accountName)}
                className="text-slate-400 hover:text-secondary p-1 transition-colors"
                title="Copy Account Name"
              >
                {copiedField === 'Account Name' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bank Name & Branch */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Bank Name & Branch</span>
            <div className="mt-1">
              <span className="font-heading font-bold text-sm text-primary block">{bankInfo.bankName}</span>
              <span className="text-xs text-muted-foreground block">{bankInfo.branch}</span>
            </div>
          </div>

          {/* Account Number */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Account Number</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono font-bold text-base text-secondary">{bankInfo.accountNumber}</span>
              <button
                onClick={() => handleCopy('Account Number', bankInfo.accountNumber)}
                className="text-slate-400 hover:text-secondary p-1 transition-colors"
                title="Copy Account Number"
              >
                {copiedField === 'Account Number' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* IFSC Code */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">IFSC Code</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono font-bold text-base text-primary">{bankInfo.ifscCode}</span>
              <button
                onClick={() => handleCopy('IFSC Code', bankInfo.ifscCode)}
                className="text-slate-400 hover:text-secondary p-1 transition-colors"
                title="Copy IFSC Code"
              >
                {copiedField === 'IFSC Code' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Account Type */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between sm:col-span-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Account Type</span>
                <span className="font-heading font-bold text-sm text-primary block mt-0.5">{bankInfo.accountType}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">UPI ID</span>
                <span className="font-mono font-bold text-xs text-secondary block mt-0.5">{bankInfo.upiId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: UPI QR Code Card */}
        <div className="bg-gradient-to-br from-slate-900 to-primary text-white p-6 rounded-2xl text-center flex flex-col items-center justify-center shadow-md border border-slate-800">
          <div className="bg-white p-2.5 rounded-2xl shadow-lg mb-3 border-2 border-amber-400">
            <svg viewBox="0 0 100 100" className="w-32 h-32 sm:w-36 sm:h-36">
              <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
              {/* Outer markers */}
              <rect x="10" y="10" width="25" height="25" fill="#16225B" />
              <rect x="14" y="14" width="17" height="17" fill="#ffffff" />
              <rect x="18" y="18" width="9" height="9" fill="#D97706" />

              <rect x="65" y="10" width="25" height="25" fill="#16225B" />
              <rect x="69" y="14" width="17" height="17" fill="#ffffff" />
              <rect x="73" y="18" width="9" height="9" fill="#D97706" />

              <rect x="10" y="65" width="25" height="25" fill="#16225B" />
              <rect x="14" y="69" width="17" height="17" fill="#ffffff" />
              <rect x="18" y="73" width="9" height="9" fill="#D97706" />

              {/* Pattern pixels */}
              <rect x="40" y="10" width="6" height="6" fill="#16225B" />
              <rect x="50" y="10" width="6" height="6" fill="#D97706" />
              <rect x="40" y="20" width="6" height="6" fill="#16225B" />
              <rect x="48" y="28" width="8" height="8" fill="#16225B" />
              <rect x="40" y="40" width="20" height="20" fill="#16225B" />
              <rect x="45" y="45" width="10" height="10" fill="#D97706" />
              <rect x="70" y="45" width="15" height="6" fill="#16225B" />
              <rect x="15" y="45" width="15" height="6" fill="#16225B" />
              <rect x="65" y="65" width="8" height="8" fill="#D97706" />
              <rect x="77" y="75" width="12" height="12" fill="#16225B" />
              <rect x="45" y="75" width="12" height="12" fill="#16225B" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5 justify-center mb-1">
            <QrCode className="w-4 h-4 text-amber-400" />
            <span className="font-heading font-bold text-xs sm:text-sm">Scan to Pay via UPI</span>
          </div>
          <p className="text-[11px] text-white/80 font-mono mb-2">{bankInfo.upiId}</p>
          <span className="text-[10px] text-white/70 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full font-semibold">
            GPay • PhonePe • Paytm • BHIM
          </span>
        </div>
      </div>

      {/* Tax Exemption Banner */}
      <div className="flex items-center gap-2.5 text-xs text-emerald-800 bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
        <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>All direct bank transfers are 100% eligible for 80G tax rebate. Mention your PAN in the transfer remarks for automatic digital receipt dispatch.</span>
      </div>
    </div>
  );
};

export default BankDetailsSection;
