import { useState, ReactNode } from 'react';
import Button from '../ui/Button';

interface Step { title: string; content: ReactNode; }

interface FormWizardProps {
  steps: Step[];
  onComplete: () => void;
  canProceed?: boolean;
}

export default function FormWizard({ steps, onComplete, canProceed = true }: FormWizardProps) {
  const [current, setCurrent] = useState(0);
  const isLast = current === steps.length - 1;

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
              ${i < current ? 'bg-indigo-600 text-white' : i === current ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' : 'bg-gray-100 text-gray-400'}`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === current ? 'text-indigo-700' : 'text-gray-400'}`}>{s.title}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < current ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div>{steps[current].content}</div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={() => setCurrent(c => c - 1)} disabled={current === 0}>Back</Button>
        <Button onClick={isLast ? onComplete : () => setCurrent(c => c + 1)} disabled={!canProceed}>
          {isLast ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
