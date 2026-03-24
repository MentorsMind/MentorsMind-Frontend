import React from 'react';
import type { GoalTemplate } from '../../types';

const TEMPLATES: GoalTemplate[] = [
  {
    id: 'tpl1', icon: '⛓️', title: 'Learn Blockchain Development', category: 'technical',
    description: 'Go from zero to deploying smart contracts on a live network.',
    specific: 'Complete a blockchain dev course and deploy 2 contracts',
    measurable: 'Deploy 2 verified contracts to testnet',
    achievable: 'Study 8 hours/week with mentor sessions',
    relevant: 'Foundation for Web3 career',
    milestones: [
      { title: 'Finish blockchain fundamentals module', dueDate: '' },
      { title: 'Write first smart contract', dueDate: '' },
      { title: 'Deploy to testnet', dueDate: '' },
    ],
  },
  {
    id: 'tpl2', icon: '⚛️', title: 'Build a React Portfolio', category: 'project',
    description: 'Create 3 polished React projects to showcase to employers.',
    specific: 'Build and deploy 3 React apps with TypeScript',
    measurable: '3 live projects with GitHub repos and live URLs',
    achievable: '1 project per month with weekly mentor reviews',
    relevant: 'Required for frontend developer job applications',
    milestones: [
      { title: 'Build todo app with TypeScript', dueDate: '' },
      { title: 'Build weather dashboard with API', dueDate: '' },
      { title: 'Build full-stack capstone project', dueDate: '' },
    ],
  },
  {
    id: 'tpl3', icon: '🎓', title: 'Get AWS Certified', category: 'certification',
    description: 'Pass the AWS Solutions Architect Associate exam.',
    specific: 'Pass AWS SAA-C03 exam with score ≥ 750',
    measurable: 'Score tracked via practice exams weekly',
    achievable: 'Study 6 hours/week, take 2 practice exams/week',
    relevant: 'Boosts salary and opens cloud engineering roles',
    milestones: [
      { title: 'Complete AWS core services modules', dueDate: '' },
      { title: 'Score 700+ on first practice exam', dueDate: '' },
      { title: 'Schedule and pass real exam', dueDate: '' },
    ],
  },
  {
    id: 'tpl4', icon: '🚀', title: 'Launch a Side Project', category: 'project',
    description: 'Go from idea to a live product with real users.',
    specific: 'Launch an MVP with 10 active users in 90 days',
    measurable: '10 signups tracked in analytics dashboard',
    achievable: 'Dedicate weekends + mentor accountability sessions',
    relevant: 'Builds entrepreneurial skills and portfolio',
    milestones: [
      { title: 'Define problem and target user', dueDate: '' },
      { title: 'Build and deploy MVP', dueDate: '' },
      { title: 'Get first 10 users', dueDate: '' },
    ],
  },
  {
    id: 'tpl5', icon: '💼', title: 'Land a Tech Job', category: 'career',
    description: 'Systematically job search and land your first or next tech role.',
    specific: 'Apply to 30 companies and receive 1 offer',
    measurable: 'Track applications, interviews, and offers in a sheet',
    achievable: '5 applications/week with mentor mock interviews',
    relevant: 'Primary career objective',
    milestones: [
      { title: 'Polish resume and LinkedIn', dueDate: '' },
      { title: 'Complete 5 mock interviews', dueDate: '' },
      { title: 'Apply to first 15 companies', dueDate: '' },
    ],
  },
  {
    id: 'tpl6', icon: '🗣️', title: 'Improve Communication Skills', category: 'soft-skills',
    description: 'Become a confident communicator in technical and non-technical settings.',
    specific: 'Give 3 presentations and lead 2 team meetings',
    measurable: 'Peer feedback score ≥ 4/5 on each presentation',
    achievable: 'Practice with mentor weekly, join a speaking group',
    relevant: 'Critical for senior roles and leadership',
    milestones: [
      { title: 'Join a public speaking group', dueDate: '' },
      { title: 'Give first internal presentation', dueDate: '' },
      { title: 'Lead a team meeting or workshop', dueDate: '' },
    ],
  },
];

const CATEGORY_STYLES: Record<string, string> = {
  technical: 'bg-blue-50 text-blue-600',
  career: 'bg-violet-50 text-violet-600',
  project: 'bg-amber-50 text-amber-600',
  certification: 'bg-emerald-50 text-emerald-600',
  'soft-skills': 'bg-pink-50 text-pink-600',
};

interface GoalTemplatesProps {
  onApply: (template: GoalTemplate) => void;
  onClose: () => void;
}

const GoalTemplates: React.FC<GoalTemplatesProps> = ({ onApply, onClose }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Goal Templates</h3>
          <p className="text-xs text-gray-400 mt-0.5">Start from a proven framework</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none" aria-label="Close templates">×</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TEMPLATES.map(tpl => (
          <div key={tpl.id} className="border border-gray-100 rounded-xl p-4 hover:border-stellar/30 hover:bg-stellar/5 transition-all group">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{tpl.icon}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${CATEGORY_STYLES[tpl.category]}`}>
                  {tpl.category}
                </span>
              </div>
            </div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">{tpl.title}</h4>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">{tpl.description}</p>
            <div className="text-xs text-gray-400 mb-3">
              {tpl.milestones.length} milestones included
            </div>
            <button
              onClick={() => { onApply(tpl); onClose(); }}
              className="w-full py-2 text-xs font-bold rounded-lg bg-stellar/10 text-stellar hover:bg-stellar hover:text-white transition-all"
            >
              Use This Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalTemplates;
