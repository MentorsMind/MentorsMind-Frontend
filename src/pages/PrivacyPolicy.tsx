import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-black text-slate-950">Privacy Policy</h1>
      <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
        <p>MentorMinds collects the minimum personal data needed to operate mentoring sessions, compliance checks, payments, and user support.</p>
        <p>We store terms acceptance timestamps, cookie consent preferences, profile and wallet metadata, and activity needed to deliver the platform safely.</p>
        <p>You can export your data from settings at any time. For privacy requests, contact support@mentorsmind.app.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
