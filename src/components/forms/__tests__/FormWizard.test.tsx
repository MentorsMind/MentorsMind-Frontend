import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormWizard } from '../FormWizard';

const Step1 = ({ data, updateData }: any) => (
  <div>
    <input
      value={data.name || ''}
      onChange={(e) => updateData({ name: e.target.value })}
      placeholder="Enter name"
    />
  </div>
);

const Step2 = ({ data, updateData }: any) => (
  <div>
    <input
      value={data.email || ''}
      onChange={(e) => updateData({ email: e.target.value })}
      placeholder="Enter email"
    />
  </div>
);

const steps = [
  {
    id: 'step1',
    title: 'Step 1',
    description: 'First step',
    component: Step1
  },
  {
    id: 'step2',
    title: 'Step 2',
    description: 'Second step',
    component: Step2
  }
];

describe('FormWizard', () => {
  it('renders first step', () => {
    render(<FormWizard steps={steps} onComplete={vi.fn()} />);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });

  it('navigates to next step', async () => {
    const user = userEvent.setup();
    render(<FormWizard steps={steps} onComplete={vi.fn()} />);
    
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('navigates back to previous step', async () => {
    const user = userEvent.setup();
    render(<FormWizard steps={steps} onComplete={vi.fn()} />);
    
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Back'));
    
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });

  it('completes wizard on last step', async () => {
    const user = userEvent.setup();
    const handleComplete = vi.fn();
    
    render(<FormWizard steps={steps} onComplete={handleComplete} />);
    
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Complete'));
    
    expect(handleComplete).toHaveBeenCalled();
  });

  it('shows progress indicators', () => {
    render(<FormWizard steps={steps} onComplete={vi.fn()} />);
    
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('validates step before proceeding', async () => {
    const user = userEvent.setup();
    const validate = vi.fn().mockResolvedValue(false);
    
    const stepsWithValidation = [
      { ...steps[0], validate },
      steps[1]
    ];
    
    render(<FormWizard steps={stepsWithValidation} onComplete={vi.fn()} />);
    
    await user.click(screen.getByText('Next'));
    
    expect(validate).toHaveBeenCalled();
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });
});
