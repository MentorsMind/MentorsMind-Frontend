import { useState } from 'react';
import MentorCard from '../components/mentor/MentorCard';
import PaymentModal from '../components/payment/PaymentModal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import type { Mentor } from '../types';

// Mock data
const MOCK_MENTORS: Mentor[] = [
  { id: '1', email: 'alice@example.com', name: 'Alice Chen', role: 'mentor', bio: 'Senior Rust & Blockchain engineer with 8 years experience. Soroban smart contract specialist.', skills: ['Rust', 'Soroban', 'Stellar', 'WebAssembly'], hourlyRate: 120, currency: 'USDC', rating: 4.9, reviewCount: 87, sessionCount: 312, isVerified: true, timezone: 'UTC-8', languages: ['English', 'Mandarin'], createdAt: '' },
  { id: '2', email: 'bob@example.com', name: 'Bob Martinez', role: 'mentor', bio: 'Full-stack developer specializing in React, TypeScript, and Node.js. 6 years building production apps.', skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'], hourlyRate: 90, currency: 'XLM', rating: 4.7, reviewCount: 54, sessionCount: 198, isVerified: true, timezone: 'UTC-5', languages: ['English', 'Spanish'], createdAt: '' },
  { id: '3', email: 'priya@example.com', name: 'Priya Sharma', role: 'mentor', bio: 'Machine learning engineer at a top AI lab. Expert in Python, TensorFlow, and data science.', skills: ['Python', 'TensorFlow', 'ML', 'Data Science'], hourlyRate: 150, currency: 'USDC', rating: 5.0, reviewCount: 32, sessionCount: 145, isVerified: true, timezone: 'UTC+5:30', languages: ['English', 'Hindi'], createdAt: '' },
  { id: '4', email: 'james@example.com', name: 'James Okafor', role: 'mentor', bio: 'DevOps and cloud architect. AWS certified. Kubernetes, Docker, and CI/CD expert.', skills: ['AWS', 'Kubernetes', 'Docker', 'DevOps'], hourlyRate: 110, currency: 'USDC', rating: 4.8, reviewCount: 61, sessionCount: 220, isVerified: false, timezone: 'UTC+1', languages: ['English'], createdAt: '' },
];

const ALL_SKILLS = ['Rust', 'React', 'TypeScript', 'Python', 'Soroban', 'Stellar', 'Node.js', 'AWS', 'ML', 'Docker'];

export default function MentorSearch() {
  const [query, setQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState('');
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);

  const toggleSkill = (s: string) =>
    setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const filtered = MOCK_MENTORS.filter(m => {
    const matchQuery = !query || m.name.toLowerCase().includes(query.toLowerCase()) || m.skills.some(s => s.toLowerCase().includes(query.toLowerCase()));
    const matchSkills = selectedSkills.length === 0 || selectedSkills.every(s => m.skills.includes(s));
    const matchPrice = !maxPrice || m.hourlyRate <= Number(maxPrice);
    return matchQuery && matchSkills && matchPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Find a Mentor</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input placeholder="Search by name or skill..." value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <Input placeholder="Max price (per hour)" type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="md:w-48" />
          </div>
          {/* Skill filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {ALL_SKILLS.map(s => (
              <button key={s} onClick={() => toggleSkill(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors
                  ${selectedSkills.includes(s) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500 mb-6">{filtered.length} mentor{filtered.length !== 1 ? 's' : ''} found</p>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-medium">No mentors found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(m => <MentorCard key={m.id} mentor={m} onBook={setBookingMentor} />)}
          </div>
        )}
      </div>

      {bookingMentor && (
        <PaymentModal isOpen={!!bookingMentor} onClose={() => setBookingMentor(null)} mentor={bookingMentor} sessionDuration={60} />
      )}
    </div>
  );
}
