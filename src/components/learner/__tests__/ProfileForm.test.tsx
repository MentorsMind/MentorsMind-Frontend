import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileForm } from '../ProfileForm';
import { LearnerProfile } from '../../../types/learner.types';

const mockProfile: LearnerProfile = {
  id: '1',
  fullName: 'John Doe',
  email: 'john@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  bio: 'Developer bio',
  introduction: 'Hello introduction',
  learningGoals: ['Stellar'],
  skillLevels: [
    { topic: 'JavaScript', level: 'advanced' },
  ],
  interests: ['Blockchain'],
  preferredLearningStyle: 'visual',
  timezone: 'UTC-5',
  language: 'English',
  visibility: 'public',
  achievements: [],
};

describe('ProfileForm Component', () => {
  const mockProps = {
    initialData: mockProfile,
    onSubmit: vi.fn(),
    onPhotoUpload: vi.fn().mockResolvedValue('new-avatar-url'),
    onCancel: vi.fn(),
  };

  it('should render initial data correctly', () => {
    render(<ProfileForm {...mockProps} />);
    
    expect(screen.getByLabelText(/full name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/bio/i)).toHaveValue('Developer bio');
    expect(screen.getByLabelText(/introduction/i)).toHaveValue('Hello introduction');
    expect(screen.getByText('Stellar')).toBeInTheDocument();
  });

  it('should call onSubmit with updated data', async () => {
    const onSubmitMock = vi.fn();
    render(<ProfileForm {...mockProps} onSubmit={onSubmitMock} />);
    
    const fullNameInput = screen.getByLabelText(/full name/i);
    fireEvent.change(fullNameInput, { target: { value: 'Jane Doe' } });
    
    const saveButton = screen.getByText(/save profile/i);
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith(expect.objectContaining({
        fullName: 'Jane Doe',
      }));
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onCancelMock = vi.fn();
    render(<ProfileForm {...mockProps} onCancel={onCancelMock} />);
    
    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);
    
    expect(onCancelMock).toHaveBeenCalled();
  });

  it('should handle skill level changes', async () => {
    const onSubmitMock = vi.fn();
    render(<ProfileForm {...mockProps} onSubmit={onSubmitMock} />);
    
    // Find skill indicators - they're buttons
    const skillButtons = screen.getAllByRole('button', { name: /beginner|intermediate|advanced/i });
    // Click on 'beginner' for JavaScript (first skill)
    fireEvent.click(skillButtons[0]); 
    
    const saveButton = screen.getByText(/save profile/i);
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith(expect.objectContaining({
        skillLevels: [{ topic: 'JavaScript', level: 'beginner' }],
      }));
    });
  });
});
