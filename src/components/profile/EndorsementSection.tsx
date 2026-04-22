import React from 'react';
import { Check, ShieldCheck, Star } from 'lucide-react';
import { EndorserAvatars } from './EndorserAvatars';
import type { SkillEndorsement } from '../../hooks/useEndorsements';

interface EndorsementSectionProps {
  name: string;
  endorsements: SkillEndorsement[];
  hasCompletedSession: boolean;
  pendingSkill: string | null;
  onRequestEndorsement: (skill: string) => void;
  onToggleEndorsement: (skill: string) => void;
  onCancelRequest: () => void;
}

export function EndorsementSection({
  name,
  endorsements,
  hasCompletedSession,
  pendingSkill,
  onRequestEndorsement,
  onToggleEndorsement,
  onCancelRequest,
}: EndorsementSectionProps) {
  const totalEndorsements = endorsements.reduce((sum, item) => sum + item.count, 0);
  const hasAny = endorsements.some((item) => item.count > 0);

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stellar">Endorsements</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Skills endorsed for {name}</h2>
          <p className="mt-2 text-sm text-gray-500">Show how peers recognize strengths with skill endorsements.</p>
        </div>
        <div className="rounded-full bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
          {totalEndorsements} total endorsement{totalEndorsements === 1 ? '' : 's'}
        </div>
      </div>

      {pendingSkill && (
        <div className="mb-6 rounded-3xl border border-stellar/20 bg-stellar/5 p-5 text-sm text-gray-700">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-stellar" />
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">You're endorsing {name} for {pendingSkill}</p>
              <p className="text-gray-600">Confirm your endorsement with a Freighter signature.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onToggleEndorsement(pendingSkill)}
              className="inline-flex items-center gap-2 rounded-3xl bg-stellar px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-stellar/20 hover:bg-stellar-dark"
            >
              <Check className="h-4 w-4" />
              Sign with Freighter
            </button>
            <button
              type="button"
              onClick={onCancelRequest}
              className="inline-flex items-center gap-2 rounded-3xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {hasAny ? (
        <div className="grid gap-4 md:grid-cols-2">
          {endorsements.map((endorsement) => (
            <div key={endorsement.skill} className="rounded-3xl border border-gray-200 p-5 transition hover:border-stellar/40">
              <div className="flex items-center justify-between gap-4 sm:gap-6">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Skill tag</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-gray-900">{endorsement.skill}</h3>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  {endorsement.count} endorsement{endorsement.count === 1 ? '' : 's'}
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <EndorserAvatars endorsers={endorsement.endorsers} />

                <button
                  type="button"
                  onClick={() =>
                    endorsement.endorsedByUser
                      ? onToggleEndorsement(endorsement.skill)
                      : onRequestEndorsement(endorsement.skill)
                  }
                  disabled={!hasCompletedSession && !endorsement.endorsedByUser}
                  className={`inline-flex items-center justify-center rounded-3xl px-4 py-2 text-sm font-semibold transition ${
                    endorsement.endorsedByUser
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : hasCompletedSession
                      ? 'bg-stellar text-white hover:bg-stellar-dark'
                      : 'cursor-not-allowed bg-gray-100 text-gray-400'
                  }`}
                >
                  {endorsement.endorsedByUser ? 'Endorsed ✓' : `Endorse ${endorsement.skill}`}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
          <p className="text-lg font-semibold text-gray-900">No endorsements yet</p>
          <p className="mt-2 text-sm text-gray-500">Once learners complete a session with this profile, they can endorse skills here.</p>
          <button
            type="button"
            className="mt-6 inline-flex items-center justify-center rounded-3xl bg-stellar px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-stellar/20 hover:bg-stellar-dark"
          >
            Complete a session to earn the first endorsement
          </button>
        </div>
      )}
    </section>
  );
}
