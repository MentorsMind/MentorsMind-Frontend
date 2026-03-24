import React from 'react';
import type { MentorProfile } from '../../types';
import MentorCard from './MentorCard';

interface MentorGridProps {
  mentors: MentorProfile[];
  savedMentors: Set<string>;
  onSaveToggle: (id: string) => void;
  onViewProfile: (mentor: MentorProfile) => void;
  viewMode: 'grid' | 'list';
}

const MentorGrid: React.FC<MentorGridProps> = ({
  mentors,
  savedMentors,
  onSaveToggle,
  onViewProfile,
  viewMode,
}) => {
  if (mentors.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No mentors found</h3>
        <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria.</p>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' 
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
      : 'space-y-4'
    }>
      {mentors.map((mentor) => (
        <MentorCard
          key={mentor.id}
          mentor={mentor}
          isSaved={savedMentors.has(mentor.id)}
          onSave={onSaveToggle}
          onViewProfile={onViewProfile}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};

export default MentorGrid;
