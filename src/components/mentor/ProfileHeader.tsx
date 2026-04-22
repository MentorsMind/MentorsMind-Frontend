interface ProfileHeaderProps {
  name: string;
  bio: string;
  joinDate: string;
  sessionCount: number;
  learnerCount: number;
  verified: boolean;
}

export default function ProfileHeader({
  name,
  bio,
  joinDate,
  sessionCount,
  learnerCount,
  verified,
}: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center gap-4">
      {/* Avatar */}
      <div className="h-24 w-24 rounded-full bg-stellar/10 flex items-center justify-center text-3xl font-bold text-stellar">
        {name.charAt(0)}
      </div>

      {/* Name + Badge */}
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
        {verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            ✓ Verified
          </span>
        )}
      </div>

      {/* Join date */}
      <p className="text-sm text-gray-400">Member since {joinDate}</p>

      {/* Bio */}
      <p className="text-gray-600 max-w-xl">{bio}</p>

      {/* Stats */}
      <div className="flex gap-8 mt-2">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{sessionCount}</div>
          <div className="text-xs text-gray-400 mt-0.5">Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{learnerCount}</div>
          <div className="text-xs text-gray-400 mt-0.5">Learners</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-2">
        <button className="rounded-xl bg-stellar px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-stellar-dark transition-all">
          Book a Session
        </button>
        <button className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
          Share Profile
        </button>
      </div>
    </div>
  );
}
