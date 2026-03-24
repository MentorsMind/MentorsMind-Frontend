import React, { useState } from 'react';
import { WizardStep } from '../../types/forms.types';

type FormWizardProps = {
  steps: WizardStep[];
  onComplete: (data: any) => void;
  onCancel?: () => void;
  className?: string;
};

export const FormWizard: React.FC<FormWizardProps> = ({
  steps,
  onComplete,
  onCancel,
  className = ''
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isValidating, setIsValidating] = useState(false);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = async () => {
    if (currentStep.validate) {
      setIsValidating(true);
      const isValid = await currentStep.validate();
      setIsValidating(false);
      
      if (!isValid) return;
    }

    if (isLastStep) {
      onComplete(formData);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleStepClick = (index: number) => {
    if (index < currentStepIndex) {
      setCurrentStepIndex(index);
    }
  };

  const updateFormData = (stepData: any) => {
    setFormData((prev: any) => ({ ...prev, ...stepData }));
  };

  const StepComponent = currentStep.component;

  return (
    <div className={`form-wizard ${className}`}>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <button
                    type="button"
                    onClick={() => handleStepClick(index)}
                    disabled={index > currentStepIndex}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-green-600 text-white cursor-pointer'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {isCompleted ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </button>
                  <span className={`mt-2 text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-xs text-gray-400 text-center mt-1">
                      {step.description}
                    </span>
                  )}
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        <StepComponent 
          data={formData}
          updateData={updateFormData}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
          )}
        </div>
        
        <div className="flex space-x-3">
          {!isFirstStep && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isValidating}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Back
            </button>
          )}
          
          <button
            type="button"
            onClick={handleNext}
            disabled={isValidating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isValidating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Validating...
              </>
            ) : isLastStep ? (
              'Complete'
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
