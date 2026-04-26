import { useState } from 'react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import FileUpload from '../components/forms/FileUpload';
import ProfileHeader from '../components/mentor/ProfileHeader';
import PricingSettings from '../components/mentor/PricingSettings';
import AvailabilityCalendar from '../components/mentor/AvailabilityCalendar';
import type { AvailabilitySchedule } from '../services/mentor.service';

// In a real app this would come from auth context / route params
const MENTOR_ID = 'me';

interface ProfileState {
  name: string;
  bio: string;
  skills: string;
  hourlyRate: number;
  availabilitySchedule: AvailabilitySchedule;
  isAvailable: boolean;
}

export default function MentorProfile() {
  const [profile, setProfile] = useState<ProfileState>({
    name: 'Alice Chen',
    bio: 'Senior Rust & Blockchain engineer with 8 years experience.',
    skills: 'Rust, Soroban, Stellar',
    hourlyRate: 100,
    availabilitySchedule: {},
    isAvailable: true,
  });
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <ProfileHeader
        name={profile.name}
        bio={profile.bio}
        hourlyRate={profile.hourlyRate}
        currency="USD"
        joinDate="2024"
        sessionCount={0}
        learnerCount={0}
        verificationStatus="pending"
      />

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Basic Info</h2>
        <FileUpload label="Profile Photo" accept="image/*" onFile={() => {}} />
        <Input
          label="Full Name"
          value={profile.name}
          onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
        <Input
          label="Skills (comma separated)"
          value={profile.skills}
          onChange={(e) => setProfile((p) => ({ ...p, skills: e.target.value }))}
        />
        <Button onClick={save}>{saved ? '✓ Saved' : 'Save Changes'}</Button>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <PricingSettings
          mentorId={MENTOR_ID}
          initialRate={profile.hourlyRate}
          onRateChange={(rate) => setProfile((p) => ({ ...p, hourlyRate: rate }))}
        />
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <AvailabilityCalendar
          mentorId={MENTOR_ID}
          initialSchedule={profile.availabilitySchedule}
          initialIsAvailable={profile.isAvailable}
          onScheduleChange={(schedule, isAvailable) =>
            setProfile((p) => ({ ...p, availabilitySchedule: schedule, isAvailable }))
          }
        />
      </section>
    </div>
  );
}
