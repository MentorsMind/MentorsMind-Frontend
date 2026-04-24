import React, { useEffect, useState } from 'react';
import { ProfileForm } from '../components/mentor/ProfileForm';
import { ProfilePreview } from '../components/mentor/ProfilePreview';
import { AvailabilityCalendar } from '../components/mentor/AvailabilityCalendar';
import { TimeSlotEditor } from '../components/mentor/TimeSlotEditor';
import { TimezoneSelector } from '../components/mentor/TimezoneSelector';
import { RecurringAvailability } from '../components/mentor/RecurringAvailability';
import { CalendarSync } from '../components/mentor/CalendarSync';
import { generateRecurringSlots } from '../utils/calendar.utils';
import { useTimezone } from '../hooks/useTimezone';
import { useAuthUser } from '../hooks/useAuthUser';
import {
  useMentorProfile,
  useUpdateMentor,
  useUploadMentorPhoto,
  useMentorAvailability,
  useSaveAvailability,
} from '../hooks/queries/useMentors';
import type { TimeSlot } from '../types';

export const MentorProfileSetup = () => {
  const { user } = useAuthUser();
  const mentorId = user?.mentorId ?? '';

  const [currentStep, setCurrentStep] = useState<'profile' | 'availability'>('profile');
  const [showPreview, setShowPreview] = useState(false);
  const [showTimeSlotEditor, setShowTimeSlotEditor] = useState(false);
  const [syncedCalendars, setSyncedCalendars] = useState<string[]>([]);
  const [localSlots, setLocalSlots] = useState<TimeSlot[]>([]);
  const [localTimezone, setLocalTimezone] = useState('UTC');

  const { setTimezone: setUserTimezone } = useTimezone();

  // ─── Queries ──────────────────────────────────────────────────────────────

  const {
    data: profile,
    isLoading: profileLoading,
  } = useMentorProfile(mentorId);

  const {
    data: availabilityData,
    isLoading: availabilityLoading,
  } = useMentorAvailability(mentorId);

  // ─── Mutations ────────────────────────────────────────────────────────────

  const updateMentor = useUpdateMentor(mentorId);
  const uploadPhoto = useUploadMentorPhoto(mentorId);
  const saveAvailability = useSaveAvailability(mentorId);

  // ─── Sync remote availability into local state ────────────────────────────

  useEffect(() => {
    if (availabilityData) {
      setLocalSlots(availabilityData.slots);
      setLocalTimezone(availabilityData.timezone);
    }
  }, [availabilityData]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (currentStep === 'profile') {
      if (!profile) return;
      const result = await updateMentor.mutateAsync(profile);
      if (result) setCurrentStep('availability');
    } else {
      await saveAvailability.mutateAsync({
        slots: localSlots,
        timezone: localTimezone,
      });
    }
  };

  const handleProfileUpdate = (field: string, value: unknown) => {
    // Optimistic local update — the mutation will sync to server on Save
    updateMentor.reset();
    // We rely on the ProfileForm to maintain its own local state and pass
    // the full diff back here; for now forward to the mutation on save.
  };

  const handlePhotoUpload = (file: File) => {
    uploadPhoto.mutate(file);
  };

  const handleRecurringPattern = (pattern: unknown, baseSlot: { start: Date; end: Date }) => {
    const slots = generateRecurringSlots(baseSlot, pattern);
    setLocalSlots((prev) => [
      ...prev,
      ...slots.map((slot) => ({
        start: slot.start,
        end: slot.end,
        isBooked: false,
        isBlocked: false,
        recurring: pattern,
      })),
    ]);
  };

  const handleCalendarSync = (provider: 'google' | 'outlook' | 'apple') => {
    setSyncedCalendars((prev) =>
      prev.includes(provider) ? prev.filter((p) => p !== provider) : [...prev, provider],
    );
  };

  const handleTimezoneChange = (tz: string) => {
    setLocalTimezone(tz);
    setUserTimezone(tz);
  };

  const addTimeSlot = (slot: Omit<TimeSlot, 'id'>) => {
    setLocalSlots((prev) => [...prev, { ...slot, id: crypto.randomUUID() }]);
  };

  const updateTimeSlot = (id: string, updates: Partial<TimeSlot>) => {
    setLocalSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteTimeSlot = (id: string) => {
    setLocalSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const copyFromPreviousWeek = () => {
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const lastWeekSlots = localSlots.filter(
      (s) => s.start.getTime() >= now - 2 * oneWeekMs && s.start.getTime() < now - oneWeekMs,
    );
    const copied = lastWeekSlots.map((s) => ({
      ...s,
      id: crypto.randomUUID(),
      start: new Date(s.start.getTime() + oneWeekMs),
      end: new Date(s.end.getTime() + oneWeekMs),
    }));
    setLocalSlots((prev) => [...prev, ...copied]);
  };

  // ─── Derived state ────────────────────────────────────────────────────────

  const isSaving =
    updateMentor.isPending || saveAvailability.isPending || uploadPhoto.isPending;

  const completionPercentage = profile
    ? Math.round(
        ([
          profile.name,
          profile.title,
          profile.bio,
          profile.avatar,
          profile.skills?.length,
          profile.hourlyRate,
        ].filter(Boolean).length /
          6) *
          100,
      )
    : 0;

  const steps = [
    { id: 'profile', label: 'Profile Setup', icon: '👤' },
    { id: 'availability', label: 'Availability', icon: '📅' },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentor Dashboard Setup</h1>
          <p className="text-gray-600">Complete your profile and set your availability</p>
        </div>

        {/* Step progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setCurrentStep(step.id as 'profile' | 'availability')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  <span>{step.icon}</span>
                  <span className="font-medium">{step.label}</span>
                </button>
                {index < steps.length - 1 && <div className="flex-1 h-1 bg-gray-300 mx-4" />}
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
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{completionPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Mutation error banners */}
        {updateMentor.isError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            Failed to save profile. Please try again.
          </div>
        )}
        {saveAvailability.isError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            Failed to save availability. Please try again.
          </div>
        )}

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

              {profileLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              ) : (
                <ProfileForm
                  profile={profile}
                  onUpdate={handleProfileUpdate}
                  onPhotoUpload={handlePhotoUpload}
                  isUploadingPhoto={uploadPhoto.isPending}
                  onAddPortfolio={() => {}}
                  onRemovePortfolio={() => {}}
                />
              )}
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
                <TimezoneSelector value={localTimezone} onChange={handleTimezoneChange} />
              </div>

              {availabilityLoading ? (
                <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />
              ) : (
                <AvailabilityCalendar
                  timeSlots={localSlots}
                  onSlotClick={(slot) => console.log('Slot clicked:', slot)}
                  onDeleteSlot={deleteTimeSlot}
                  onSlotUpdate={updateTimeSlot}
                  displayTimezone={localTimezone}
                />
              )}
            </div>
          )}

          {/* Footer actions */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep('profile')}
              disabled={currentStep === 'profile'}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || profileLoading || availabilityLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving
                ? 'Saving...'
                : currentStep === 'profile'
                ? 'Save & Continue'
                : 'Save Availability'}
            </button>
          </div>
        </div>
      </div>

      {showPreview && profile && (
        <ProfilePreview profile={profile} onClose={() => setShowPreview(false)} />
      )}
      {showTimeSlotEditor && (
        <TimeSlotEditor onAdd={addTimeSlot} onClose={() => setShowTimeSlotEditor(false)} />
      )}
    </div>
  );
};
