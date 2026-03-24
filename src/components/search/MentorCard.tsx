import React from 'react';
import type { MentorProfile } from '../../types';
import ImageOptimizer from '../performance/ImageOptimizer';

interface MentorCardProps {
  mentor: MentorProfile;
  isSaved: boolean;
  onSave: (id: string) => void;
  onViewProfile: (mentor: MentorProfile) => void;
  onBookSession?: (mentor: MentorProfile) => void;
  viewMode?: 'grid' | 'list';
}

const MentorCard: React.FC<MentorCardProps> = ({
  mentor,
  isSaved,
  onSave,
  onViewProfile,
  onBookSession,
  viewMode = 'grid',
}) => {
  const isGridView = viewMode === 'grid';

  return (
    <div 
      className={`group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-stellar/20 transition-all duration-300 ${
        !isGridView ? 'flex gap-6' : ''
      }`}
    >
      {/* Save Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSave(mentor.id);
        }}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
          isSaved 
            ? 'bg-stellar text-white' 
            : 'bg-gray-50 text-gray-400 hover:bg-stellar/10 hover:text-stellar'
        }`}
      >
        <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <div className={`${!isGridView ? 'shrink-0' : ''}`}>
        {/* Avatar */}
        <div className="relative inline-block mb-4">
          {mentor.avatar ? (
            <ImageOptimizer
              src={mentor.avatar}
              alt={mentor.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-stellar to-blue-600 flex items-center justify-center text-white font-bold text-2xl border-2 border-white shadow-md">
              {mentor.name[0]}
            </div>
          )}
          {mentor.isAvailable && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${!isGridView ? 'flex flex-col justify-center' : ''}`}>
        {/* Name & Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-stellar transition-colors">
          {mentor.name}
        </h3>
        <p className="text-sm font-medium text-gray-500 mb-3">{mentor.title}</p>

        {/* Rating & Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400">★</span>
            <span className="font-bold text-gray-900">{mentor.rating}</span>
            <span className="text-gray-400">({mentor.reviewCount})</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="text-gray-500">{mentor.totalSessions} sessions</div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="text-green-600 font-bold">{mentor.completionRate}% success</div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {mentor.skills.slice(0, isGridView ? 4 : 6).map((skill, index) => (
            <span
              key={index}
              className="px-2.5 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-gray-100"
            >
              {skill}
            </span>
          ))}
          {mentor.skills.length > (isGridView ? 4 : 6) && (
            <span className="px-2.5 py-1 text-[10px] font-bold text-gray-400">
              +{mentor.skills.length - (isGridView ? 4 : 6)} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Hourly Rate</div>
            <div className="text-2xl font-black text-gray-900">
              {mentor.hourlyRate} <span className="text-sm font-bold text-stellar">XLM</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onBookSession && (
              <button
                onClick={() => onBookSession(mentor)}
                className="px-4 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95"
              >
                Book
              </button>
            )}
            <button
              onClick={() => onViewProfile(mentor)}
              className="px-6 py-3 bg-stellar text-white font-bold rounded-xl hover:bg-stellar-dark shadow-lg shadow-stellar/20 transition-all active:scale-95"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorCard;
