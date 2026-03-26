import React from 'react';
import { useLearnerOnboarding } from '../hooks/useLearnerOnboarding';
import OnboardingStep from '../components/onboarding/OnboardingStep';
import SkillAssessment from '../components/onboarding/SkillAssessment';
import MentorMatching from '../components/onboarding/MentorMatching';
import PlatformTutorial from '../components/onboarding/PlatformTutorial';
import type { LearnerStepId } from '../types';
import { useTimezone } from '../hooks/useTimezone';

const LEARNING_GOALS = [
  { id: 'web3', label: 'Learn Web3 & Blockchain', icon: '⛓️' },
  { id: 'defi', label: 'Understand DeFi', icon: '💰' },
  { id: 'smartcontracts', label: 'Write Smart Contracts', icon: '📜' },
  { id: 'frontend', label: 'Build Frontend Apps', icon: '🖥️' },
  { id: 'career', label: 'Career Transition', icon: '🚀' },
  { id: 'startup', label: 'Launch a Startup', icon: '💡' },
];


// ProgressIndicator expects OnboardingStepId — we cast since it only uses the array for display
const STEP_LABELS: Record<LearnerStepId, string> = {
  goals: 'Goals',
  assessment: 'Skills',
  matching: 'Mentors',
  wallet: 'Wallet',
  tutorial: 'Tutorial',
  complete: 'Done',
};

const LearnerOnboarding: React.FC = () => {

  const { timezone } = useTimezone();
  const {
    currentStep,
    completedSteps,
    steps,
    progress,
    isDismissed,
    isCelebrated,
    data,
    nextStep,
    prevStep,
    skipToDashboard,
    resumeOnboarding,
    completeOnboarding,
    updateData,
  } = useLearnerOnboarding();

  if (isCelebrated) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in zoom-in duration-700">
        <div className="w-24 h-24 bg-stellar/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 animate-bounce">
          🎓
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">You're Ready to Learn!</h1>
        <p className="text-xl text-gray-500 mb-10">
          Your mentor is waiting. Start your first session and begin your journey.
        </p>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="px-8 py-3 bg-stellar text-white font-bold rounded-2xl hover:bg-stellar-dark shadow-xl shadow-stellar/30 transition-all hover:-translate-y-1 active:scale-95"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (isDismissed) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-linear-to-r from-stellar to-stellar-light rounded-3xl p-8 text-white shadow-xl">
            <h1 className="text-3xl font-bold mb-2">Welcome, Learner!</h1>
            <p className="opacity-90">Finish your setup to get matched with the perfect mentor.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-gray-400 text-xs uppercase mb-3">Upcoming Sessions</h4>
              <div className="text-gray-400 italic text-sm">None scheduled</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-gray-400 text-xs uppercase mb-3">Your Mentor</h4>
              <div className="text-gray-400 italic text-sm">Not matched yet</div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <LearnerChecklist completedSteps={completedSteps} onResume={resumeOnboarding} />
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'goals':
        return (
          <OnboardingStep
            title="What do you want to learn?"
            description="Pick your learning goals so we can personalize your experience."
            onNext={nextStep}
            onSkip={skipToDashboard}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LEARNING_GOALS.map(goal => {
                const isSelected = data.goals?.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => {
                      const current = data.goals ?? [];
                      const updated = isSelected
                        ? current.filter((g: string) => g !== goal.id)
                        : [...current, goal.id];
                      updateData('goals', updated);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected ? 'border-stellar bg-stellar/5' : 'border-gray-100 hover:border-stellar/30'
                    }`}
                  >
                    <div className="text-2xl mb-2">{goal.icon}</div>
                    <div className="text-sm font-semibold text-gray-800 leading-tight">{goal.label}</div>
                  </button>
                );
              })}
            </div>
          </OnboardingStep>
        );

      case 'assessment':
        return (
          <SkillAssessment
            skills={data.skills ?? []}
            onUpdate={(skills: import('../types').SkillLevel[]) => updateData('skills', skills)}
            onNext={nextStep}
            onBack={prevStep}
            onSkip={nextStep}
          />
        );

      case 'matching':
        return (
          <MentorMatching
            selectedMentor={data.selectedMentor}
            onSelect={(id: string) => updateData('selectedMentor', id)}
            onNext={nextStep}
            onBack={prevStep}
            onSkip={nextStep}
          />
        );

      case 'wallet':
        return (
          <OnboardingStep
            title="Connect Your Wallet"
            description="Pay for sessions securely using Stellar. Funds are held in escrow until your session is complete."
            onNext={nextStep}
            onBack={prevStep}
            onSkip={nextStep}
          >
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
              <div className="w-16 h-16 bg-stellar/10 rounded-2xl flex items-center justify-center text-stellar mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-6 font-medium">No wallet connected</p>
              <button
                onClick={() => updateData('wallet', { address: 'G...XYZ', connected: true })}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
                  data.wallet?.connected
                    ? 'bg-green-500 text-white'
                    : 'bg-white border-2 border-gray-100 text-gray-900 hover:border-stellar'
                }`}
              >
                {data.wallet?.connected ? '✓ Wallet Connected' : 'Connect Albedo / Freighter'}
              </button>
              {data.wallet?.connected && <p className="mt-4 text-[10px] font-mono text-gray-400">Address: GC...34X</p>}
            </div>
          </OnboardingStep>
        );

      case 'tutorial':
        return <PlatformTutorial onNext={completeOnboarding} onBack={prevStep} />;

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 p-8 md:p-12 border border-gray-50">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stellar rounded-xl flex items-center justify-center text-white font-bold">M</div>
            <span className="font-extrabold text-xl tracking-tight">MentorMinds</span>
          </div>
          <button
            onClick={skipToDashboard}
            className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip to Dashboard
          </button>
        </div>

        {/* Custom progress indicator using step labels */}
        <div className="w-full mb-12">
          <div className="relative h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-stellar transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between px-2">
            {steps.map((step: LearnerStepId, idx: number) => {
              const isCompleted = completedSteps.includes(step) || idx < steps.indexOf(currentStep);
              const isActive = step === currentStep;
              return (
                <div key={step} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isActive ? 'bg-stellar text-white ring-4 ring-stellar/20 scale-110'
                    : isCompleted ? 'bg-green-500 text-white'
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-stellar' : 'text-gray-400'}`}>
                    {STEP_LABELS[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {renderStep()}
      </div>

      <p className="text-center mt-10 text-gray-400 text-sm">
        Questions? <a href="#" className="text-stellar font-bold hover:underline">Chat with Support</a>
      </p>
    </div>
  );
};

// Inline checklist for the dismissed/dashboard view
const CHECKLIST_ITEMS: { id: LearnerStepId; label: string; desc: string }[] = [
  { id: 'goals', label: 'Set Learning Goals', desc: 'Tell us what you want to learn' },
  { id: 'assessment', label: 'Skill Assessment', desc: 'Rate your current knowledge' },
  { id: 'matching', label: 'Choose a Mentor', desc: 'Get matched based on your goals' },
  { id: 'wallet', label: 'Connect Wallet', desc: 'Enable secure session payments' },
  { id: 'tutorial', label: 'Platform Tutorial', desc: 'Learn how MentorMinds works' },
];

const LearnerChecklist: React.FC<{ completedSteps: LearnerStepId[]; onResume: () => void }> = ({ completedSteps, onResume }) => {
  const remaining = CHECKLIST_ITEMS.length - completedSteps.length;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Learner Setup</h3>
          <p className="text-sm text-gray-500">{remaining} tasks remaining</p>
        </div>
        <button onClick={onResume} className="text-xs font-bold text-stellar hover:underline">Resume</button>
      </div>
      
      <div className="space-y-3">
        {CHECKLIST_ITEMS.map(item => {
          const isDone = completedSteps.includes(item.id);
          return (
            <div key={item.id} className="flex items-center gap-3 p-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 ${isDone ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200'}`}>
                {isDone ? '✓' : ''}
              </div>
              <div>
                <div className={`text-sm font-bold ${isDone ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.label}</div>
                {!isDone && <div className="text-[11px] text-gray-400">{item.desc}</div>}
              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
};

export default LearnerOnboarding;
