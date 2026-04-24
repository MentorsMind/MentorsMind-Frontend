import { useState, useCallback, useEffect } from 'react';
import { LearnerProfile } from '../types/learner.types';
import { storage } from '../utils/client.storage.utils';

const STORAGE_KEY = 'learner_profile';

const DEFAULT_PROFILE: LearnerProfile = {
  id: '1',
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  bio: 'Passionate developer looking to master blockchain development.',
  introduction: "Hi, I'm John! I've been working as a web developer for 3 years and now I want to transition into the Stellar ecosystem.",
  learningGoals: ['Stellar Development', 'Rust', 'Smart Contracts'],
  skillLevels: [
    { topic: 'JavaScript', level: 'advanced' },
    { topic: 'Rust', level: 'beginner' },
    { topic: 'Stellar', level: 'beginner' },
  ],
  interests: ['Blockchain', 'Open Source', 'FinTech'],
  preferredLearningStyle: 'visual',
  timezone: 'UTC-5',
  language: 'English',
  visibility: 'public',
  achievements: [
    {
      id: '1',
      title: 'First Session',
      description: 'Completed your first mentoring session.',
      unlocked: true,
      unlockedAt: '2023-10-01T10:00:00Z',
      icon: '🎯',
    },
    {
      id: '2',
      title: 'Quick Learner',
      description: 'Completed 5 sessions in a week.',
      unlocked: false,
      icon: '⚡',
    },
  ],
};

export const useLearnerProfile = () => {
  const [profile, setProfile] = useState<LearnerProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedProfile = storage.get<LearnerProfile>(STORAGE_KEY);
    if (savedProfile) {
      setProfile(savedProfile);
    }
    setIsLoading(false);
  }, []);

  const updateProfile = useCallback((updates: Partial<LearnerProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      storage.set(STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  const uploadPhoto = useCallback(async (file: File) => {
    // In a real app, this would upload to a server/S3
    // For now, we'll use a local URL
    const url = URL.createObjectURL(file);
    updateProfile({ avatarUrl: url });
    return url;
  }, [updateProfile]);

  return {
    profile,
    updateProfile,
    uploadPhoto,
    isLoading,
  };
};
