import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MentorCard from '../components/search/MentorCard';
import type { MentorProfile } from '../types';

const mockMentor: MentorProfile = {
  id: 'm1',
  name: 'Dr. Sarah Chen',
  title: 'Senior Blockchain Developer',
  bio: 'Passionate about Stellar ecosystem development',
  avatar: 'https://example.com/avatar.jpg',
  hourlyRate: 85,
  currency: 'XLM',
  rating: 4.9,
  reviewCount: 127,
  totalSessions: 342,
  completionRate: 98,
  skills: ['Stellar', 'Soroban', 'Smart Contracts', 'Web3'],
  expertise: ['Blockchain', 'DeFi'],
  languages: ['English', 'Mandarin'],
  availability: {
    days: ['Monday', 'Wednesday', 'Friday'],
    timeSlots: ['9:00-12:00', '14:00-17:00'],
    timezone: 'UTC-5',
  },
  experienceYears: 8,
  certifications: ['Certified Stellar Developer'],
  isAvailable: true,
  responseTime: 'Within 1 hour',
  joinedDate: '2023-01-15',
};

describe('MentorCard Component', () => {
  const mockProps = {
    mentor: mockMentor,
    isSaved: false,
    onSave: vi.fn(),
    onViewProfile: vi.fn(),
    viewMode: 'grid' as const,
  };

  it('should render mentor information correctly', () => {
    render(<MentorCard {...mockProps} />);
    
    expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Senior Blockchain Developer')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('(127)')).toBeInTheDocument();
    expect(screen.getByText('342 sessions')).toBeInTheDocument();
  });

  it('should display hourly rate', () => {
    render(<MentorCard {...mockProps} />);
    
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('XLM')).toBeInTheDocument();
  });

  it('should display skills', () => {
    render(<MentorCard {...mockProps} />);
    
    expect(screen.getByText('STELLAR')).toBeInTheDocument();
    expect(screen.getByText('SOROBAN')).toBeInTheDocument();
    expect(screen.getByText('SMART CONTRACTS')).toBeInTheDocument();
  });

  it('should call onSave when save button is clicked', () => {
    const onSaveMock = vi.fn();
    render(<MentorCard {...mockProps} onSave={onSaveMock} />);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    expect(onSaveMock).toHaveBeenCalledWith('m1');
  });

  it('should show saved state when isSaved is true', () => {
    render(<MentorCard {...mockProps} isSaved={true} />);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toHaveClass('bg-stellar');
  });

  it('should call onViewProfile when View Profile button is clicked', () => {
    const onViewProfileMock = vi.fn();
    render(<MentorCard {...mockProps} onViewProfile={onViewProfileMock} />);
    
    const viewButton = screen.getByText('View Profile');
    fireEvent.click(viewButton);
    
    expect(onViewProfileMock).toHaveBeenCalledWith(mockMentor);
  });

  it('should display availability indicator when mentor is available', () => {
    render(<MentorCard {...mockProps} />);
    
    // The green dot indicating availability should be present
    const availabilityIndicator = document.querySelector('.bg-green-500');
    expect(availabilityIndicator).toBeInTheDocument();
  });

  it('should show completion rate', () => {
    render(<MentorCard {...mockProps} />);
    
    expect(screen.getByText('98% success')).toBeInTheDocument();
  });

  it('should handle list view mode', () => {
    render(<MentorCard {...mockProps} viewMode="list" />);
    
    // In list view, the card should have flex layout
    const card = screen.getByText('Dr. Sarah Chen').closest('.group');
    expect(card).toHaveClass('flex');
  });

  it('should truncate long skill lists with "+X more"', () => {
    const mentorWithMoreSkills = {
      ...mockMentor,
      skills: [...mockMentor.skills, 'Python', 'JavaScript', 'TypeScript'],
    };
    
    render(<MentorCard {...mockProps} mentor={mentorWithMoreSkills} />);
    
    expect(screen.getByText('+3 more')).toBeInTheDocument();
  });
});
