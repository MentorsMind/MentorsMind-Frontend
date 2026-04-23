import { Link } from 'react-router-dom';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      {/* Wallet icon */}
      <div className="mb-6 p-4 bg-surface rounded-full border border-border shadow-sm text-muted-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V9"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
          />
        </svg>
      </div>

      <h3 className="text-2xl font-black text-text mb-3 tracking-tight">
        No earnings yet
      </h3>

      <p className="text-muted-foreground font-medium max-w-md mb-8 leading-relaxed">
        Payouts are processed via Stellar after each session is completed and confirmed.
        Complete your first session to start earning.
      </p>

      <Link
        to="/mentor/sessions"
        className="px-8 py-3 bg-stellar text-white font-bold rounded-2xl hover:bg-stellar-dark shadow-xl shadow-stellar/30 transition-all hover:-translate-y-1 active:scale-95"
      >
        View Sessions
      </Link>
    </div>
  );
}
