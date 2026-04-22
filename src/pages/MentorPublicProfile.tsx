import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProfileHeader from '../components/mentor/ProfileHeader';
import RatingBreakdown from '../components/mentor/RatingBreakdown';
import PublicAvailability from '../components/mentor/PublicAvailability';
import ReviewsList from '../components/mentor/ReviewsList';
import EndorsementSection from '../components/profile/EndorsementSection';
import { useShare } from '../hooks/useShare';
import { useEndorsements } from '../hooks/useEndorsements';
import { useReviews } from '../hooks/useReviews';
import { applyMetaTags, buildMentorProfileMeta } from '../utils/og-meta.utils';

// TODO: replace with auth context once available
const CURRENT_USER_ID = 'u1';

const mentor = {
  id: 'm1',
  name: 'John Doe',
  bio: 'Senior software engineer with 8+ years of experience in frontend development. Passionate about React, TypeScript, and helping developers level up their skills.',
  rating: 4.9,
  joinDate: 'January 2023',
  sessionCount: 142,
  learnerCount: 89,
  verified: true,
  skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Tailwind CSS', 'Next.js'],
  languages: ['English', 'Spanish'],
  pricing: [
    { type: '1-on-1 Session', amount: '$20 / hr' },
    { type: 'Code Review', amount: '$15 / session' },
    { type: 'Mock Interview', amount: '$30 / session' },
  ],
};

export default function MentorPublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { share } = useShare();
  const [shareStatus, setShareStatus] = useState('');

  const mentorId = id ?? mentor.id;
  const profileUrl = `${window.location.origin}/mentors/${mentorId}`;
  const sessionInviteToken = useMemo(() => `${mentorId}-${Date.now().toString(36)}`, [mentorId]);
  const sessionInviteUrl = `${window.location.origin}/sessions/join/${sessionInviteToken}`;

  useEffect(() => {
    document.title = `${mentor.name} | Mentor Profile`;
    const cleanupMeta = applyMetaTags(
      buildMentorProfileMeta({
        id: mentorId,
        name: mentor.name,
        bio: mentor.bio,
        rating: mentor.rating,
        skills: mentor.skills,
      })
    );
    return () => {
      document.title = 'MentorMinds Stellar';
      cleanupMeta();
    };
  }, [mentorId]);

  const handleShareProfile = async () => {
    try {
      const result = await share({
        title: `${mentor.name} on MentorMinds`,
        text: `Check out ${mentor.name}'s mentor profile with ${mentor.rating.toFixed(1)} star rating.`,
        url: profileUrl,
      });
      setShareStatus(result.method === 'native' ? 'Profile shared.' : 'Profile link copied to clipboard.');
    } catch {
      setShareStatus('Unable to share profile right now.');
    }
  };

  const handleShareSessionInvite = async () => {
    try {
      const result = await share({
        title: 'MentorMinds Session Invite',
        text: `Join my MentorMinds session: ${sessionInviteUrl}`,
        url: sessionInviteUrl,
      });
      setShareStatus(result.method === 'native' ? 'Session invite shared.' : 'Session invite copied to clipboard.');
    } catch {
      setShareStatus('Unable to share session invite right now.');
    }
  };

  const { endorsements, pendingSkill, requestEndorsement, cancelRequest, toggleEndorsement } =
    useEndorsements(true);

  const { allReviews, markHelpful, editReview } = useReviews(mentorId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleShareProfile}
          className="rounded-xl bg-stellar px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-stellar-dark transition"
        >
          Share Profile
        </button>
        <button
          type="button"
          onClick={handleShareSessionInvite}
          className="rounded-xl border border-stellar/20 bg-white px-4 py-2 text-sm font-bold text-stellar shadow-sm hover:bg-stellar/5 transition"
        >
          Share Session Invite
        </button>
      </div>
      {shareStatus && <p className="text-sm font-medium text-stellar">{shareStatus}</p>}

      <ProfileHeader
        name={mentor.name}
        bio={mentor.bio}
        joinDate={mentor.joinDate}
        sessionCount={mentor.sessionCount}
        learnerCount={mentor.learnerCount}
        verified={mentor.verified}
      />

      <EndorsementSection
        name={mentor.name}
        endorsements={endorsements}
        hasCompletedSession={true}
        pendingSkill={pendingSkill}
        onRequestEndorsement={requestEndorsement}
        onToggleEndorsement={toggleEndorsement}
        onCancelRequest={cancelRequest}
      />

      <RatingBreakdown />

      <PublicAvailability />

      <ReviewsList
        reviews={allReviews}
        currentUserId={CURRENT_USER_ID}
        onVoteHelpful={markHelpful}
        onEdit={editReview}
      />

      {/* Skills */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {mentor.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-stellar/10 px-4 py-1.5 text-sm font-semibold text-stellar">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Languages</h2>
        <ul className="space-y-2">
          {mentor.languages.map((lang) => (
            <li key={lang} className="flex items-center gap-2 text-gray-600 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-stellar inline-block" />
              {lang}
            </li>
          ))}
        </ul>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Pricing</h2>
        <ul className="space-y-3">
          {mentor.pricing.map((p) => (
            <li key={p.type} className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-3">
              <span className="text-sm font-medium text-gray-700">{p.type}</span>
              <span className="text-sm font-bold text-stellar">{p.amount}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
