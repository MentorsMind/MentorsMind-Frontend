import React, { useState, useEffect } from 'react';
import { Globe, MapPin, Users, ChevronDown } from 'lucide-react';
import { timezoneService } from '../../../services/timezone.service';
import type { Mentor } from '../../../types';
import type { TimezoneRegion } from '../../../types/timezone.types';

interface MentorMapViewProps {
  mentors: Mentor[];
  onMentorSelect?: (mentor: Mentor) => void;
  selectedRegions?: TimezoneRegion[];
}

export const MentorMapView: React.FC<MentorMapViewProps> = ({
  mentors,
  onMentorSelect,
  selectedRegions = [],
}) => {
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  const clusteredData = timezoneService.getClusteredMapData(mentors);
  const regions = Object.keys(clusteredData);

  const handleMentorClick = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    onMentorSelect?.(mentor);
  };

  return (
    <div className="space-y-4">
      {/* Map Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Mentors by Timezone</h3>
          <span className="ml-auto text-sm text-gray-600">
            {mentors.length} mentors found
          </span>
        </div>

        {/* Visual Map Container */}
        <div className="relative w-full h-96 rounded-lg border border-gray-200 bg-gradient-to-b from-blue-50 to-indigo-50 overflow-hidden">
          {/* Simplified world map representation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Background grid for visual appeal */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Region Labels and Pins */}
              {regions.map((region, idx) => {
                const pins = clusteredData[region];
                const startX = (idx % 2) * 50 + 25;
                const startY = (Math.floor(idx / 2) * 50) + 25;

                return (
                  <div
                    key={region}
                    className="absolute flex flex-col items-center gap-2"
                    style={{
                      left: `${startX}%`,
                      top: `${startY}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {/* Region cluster circle */}
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-blue-400 blur-lg opacity-50"></div>
                      <button
                        onClick={() => setExpandedRegion(expandedRegion === region ? null : region)}
                        className="relative flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition"
                        title={`${region}: ${pins.length} mentors`}
                      >
                        <span>{pins.length}</span>
                      </button>
                    </div>

                    {/* Region label */}
                    <span className="text-xs font-medium text-gray-700 text-center whitespace-nowrap">
                      {region}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Click on region circles to see mentors in that timezone. Sizes indicate mentor count.
        </p>
      </div>

      {/* Detailed List by Region */}
      <div className="space-y-3">
        {regions.map(region => {
          const pins = clusteredData[region];
          const isExpanded = expandedRegion === region;

          return (
            <div key={region} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <button
                onClick={() => setExpandedRegion(isExpanded ? null : region)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">{region}</h4>
                    <p className="text-xs text-gray-500">{pins.length} mentors available</p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Mentors List */}
              {isExpanded && (
                <div className="border-t border-gray-100 divide-y divide-gray-100">
                  {pins.map(pin => {
                    const mentor = mentors.find(m => m.id === pin.mentorId);
                    if (!mentor) return null;

                    const isSelected = selectedMentor?.id === mentor.id;

                    return (
                      <button
                        key={pin.mentorId}
                        onClick={() => handleMentorClick(mentor)}
                        className={`w-full px-4 py-3 text-left transition ${
                          isSelected
                            ? 'bg-blue-50 border-l-4 border-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {pin.avatar && (
                            <img
                              src={pin.avatar}
                              alt={pin.mentorName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 truncate">
                              {pin.mentorName}
                            </h5>
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <span>🕐 {pin.localTime}</span>
                              <span className="text-gray-400">•</span>
                              <span>{pin.timezone}</span>
                            </p>
                          </div>
                          {isSelected && (
                            <div className="h-3 w-3 rounded-full bg-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Map View Legend</p>
            <ul className="space-y-1 text-xs text-blue-800">
              <li>• Circle size represents number of mentors in that timezone region</li>
              <li>• Click circles or rows to expand and see individual mentors</li>
              <li>• Local time shows each mentor's current time in their timezone</li>
              <li>• Use timezone filters to narrow down your options</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
