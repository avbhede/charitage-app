import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { Copy, Check, Share2, Mail, Linkedin, Twitter, Facebook, MessageCircle } from 'lucide-react';

export const CampaignShareModal = ({ open, onClose, campaign }) => {
  const [copied, setCopied] = useState(false);

  if (!campaign) return null;

  const campaignUrl = `${window.location.origin}/programs?campaign=${campaign.id}`;
  const shareTitle = `Support "${campaign.title}" on Charitage Foundation`;
  const shareText = `Help us make a difference! Join me in supporting "${campaign.title}". Every contribution brings hope and transforms lives.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(campaignUrl);
    setCopied(true);
    toast.success('Campaign link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n${campaignUrl}`)}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`,
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-slate-900 hover:bg-slate-800 text-white',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(campaignUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800 text-white',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(campaignUrl)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\nDonate here: ${campaignUrl}`)}`,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-6" data-testid="campaign-share-modal">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold flex items-center gap-2 text-primary">
            <Share2 className="w-5 h-5 text-secondary" />
            Share Campaign
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
            <img
              src={campaign.image_url}
              alt={campaign.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div>
              <h4 className="font-heading font-semibold text-sm text-primary line-clamp-1">{campaign.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{campaign.description}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Shareable Link
            </label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={campaignUrl}
                className="bg-slate-50 text-xs font-mono select-all"
                data-testid="share-url-input"
              />
              <Button
                onClick={handleCopy}
                className="bg-primary text-white hover:bg-primary/90 rounded-lg flex-shrink-0 px-4"
                data-testid="copy-link-btn"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="ml-1 text-xs">{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
              Share on Social Platforms
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {shareLinks.map((platform) => {
                const Icon = platform.icon;
                return (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow ${platform.color}`}
                    data-testid={`share-${platform.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-4 h-4" />
                    {platform.name}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignShareModal;
