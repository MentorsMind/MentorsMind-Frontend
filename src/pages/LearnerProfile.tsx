import { useState } from 'react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/forms/Select';
import FileUpload from '../components/forms/FileUpload';

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default function LearnerProfile() {
  const [name, setName] = useState('John Doe');
  const [level, setLevel] = useState('intermediate');
  const [interests, setInterests] = useState('React, TypeScript');
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <FileUpload label="Profile Photo" accept="image/*" onFile={() => {}} />
        <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
        <Select label="Skill Level" options={LEVELS} value={level} onChange={setLevel} />
        <Input label="Interests (comma separated)" value={interests} onChange={e => setInterests(e.target.value)} />
        <Button onClick={save}>{saved ? '✓ Saved' : 'Save Changes'}</Button>
      </div>
    </div>
  );
}
