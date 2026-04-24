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
              ${i < current ? 'bg-primary text-primary-foreground' : i === current ? 'bg-accent text-accent-foreground ring-2 ring-primary' : 'bg-surface text-muted-foreground'}`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === current ? 'text-primary' : 'text-muted-foreground'}`}>{s.title}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < current ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div>{steps[current].content}</div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border">
        <Button variant="outline" onClick={() => setCurrent(c => c - 1)} disabled={current === 0}>Back</Button>
        <Button onClick={isLast ? onComplete : () => setCurrent(c => c + 1)} disabled={!canProceed}>
          {isLast ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
