import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-black text-slate-950">Terms of Service</h1>
      <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
        <p>By using MentorMinds, you agree to comply with platform rules, sanctions screening, applicable anti-money laundering requirements, and local law.</p>
        <p>You are responsible for the accuracy of your profile, wallet connections, and the lawful use of the services provided through the platform.</p>
        <p>These terms may be updated as the product and regulatory requirements evolve. Your first-login acceptance is timestamped for compliance records.</p>
      </div>
    </div>
  );
};

export default TermsOfService;
