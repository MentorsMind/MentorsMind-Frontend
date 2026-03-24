import React from 'react';
import { useOnboarding } from '../../hooks/useOnboarding';
import ProgressIndicator from './ProgressIndicator';
import OnboardingWizard from './OnboardingWizard';
import OnboardingChecklist from './OnboardingChecklist';

const MentorOnboarding: React.FC = () => {
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
  } = useOnboarding();

  if (isCelebrated) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in zoom-in duration-700">
        <div className="w-24 h-24 bg-stellar/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 animate-bounce">
          🚀
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">You're All Set!</h1>
        <p className="text-xl text-gray-600 mb-10">
          Your mentor profile is now active and ready for the Stellar community.
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
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-linear-to-r from-stellar to-stellar-light rounded-3xl p-8 text-white shadow-xl">
            <h1 className="text-3xl font-bold mb-2">Welcome Back, Mentor!</h1>
            <p className="opacity-90">You skipped the guided setup. You can always finish it later to unlock your full potential.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Mock Dashboard Widgets */}
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <h4 className="font-bold text-gray-400 text-xs uppercase mb-4">Earnings</h4>
               <div className="text-3xl font-bold">0.00 XLM</div>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <h4 className="font-bold text-gray-400 text-xs uppercase mb-4">Upcoming Sessions</h4>
               <div className="text-gray-400 italic">None scheduled</div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <OnboardingChecklist
            completedSteps={completedSteps}
            onStepClick={() => {
               // Logic to jump back to wizard
               resumeOnboarding();
            }}
            isDismissed={isDismissed}
            onResume={resumeOnboarding}
          />
        </div>
      </div>
    );
  }

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

        <ProgressIndicator
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          progress={progress}
        />

        <OnboardingWizard
          currentStep={currentStep}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipToDashboard}
          onComplete={completeOnboarding}
          updateData={updateData}
          data={data}
        />
      </div>
      
      <p className="text-center mt-10 text-gray-400 text-sm">
        Questions? <a href="#" className="text-stellar font-bold hover:underline">Chat with Support</a>
      </p>
    </div>
  );
};

export default MentorOnboarding;
