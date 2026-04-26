import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface TermsAcceptanceProps {
  isOpen: boolean;
  onAccept: (acceptedAt: string) => void;
}

const TermsAcceptance: React.FC<TermsAcceptanceProps> = ({ isOpen, onAccept }) => {
  const [checked, setChecked] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Compliance Notice</p>
        <h2 className="mt-3 text-3xl font-black text-slate-950">Accept the latest Terms of Service</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          We record the date and time of your acceptance on first login so your account has an auditable compliance trail.
        </p>

        <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">What we store</p>
          <p className="mt-2">A timestamp, your current browser session, and the version of the terms accepted.</p>
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">
            I have read and accept the <Link to="/terms" className="font-semibold text-blue-700 hover:underline">Terms of Service</Link> and
            {' '}
            <Link to="/privacy" className="font-semibold text-blue-700 hover:underline">Privacy Policy</Link>.
          </span>
        </label>

        <button
          onClick={() => onAccept(new Date().toISOString())}
          disabled={!checked}
          className="mt-6 w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Continue to MentorMinds
        </button>
      </div>
    </div>
  );
};

export default TermsAcceptance;
