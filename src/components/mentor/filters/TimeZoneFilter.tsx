import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Filter } from 'lucide-react';
import {
  getAllRegions,
  getTimezonesByRegion,
  getAllTimezones,
} from '../../../utils/timezone.utils';
import type { TimezoneRegion, TimezoneInfo } from '../../../types/timezone.types';

interface TimeZoneFilterProps {
  onFilterChange: (filter: {
    selectedTimezone?: string;
    selectedRegions: TimezoneRegion[];
    similarToMine: boolean;
    availableNow: boolean;
  }) => void;
  userTimezone?: string;
}

export const TimeZoneFilter: React.FC<TimeZoneFilterProps> = ({
  onFilterChange,
  userTimezone = 'UTC',
}) => {
  const [selectedRegions, setSelectedRegions] = useState<TimezoneRegion[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState<string | undefined>();
  const [similarToMine, setSimilarToMine] = useState(false);
  const [availableNow, setAvailableNow] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<TimezoneRegion | null>(null);

  const regions = getAllRegions();
  const allTimezones = getAllTimezones();

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange({
      selectedTimezone,
      selectedRegions,
      similarToMine,
      availableNow,
    });
  }, [selectedTimezone, selectedRegions, similarToMine, availableNow, onFilterChange]);

  const handleRegionToggle = (region: TimezoneRegion) => {
    setSelectedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
    // Clear timezone selection when changing regions
    if (expandedRegion !== region) {
      setSelectedTimezone(undefined);
    }
    setExpandedRegion(expandedRegion === region ? null : region);
  };

  const handleTimezoneSelect = (timezone: string) => {
    setSelectedTimezone(timezone === selectedTimezone ? undefined : timezone);
  };

  const handleSimilarToMine = () => {
    setSimilarToMine(!similarToMine);
  };

  const handleAvailableNow = () => {
    setAvailableNow(!availableNow);
  };

  const clearFilters = () => {
    setSelectedRegions([]);
    setSelectedTimezone(undefined);
    setSimilarToMine(false);
    setAvailableNow(false);
    setExpandedRegion(null);
  };

  const activeFilterCount = 
    (selectedRegions.length > 0 ? 1 : 0) +
    (selectedTimezone ? 1 : 0) +
    (similarToMine ? 1 : 0) +
    (availableNow ? 1 : 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Timezone Filter</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-xs font-bold text-blue-600">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Quick Filter Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleSimilarToMine}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition ${
              similarToMine
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Similar to Mine (±3h)</span>
            <span className={`ml-auto h-4 w-4 rounded border flex items-center justify-center ${
              similarToMine ? 'bg-green-500 border-green-500' : 'border-gray-300'
            }`}>
              {similarToMine && <span className="text-white text-xs">✓</span>}
            </span>
          </button>

          <button
            onClick={handleAvailableNow}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition ${
              availableNow
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Available Now</span>
            <span className={`ml-auto h-4 w-4 rounded border flex items-center justify-center ${
              availableNow ? 'bg-green-500 border-green-500' : 'border-gray-300'
            }`}>
              {availableNow && <span className="text-white text-xs">✓</span>}
            </span>
          </button>
        </div>

        <hr className="border-gray-200" />

        {/* Region Selection */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Select by Region</p>
          <div className="space-y-1">
            {regions.map(region => (
              <div key={region} className="space-y-1">
                <button
                  onClick={() => handleRegionToggle(region)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition ${
                    selectedRegions.includes(region)
                      ? 'border-blue-300 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm font-medium">{region}</span>
                  <span className="text-gray-400">
                    {expandedRegion === region ? '−' : '+'}
                  </span>
                </button>

                {/* Timezone Options for Region */}
                {expandedRegion === region && (
                  <div className="pl-3 space-y-1 border-l-2 border-blue-200">
                    {getTimezonesByRegion(region).map(tz => (
                      <button
                        key={tz.ianaId}
                        onClick={() => handleTimezoneSelect(tz.ianaId)}
                        className={`w-full text-left px-3 py-2 rounded text-xs transition ${
                          selectedTimezone === tz.ianaId
                            ? 'bg-blue-100 text-blue-900 font-medium'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{tz.label}</span>
                          <span className="text-gray-500">{tz.displayName}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
          <p className="font-medium mb-1">Timezone filtering:</p>
          <ul className="space-y-1 text-blue-700">
            <li>• Select regions or specific timezones</li>
            <li>• Use "Similar to Mine" for nearby mentors</li>
            <li>• Enable "Available Now" to see active mentors</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
