import React from 'react';

interface KYCSteps {
  currentStep: number;
  totalSteps: number;
}

export const KYCProgressBar: React.FC<KYCSteps> = ({ currentStep, totalSteps }) => {
  const steps = [
    { name: 'Personal', icon: '👤' },
    { name: 'Documents', icon: '📄' },
    { name: 'Selfie', icon: '📸' },
    { name: 'Confirm', icon: '✅' },
  ];

  return (
    <div className="flex items-center justify-between relative mb-12">
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-stellar -translate-y-1/2 z-0 transition-all duration-500"
        style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
      />
      {steps.map((step, index) => {
        const isCompleted = index + 1 < currentStep;
        const isActive = index + 1 === currentStep;
        
        return (
          <div key={step.name} className="relative z-10 flex flex-col items-center">
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-lg border-4 transition-all duration-300 ${
                isCompleted 
                  ? 'bg-stellar border-stellar text-white' 
                  : isActive 
                    ? 'bg-white border-stellar text-stellar ring-4 ring-stellar/10' 
                    : 'bg-white border-gray-100 text-gray-400'
              }`}
            >
              <div className="animate-in zoom-in slide-in-from-bottom-2 duration-300 group-hover:scale-110">
                {step.icon}
              </div>
            </div>
            <span 
              className={`absolute top-14 text-xs font-bold uppercase tracking-tight transition-colors ${
                isActive ? 'text-stellar' : isCompleted ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {step.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  updateData: (data: any) => void;
  data: any;
}

export const PersonalInfoForm: React.FC<StepProps> = ({ onNext, updateData, data }) => {
  const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Other'];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">First Name</label>
          <input
            type="text"
            className="w-full h-12 px-5 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-stellar/10 focus:border-stellar transition-all outline-none font-medium"
            placeholder="John"
            defaultValue={data.firstName}
            onChange={(e) => updateData({ firstName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Last Name</label>
          <input
            type="text"
            className="w-full h-12 px-5 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-stellar/10 focus:border-stellar transition-all outline-none font-medium"
            placeholder="Doe"
            defaultValue={data.lastName}
            onChange={(e) => updateData({ lastName: e.target.value })}
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Date of Birth</label>
          <input
            type="date"
            className="w-full h-12 px-5 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-stellar/10 focus:border-stellar transition-all outline-none font-medium"
            defaultValue={data.dob}
            onChange={(e) => updateData({ dob: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Country</label>
          <select
            className="w-full h-12 px-5 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-stellar/10 focus:border-stellar transition-all outline-none font-medium appearance-none"
            defaultValue={data.country}
            onChange={(e) => updateData({ country: e.target.value })}
          >
            <option value="">Select Country</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <button 
        onClick={onNext}
        className="w-full h-14 bg-stellar text-white font-black rounded-[1.5rem] shadow-xl shadow-stellar/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8"
      >
        Next Step
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5-5 5M6 7l5 5-5 5" />
        </svg>
      </button>
    </div>
  );
};
