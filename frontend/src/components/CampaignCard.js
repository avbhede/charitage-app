import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Target, Users, Share2 } from 'lucide-react';
import { useState } from 'react';
import DonateModal from './DonateModal';
import CampaignShareModal from './CampaignShareModal';

export const CampaignCard = ({ campaign }) => {
  const [showDonate, setShowDonate] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const progress = Math.min(100, (campaign.raised_amount / campaign.goal_amount) * 100);

  return (
    <>
      <div
        className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-secondary/40 transition-all duration-300 hover:shadow-xl campaign-card group flex flex-col justify-between"
        data-testid={`campaign-card-${campaign.id}`}
      >
        <div>
          <div className="relative h-56 overflow-hidden bg-slate-100">
            <img
              src={campaign.image_url}
              alt={campaign.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
              {campaign.category}
            </div>
            <div className="absolute top-4 right-4 bg-primary/90 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
              {campaign.status === 'active' ? 'Active' : 'Pending Review'}
            </div>
          </div>

          <div className="p-6 space-y-4">
            <h3 className="text-xl font-heading font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2">
              {campaign.title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {campaign.description}
            </p>

            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex justify-between text-xs sm:text-sm font-semibold">
                <span className="text-slate-600">Raised: <strong className="text-secondary">₹{campaign.raised_amount.toLocaleString()}</strong></span>
                <span className="text-slate-600">Goal: <strong>₹{campaign.goal_amount.toLocaleString()}</strong></span>
              </div>
              <Progress value={progress} className="h-2 bg-slate-200" />
              <div className="flex justify-between text-[11px] text-muted-foreground font-semibold">
                <span>{progress.toFixed(0)}% Funded</span>
                <span>{campaign.beneficiaries_count} Beneficiaries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Requirement 6: Campaign Share Button + Support Campaign Button */}
        <div className="p-6 pt-0 space-y-2.5">
          <div className="flex items-center gap-2">
            <Button
              className="flex-1 bg-secondary text-white hover:bg-secondary/90 rounded-full font-bold py-5 text-sm shadow-md"
              onClick={() => setShowDonate(true)}
              data-testid={`donate-campaign-${campaign.id}`}
            >
              Support Campaign
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowShare(true)}
              className="rounded-full p-3 border-slate-200 text-slate-600 hover:text-secondary hover:border-secondary"
              title="Share Campaign"
              data-testid={`share-campaign-${campaign.id}`}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <DonateModal
        open={showDonate}
        onClose={() => setShowDonate(false)}
        campaignId={campaign.id}
        campaignTitle={campaign.title}
      />

      <CampaignShareModal
        open={showShare}
        onClose={() => setShowShare(false)}
        campaign={campaign}
      />
    </>
  );
};

export default CampaignCard;
