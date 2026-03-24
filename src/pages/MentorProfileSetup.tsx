import React, { useState } from 'react';
import { useMentorProfile } from '../hooks/useMentorProfile';
import { useAvailability } from '../hooks/useAvailability';
import { ProfileForm } from '../components/mentor/ProfileForm';
import { ProfilePreview } from '../components/mentor/ProfilePreview';
import { AvailabilityCalendar } from '../components/mentor/AvailabilityCalendar';
import { TimeSlotEditor } from '../components/mentor/TimeSlotEditor';
import { TimezoneSelector } from '../components/mentor/TimezoneSelector';
import { RecurringAvailability } from '../components/mentor/RecurringAvailability';
import { CalendarSync } from '../components/mentor/CalendarSync';
import { generateRecurringSlots } from '../utils/calendar.utils';

export const MentorProfileSetup = () => {
  const [currentStep, setCurrentStep] = useState<'profile' | 'availability'>('profile');
  const [showPreview, setShowPreview] = useState(false);
  const [showTimeSlotEditor, setShowTimeSlotEditor] = useState(false);
  const [syncedCalendars, setSyncedCalendars] = useState<string[]>([]);

  const {
    profile,
    loading: profileLoading,
    updateProfile,
    saveProfile,
    addPortfolioItem,
    removePortfolioItem,
  } = useMentorProfile();

  const {
    timeSlots,
    timezone,
    loading: availabilityLoading,
    setTimezone,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    copyFromPreviousWeek,
    saveAvailability,
  } = useAvailability();

  const handleSave = async () => {
    if (currentStep === 'profile') {
      const result = await saveProfile();
      if (result.success) {
        setCurrentStep('availability');
      }
    } else {
      await saveAvailability();
    }
  };

  const handleRecurringPattern = (pattern: any, baseSlot: { start: Date; end: Date }) => {
    const slots = generateRecurringSlots(baseSlot, pattern);
    slots.forEach((slot) => {
      addTimeSlot({
        start: slot.start,
        end: slot.end,
        isBooked: false,
        isBlocked: false,
        recurring: pattern,
      });
    });
  };

  const handleCalendarSync = (provider: 'google' | 'outlook' | 'apple') => {
    setSyncedCalendars((prev: string[]) =>
      prev.includes(provider) ? prev.filter((p: string) => p !== provider) : [...prev, provider]
    );
  };

  const steps = [
    { id: 'profile', label: 'Profile Setup', icon: '👤' },
    { id: 'availability', label: 'Availability', icon: '📅' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentor Dashboard Setup</h1>
          <p className="text-gray-600">Complete your profile and set your availability</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setCurrentStep(step.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  <span>{step.icon}</span>
                  <span className="font-medium">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-blue-900">Profile Completion</span>
                <div className="w-64 h-2 bg-blue-200 rounded-full mt-2">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${profile.completionPercentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{profile.completionPercentage}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {currentStep === 'profile' ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Preview Profile
                </button>
              </div>

              <ProfileForm
                profile={profile}
                onUpdate={updateProfile}
                onAddPortfolio={addPortfolioItem}
                onRemovePortfolio={removePortfolioItem}
              />
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Availability & Scheduling</h2>
                <div className="flex flex-wrap gap-2">
                  <CalendarSync onSync={handleCalendarSync} syncedCalendars={syncedCalendars} />
                  <button
                    onClick={copyFromPreviousWeek}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Copy Previous Week
                  </button>
                  <RecurringAvailability onApply={handleRecurringPattern} />
                  <button
                    onClick={() => setShowTimeSlotEditor(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + Add Time Slot
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <TimezoneSelector value={timezone} onChange={setTimezone} />
              </div>

              <AvailabilityCalendar
                timeSlots={timeSlots}
                onSlotClick={(slot: any) => console.log('Slot clicked:', slot)}
                onDeleteSlot={deleteTimeSlot}
                onSlotUpdate={updateTimeSlot}
              />
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(currentStep === 'profile' ? 'profile' : 'profile')}
              disabled={currentStep === 'profile'}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              onClick={handleSave}
              disabled={profileLoading || availabilityLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {profileLoading || availabilityLoading
                ? 'Saving...'
                : currentStep === 'profile'
                ? 'Save & Continue'
                : 'Save Availability'}
            </button>
          </div>
        </div>
      </div>

      {showPreview && <ProfilePreview profile={profile} onClose={() => setShowPreview(false)} />}
      {showTimeSlotEditor && (
        <TimeSlotEditor onAdd={addTimeSlot} onClose={() => setShowTimeSlotEditor(false)} />
      )}
    </div>
  );
};
