import { useState } from 'react';
import FormWizard from '../components/forms/FormWizard';
import Input from '../components/ui/Input';
import Select from '../components/forms/Select';
import FileUpload from '../components/forms/FileUpload';
import { useNavigate } from 'react-router-dom';

export default function MentorOnboarding() {
  const navigate = useNavigate();
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [rate, setRate] = useState('');
  const [currency, setCurrency] = useState('USDC');

  const steps = [
    {
      title: 'Profile',
      content: (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Tell us about yourself</h2>
          <FileUpload label="Profile Photo" accept="image/*" onFile={() => {}} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Describe your experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <Input label="Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, TypeScript, Node.js" />
        </div>
      ),
    },
    {
      title: 'Pricing',
      content: (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Set your rate</h2>
          <Input label="Hourly Rate" type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="100" />
          <Select label="Currency" options={[{ value: 'USDC', label: 'USDC' }, { value: 'XLM', label: 'XLM' }, { value: 'PYUSD', label: 'PYUSD' }]}
            value={currency} onChange={setCurrency} />
        </div>
      ),
    },
    {
      title: 'Wallet',
      content: (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Connect your Stellar wallet</h2>
          <div className="bg-indigo-50 rounded-xl p-6 text-center space-y-3">
            <div className="text-4xl">⭐</div>
            <p className="text-sm text-gray-700">Connect Freighter to receive payments on Stellar</p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              Connect Freighter
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Become a Mentor</h1>
          <p className="text-sm text-gray-500 mt-1">Complete your profile to start earning</p>
        </div>
        <FormWizard steps={steps} onComplete={() => navigate('/mentor/dashboard')} />
      </div>
    </div>
  );
}
