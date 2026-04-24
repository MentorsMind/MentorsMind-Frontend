import { useState } from 'react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import FileUpload from '../components/forms/FileUpload';
import PricingSettings from '../components/mentor/PricingSettings';
import AvailabilityCalendar from '../components/mentor/AvailabilityCalendar';

export default function MentorProfile() {
  const [name, setName] = useState('Alice Chen');
  const [bio, setBio] = useState('Senior Rust & Blockchain engineer with 8 years experience.');
  const [skills, setSkills] = useState('Rust, Soroban, Stellar');
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Basic Info</h2>
        <FileUpload label="Profile Photo" accept="image/*" onFile={() => {}} />
        <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        </div>
        <Input label="Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} />
        <Button onClick={save}>{saved ? '✓ Saved' : 'Save Changes'}</Button>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <PricingSettings />
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Availability</h2>
        <AvailabilityCalendar />
      </section>
    </div>
  );
}
