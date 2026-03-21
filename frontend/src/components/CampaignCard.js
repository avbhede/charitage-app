import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Target, Users, Calendar } from 'lucide-react';
import { useState } from 'react';
import DonateModal from './DonateModal';

export const CampaignCard = ({ campaign }) => {
  const [showDonate, setShowDonate] = useState(false);
  const progress = (campaign.raised_amount / campaign.goal_amount) * 100;

  return (
    <>
      <div
        className="bg-white rounded-xl overflow-hidden border border-border/40 hover:border-secondary/30 transition-all duration-300 hover:shadow-xl campaign-card group"
        data-testid={`campaign-card-${campaign.id}`}
      >
        <div className="relative h-56 overflow-hidden">
          <img
            src={campaign.image_url}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 bg-secondary text-white px-4 py-1 rounded-full text-sm font-bold">
            {campaign.status === 'active' ? 'Active' : 'Completed'}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="inline-block bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            {campaign.category}
          </div>

          <h3 className="text-xl font-heading font-bold text-primary group-hover:text-secondary transition-colors">
            {campaign.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-primary">Raised</span>
              <span className="font-bold text-secondary">
                ₹{campaign.raised_amount.toLocaleString()}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.toFixed(0)}% of goal</span>
              <span>Goal: ₹{campaign.goal_amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{campaign.beneficiaries_count} beneficiaries</span>
            </div>
          </div>

          <Button
            className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-full font-bold"
            onClick={() => setShowDonate(true)}
            data-testid={`donate-campaign-${campaign.id}`}
          >
            Support This Campaign
          </Button>
        </div>
      </div>

      <DonateModal
        open={showDonate}
        onClose={() => setShowDonate(false)}
        campaignId={campaign.id}
        campaignTitle={campaign.title}
      />
    </>
  );
};
