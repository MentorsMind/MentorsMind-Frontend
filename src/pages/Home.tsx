import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes.config';

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-stellar/5 via-white to-white">
      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-10 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-stellar/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-stellar">
            MentorMinds
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-gray-900">
            Demo shell for <span className="text-stellar">Settings</span>
          </h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            This build focuses on the Email Notification Preferences UI for issue #89.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to={ROUTES.SETTINGS}
              className="inline-flex items-center justify-center rounded-2xl bg-stellar px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-stellar/20 transition-all hover:bg-stellar-dark"
            >
              Open Settings
            </Link>
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-extrabold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
            >
              Stay here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

