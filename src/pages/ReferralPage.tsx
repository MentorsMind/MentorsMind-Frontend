import React, { useEffect, useState } from 'react';
import { AlertCircle, Gift, Users } from 'lucide-react';
import { referralService } from '../services/referral.service';
import { ReferralStats } from '../components/referral/ReferralStats';
import { ReferralLink } from '../components/referral/ReferralLink';
import { ReferralHistory } from '../components/referral/ReferralHistory';
import type { ReferralResponse } from '../types/referral.types';

export const ReferralPage: React.FC = () => {
  const [data, setData] = useState<ReferralResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('Friend');

  useEffect(() => {
    loadReferralData();
    // Get user name from localStorage or context
    const storedUserName = localStorage.getItem('userName') || 'Friend';
    setUserName(storedUserName);
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      setError(null);
      const referralData = await referralService.getReferralData();
      setData(referralData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load referral data';
      setError(errorMessage);
      console.error('Error loading referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReferral = async (_id: string) => {
    // This would call a delete endpoint once available
    // For now, just show success and reload
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await loadReferralData();
    } catch (err) {
      console.error('Error deleting referral:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-gray-600">Loading your referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Invite Friends & Earn Rewards
          </h1>
          <p className="text-gray-600">
            Share your referral link and earn rewards when your friends sign up and complete their first booking.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
            <button
              onClick={loadReferralData}
              className="ml-auto font-medium text-red-600 hover:text-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!error && data && data.history.length === 0 && (
          <div className="mb-8 rounded-lg border border-dashed border-gray-300 bg-gradient-to-br from-blue-50 to-indigo-50 p-12 text-center">
            <Gift className="mx-auto mb-4 h-12 w-12 text-blue-600" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Start Earning with Referrals
            </h2>
            <p className="mb-6 text-gray-600 max-w-md mx-auto">
              Invite your friends to MentorsMind and earn rewards for each successful signup. Share your unique referral link below to get started!
            </p>
          </div>
        )}

        {/* Main Content */}
        {data && (
          <div className="space-y-8">
            {/* Referral Stats */}
            <section>
              <ReferralStats
                stats={data.stats}
                isLoading={loading}
              />
            </section>

            {/* Referral Link & Share */}
            <section>
              <ReferralLink
                referralLink={data.referralLink}
                referralCode={data.referralCode}
                userName={userName}
              />
            </section>

            {/* Referral History */}
            <section className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center gap-2">
                <Users className="h-6 w-6 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Referral History
                </h2>
              </div>

              <ReferralHistory
                history={data.history}
                isLoading={loading}
                onDelete={handleDeleteReferral}
              />
            </section>

            {/* FAQ Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">
                Frequently Asked Questions
              </h2>

              <div className="space-y-3">
                <details className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4">
                  <summary className="flex items-center justify-between font-medium text-gray-900">
                    <span>How do referral rewards work?</span>
                    <span className="transition group-open:rotate-180">
                      <svg
                        className="h-5 w-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-gray-600">
                    You earn rewards when your invited friends complete their first booking on MentorsMind. The reward is typically credited to your account within 24-48 hours of the booking completion.
                  </p>
                </details>

                <details className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4">
                  <summary className="flex items-center justify-between font-medium text-gray-900">
                    <span>How many people can I invite?</span>
                    <span className="transition group-open:rotate-180">
                      <svg
                        className="h-5 w-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-gray-600">
                    There's no limit to how many people you can invite! Share your referral link as much as you'd like and earn rewards from each successful referral.
                  </p>
                </details>

                <details className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4">
                  <summary className="flex items-center justify-between font-medium text-gray-900">
                    <span>Can I track my referral status?</span>
                    <span className="transition group-open:rotate-180">
                      <svg
                        className="h-5 w-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-gray-600">
                    Yes! The referral history section below shows you all your invites, when people joined, and the status of your rewards. You can track everything in real-time.
                  </p>
                </details>

                <details className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4">
                  <summary className="flex items-center justify-between font-medium text-gray-900">
                    <span>What if my friend's email is masked?</span>
                    <span className="transition group-open:rotate-180">
                      <svg
                        className="h-5 w-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-gray-600">
                    We mask email addresses for privacy. You'll be able to see when they join and their reward status, but their full email remains protected for security purposes.
                  </p>
                </details>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
