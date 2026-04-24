import React from 'react';
import { useKYC } from '../hooks/useKYC';
import { KYCProgressBar, PersonalInfoForm } from '../components/compliance/KYCSteps';
import { DocumentUpload } from '../components/compliance/DocumentUpload';
import { SelfieCapture } from '../components/compliance/SelfieCapture';
import { useNavigate } from 'react-router-dom';

const KYCVerification: React.FC = () => {
  const { 
    step, nextStep, prevStep, updateKycData, kycData, submitKYC, status, setStep 
  } = useKYC();
  
  const navigate = useNavigate();

  const handleFinish = async () => {
    await submitKYC();
    // In a real app, this would redirect or show success
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Identity Verification</h1>
        <p className="text-gray-500 font-medium">Verify your identity to unlock higher transaction limits and additional features.</p>
      </div>

      <div className="bg-white rounded-[3.5rem] p-10 md:p-20 shadow-2xl shadow-stellar/5 border border-gray-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-stellar/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-stellar/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

        <KYCProgressBar currentStep={step} totalSteps={4} />

        {status === 'pending' ? (
           <div className="text-center py-20 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 animate-bounce shadow-xl">
               ⏳
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Verification Pending</h2>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto">
              Your identity verification is being reviewed. This usually takes 24-48 hours. We'll notify you once it's complete.
            </p>
            <button 
              onClick={() => navigate('/wallet')}
              className="px-10 py-4 bg-gray-100 text-gray-900 font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
            >
              Back to Wallet
            </button>
          </div>
        ) : (
          <>
            {step === 1 && (
              <PersonalInfoForm 
                onNext={nextStep} 
                onPrev={prevStep} 
                updateData={updateKycData} 
                data={kycData} 
              />
            )}
            {step === 2 && (
              <DocumentUpload 
                onNext={nextStep} 
                onPrev={prevStep} 
                updateData={updateKycData} 
                data={kycData} 
              />
            )}
            {step === 3 && (
              <SelfieCapture 
                onNext={nextStep} 
                onPrev={prevStep} 
                updateData={updateKycData} 
                data={kycData} 
              />
            )}
            {step === 4 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                  <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <span className="text-stellar">🔍</span> Review Your Information
                  </h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
                      <div className="font-bold text-gray-900 mt-1">{kycData.firstName} {kycData.lastName}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Country</label>
                      <div className="font-bold text-gray-900 mt-1">{kycData.country}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Document Type</label>
                      <div className="font-bold text-gray-900 mt-1 uppercase">{kycData.documentType?.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Selfie Status</label>
                      <div className="font-bold text-emerald-500 mt-1">Ready ✅</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-stellar/5 rounded-[1.5rem] border border-stellar/10 text-xs font-bold text-stellar leading-relaxed">
                  ⚠️ By submitting, you confirm that the information provided is accurate and belongs to you. Providing false information may lead to account suspension.
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={prevStep}
                    className="flex-1 h-16 bg-gray-100 text-gray-900 font-black rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    Go Back
                  </button>
                  <button 
                    onClick={handleFinish}
                    className="flex-[2] h-16 bg-stellar text-white font-black rounded-2xl shadow-2xl shadow-stellar/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    Submit Verification
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="mt-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-8">
        <div className="flex items-center gap-2">
          <span>🔒</span> SECURE SSL ENCRYPTION
        </div>
        <div className="flex items-center gap-2">
          <span>🆔</span> IDENTITY VERIFICATION
        </div>
      </div>
    </div>
  );
};

export default KYCVerification;
