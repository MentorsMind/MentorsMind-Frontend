import { useState, useCallback } from 'react';
import { updatePricing, updateAvailability } from '../../services/mentor.service';
import type { AvailabilitySchedule } from '../../services/mentor.service';
import { showErrorToast } from '../../utils/toast.utils';

export interface MentorProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  title: string;
  skills: string[];
  expertise: string[];
  hourlyRate: number;
  photoUrl?: string;
  portfolio: PortfolioItem[];
  socialLinks: SocialLinks;
  isVisible: boolean;
  isVerified: boolean;
  completionPercentage: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  type: 'project' | 'certification' | 'achievement';
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
}

export const useMentorProfile = () => {
  const [profile, setProfile] = useState<MentorProfile>({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    title: '',
    skills: [],
    expertise: [],
    hourlyRate: 0,
    portfolio: [],
    socialLinks: {},
    isVisible: true,
    isVerified: false,
    completionPercentage: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateCompletion = useCallback((data: Partial<MentorProfile>) => {
    const fields = [
      data.firstName,
      data.lastName,
      data.bio,
      data.title,
      data.skills?.length,
      data.hourlyRate,
      data.photoUrl,
      data.portfolio?.length,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, []);

  const updateProfile = useCallback((updates: Partial<MentorProfile>) => {
    setProfile((prev: MentorProfile) => {
      const updated = { ...prev, ...updates };
      updated.completionPercentage = calculateCompletion(updated);
      return updated;
    });
  }, [calculateCompletion]);

  const saveProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const addPortfolioItem = useCallback((item: Omit<PortfolioItem, 'id'>) => {
    const newItem: PortfolioItem = { ...item, id: Date.now().toString() };
    updateProfile({ portfolio: [...profile.portfolio, newItem] });
  }, [profile.portfolio, updateProfile]);

  const removePortfolioItem = useCallback((id: string) => {
    updateProfile({ portfolio: profile.portfolio.filter((item: PortfolioItem) => item.id !== id) });
  }, [profile.portfolio, updateProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    saveProfile,
    addPortfolioItem,
    removePortfolioItem,
  };
};

// ─── Partial-update hooks ─────────────────────────────────────────────────────

export function usePricingUpdate(
  mentorId: string,
  onSuccess: (hourlyRate: number) => void,
) {
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (hourlyRate: number, onRollback: () => void) => {
      setSaving(true);
      try {
        const result = await updatePricing(mentorId, hourlyRate);
        onSuccess(result.hourlyRate);
      } catch (err) {
        onRollback();
        showErrorToast(err instanceof Error ? err.message : 'Failed to update pricing');
      } finally {
        setSaving(false);
      }
    },
    [mentorId, onSuccess],
  );

  return { save, saving };
}

export function useAvailabilityUpdate(
  mentorId: string,
  onSuccess: (schedule: AvailabilitySchedule, isAvailable: boolean) => void,
) {
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (
      schedule: AvailabilitySchedule,
      isAvailable: boolean,
      onRollback: () => void,
    ) => {
      setSaving(true);
      try {
        const result = await updateAvailability(mentorId, {
          availability_schedule: schedule,
          is_available: isAvailable,
        });
        onSuccess(result.availability_schedule, result.is_available);
      } catch (err) {
        onRollback();
        showErrorToast(err instanceof Error ? err.message : 'Failed to update availability');
      } finally {
        setSaving(false);
      }
    },
    [mentorId, onSuccess],
  );

  return { save, saving };
}
