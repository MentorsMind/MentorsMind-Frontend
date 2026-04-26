import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileHeader from '../components/mentor/ProfileHeader';
import RatingBreakdown from '../components/mentor/RatingBreakdown';
import PublicAvailability from '../components/mentor/PublicAvailability';
import ReviewsList from '../components/mentor/ReviewsList';
import { EndorsementSection } from '../components/profile/EndorsementSection';
import { useShare } from '../hooks/useShare';
import { useEndorsements } from '../hooks/useEndorsements';
import { useAuthContext } from '../contexts/AuthContext';
import { useCreateConversation } from '../hooks/useCreateConversation';
import { applyMetaTags, buildMentorProfileMeta } from '../utils/og-meta.utils';
import {
  getPublicUserProfile,
  getMentorRatingSummary,
  getMentorAvailability,
  getMentorVerificationStatus,
  type PublicUserProfile,
  type RatingSummary,
  type AvailabilitySlot,
  type VerificationStatus
} from '../services/mentor.service';
import { ROUTES } from '../config/routes.config';

// ─── MessageButton ────────────────────────────────────────────────────────────

interface MessageButtonProps {
  mentorId: string;
  mentorName: string;
  isOwnProfile: boolean;
}

function MessageButton({ mentorId, mentorName, isOwnProfile }: MessageButtonProps) {
  const navigate = useNavigate();
  const { status, conversation, create } = useCreateConversation();

  const handleClick = async () => {
    if (status === 'success' && conversation) {
      navigate(`/messages?conversation=${conversation.id}`);
      return;
    }
    await create(mentorId);
  };

  useEffect(() => {
    if (status === 'success' && conversation) {
      navigate(`/messages?conversation=${conversation.id}`);
    }
  }, [status, conversation, navigate]);

  if (isOwnProfile || status === 'self') return null;

  if (status === 'forbidden') {
    return (
      <div className="space-y-3">
        <div className="relative group">
          <button
            disabled
            className="w-full rounded-xl border border-gray-300 bg-gray-100 px-6 py-2.5 text-sm font-bold text-gray-400 cursor-not-allowed"
          >
            Message
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-10">
            You can only message mentors you have booked a session with.
          </div>
        </div>
        <button
          onClick={() => {
            const el = document.getElementById('availability');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full rounded-xl bg-stellar px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-stellar-dark transition"
        >
          Book a Session to Message
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === 'loading'}
      className="rounded-xl border border-stellar/20 bg-white px-6 py-2.5 text-sm font-bold text-stellar shadow-sm hover:bg-stellar/5 transition disabled:opacity-50"
    >
      {status === 'loading' ? 'Loading…' : 'Message'}
    </button>
  );
}

export default function MentorPublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { share } = useShare();
  const { user } = useAuthContext();
  const [shareStatus, setShareStatus] = useState('');
  const [mentor, setMentor] = useState<PublicUserProfile | null>(null);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mentorId = id ?? 'm1';
  const isOwnProfile = !!user && user.id === mentorId;

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        setLoading(true);
        const [profileData, ratingData, availabilityData, verificationData] = await Promise.all([
          getPublicUserProfile(mentorId),
          getMentorRatingSummary(mentorId),
          getMentorAvailability(mentorId),
          getMentorVerificationStatus(mentorId),
        ]);

        setMentor(profileData);
        setRatingSummary(ratingData);
        setAvailability(availabilityData);
        setVerificationStatus(verificationData);
      } catch (err) {
        setError('Failed to load mentor profile');
        console.error('Error fetching mentor data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorData();
  }, [mentorId]);

  const profileUrl = `${window.location.origin}/mentors/${mentorId}`;
  const sessionInviteToken = useMemo(() => `${mentorId}-${Date.now().toString(36)}`, [mentorId]);
  const sessionInviteUrl = `${window.location.origin}/sessions/join/${sessionInviteToken}`;

  useEffect(() => {
    if (mentor) {
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
    }
  }, [mentor, mentorId]);

  const handleShareProfile = async () => {
    if (!mentor) return;
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
    if (!mentor) return;
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

  const {
    endorsements,
    pendingSkill,
    requestEndorsement,
    cancelRequest,
    toggleEndorsement,
  } = useEndorsements(true);

  const handleBookSession = () => {
    const availabilityElement = document.getElementById('availability');
    if (availabilityElement) {
      availabilityElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-24 w-24 rounded-full bg-gray-200 mx-auto"></div>
            <div className="h-8 bg-gray-200 rounded mx-auto w-48"></div>
            <div className="h-4 bg-gray-200 rounded mx-auto w-64"></div>
            <div className="h-6 bg-gray-200 rounded mx-auto w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mentor || !verificationStatus) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-600">{error || 'Mentor not found'}</p>
        </div>
      </div>
    );
  }

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
        <MessageButton
          mentorId={mentorId}
          mentorName={mentor?.name ?? ''}
          isOwnProfile={isOwnProfile}
        />
      </div>
      {shareStatus && <p className="text-sm font-medium text-stellar">{shareStatus}</p>}

      <ProfileHeader
        name={mentor.name}
        bio={mentor.bio}
        hourlyRate={mentor.hourlyRate}
        currency={mentor.currency}
        joinDate={mentor.joinDate}
        sessionCount={mentor.sessionCount}
        learnerCount={89} // This would need to be added to the API
        verificationStatus={verificationStatus.verificationStatus}
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

      <RatingBreakdown ratingSummary={ratingSummary || undefined} />

      <PublicAvailability availability={availability} />

      <ReviewsList />

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
          <li className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-3">
            <span className="text-sm font-medium text-gray-700">1-on-1 Session</span>
            <span className="text-sm font-bold text-stellar">${mentor.hourlyRate} / hr</span>
          </li>
          <li className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-3">
            <span className="text-sm font-medium text-gray-700">Code Review</span>
            <span className="text-sm font-bold text-stellar">${Math.round(mentor.hourlyRate * 0.67)} / session</span>
          </li>
          <li className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-3">
            <span className="text-sm font-medium text-gray-700">Mock Interview</span>
            <span className="text-sm font-bold text-stellar">${Math.round(mentor.hourlyRate * 1.33)} / session</span>
          </li>
        </ul>
      </div>

      {/* Sticky CTA Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleBookSession}
          className="rounded-2xl bg-stellar px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-stellar-dark transition-all transform hover:scale-105"
        >
          Book a Session
        </button>
      </div>

    </div>
  );
}
