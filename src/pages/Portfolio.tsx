import React from 'react';
import { useMentorProfile } from '../hooks/useMentorProfile';
import { PortfolioSection } from '../components/mentor/PortfolioSection';
import { useTransactionLimits } from '../hooks/useTransactionLimits';
import LimitUsage from '../components/compliance/LimitUsage';

const Portfolio: React.FC = () => {
  const { profile, addPortfolioItem, removePortfolioItem } = useMentorProfile();
  const { daily, monthly, tooltipText, history, kycUrl } = useTransactionLimits();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold mb-1">Portfolio</h2>
        <p className="text-gray-500">Showcase your work and monitor compliance limits.</p>
      </div>

      <LimitUsage
        daily={daily}
        monthly={monthly}
        tooltipText={tooltipText}
        history={history}
        kycUrl={kycUrl}
      />

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <PortfolioSection
          items={profile.portfolio}
          onAdd={addPortfolioItem}
          onRemove={removePortfolioItem}
        />
      </div>
    </div>
  );
};

export default Portfolio;
