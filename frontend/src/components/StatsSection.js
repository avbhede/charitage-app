import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Users, Heart, Target, TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, value, label, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = parseInt(value);
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [inView, value]);

  return (
    <div
      ref={ref}
      className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center hover:bg-white hover:shadow-lg transition-all duration-300"
      data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
          <Icon className="w-8 h-8 text-secondary" />
        </div>
      </div>
      <div className="text-4xl md:text-5xl font-heading font-bold text-primary mb-2 stat-counter">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
        {label}
      </div>
    </div>
  );
};

export const StatsSection = ({ stats }) => {
  return (
    <section className="py-16 md:py-24 bg-background" data-testid="stats-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <StatCard
            icon={Users}
            value={stats?.total_beneficiaries || 50000}
            label="Beneficiaries Served"
            suffix="+"
          />
          <StatCard
            icon={Heart}
            value={stats?.total_funds_raised || 2500000}
            label="Funds Raised"
            suffix="+"
          />
          <StatCard
            icon={Target}
            value={stats?.active_campaigns || 25}
            label="Active Campaigns"
            suffix="+"
          />
          <StatCard
            icon={TrendingUp}
            value={stats?.volunteers || 500}
            label="Active Volunteers"
            suffix="+"
          />
        </div>
      </div>
    </section>
  );
};
