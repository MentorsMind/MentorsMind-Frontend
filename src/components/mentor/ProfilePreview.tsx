import React from 'react';
import type { MentorProfile } from '../../hooks/useMentorProfile';

interface ProfilePreviewProps {
  profile: MentorProfile;
  onClose: () => void;
}

export const ProfilePreview = ({ profile, onClose }: ProfilePreviewProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Profile Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close preview"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start space-x-6">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-4xl text-gray-400">
                  {profile.firstName[0]}{profile.lastName[0]}
                </span>
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h3>
                {profile.isVerified && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
              {profile.title && <p className="text-lg text-gray-600 mb-3">{profile.title}</p>}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="font-semibold text-gray-900">${profile.hourlyRate}/hr</span>
                <span>•</span>
                <span>{profile.completionPercentage}% Complete</span>
              </div>
            </div>
          </div>

          {profile.bio && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">About</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {profile.skills.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.expertise.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((area) => (
                  <span key={area} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.portfolio.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Portfolio</h4>
              <div className="grid gap-4 md:grid-cols-2">
                {profile.portfolio.map((item) => (
                  <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">{item.type}</span>
                    <h5 className="font-semibold text-gray-900 mt-2">{item.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    {item.url && (
                      <a href={item.url} className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                        View →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.values(profile.socialLinks).some(Boolean) && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Connect</h4>
              <div className="flex space-x-4">
                {profile.socialLinks.linkedin && (
                  <a href={profile.socialLinks.linkedin} className="text-blue-600 hover:underline">LinkedIn</a>
                )}
                {profile.socialLinks.github && (
                  <a href={profile.socialLinks.github} className="text-blue-600 hover:underline">GitHub</a>
                )}
                {profile.socialLinks.twitter && (
                  <a href={profile.socialLinks.twitter} className="text-blue-600 hover:underline">Twitter</a>
                )}
                {profile.socialLinks.website && (
                  <a href={profile.socialLinks.website} className="text-blue-600 hover:underline">Website</a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
