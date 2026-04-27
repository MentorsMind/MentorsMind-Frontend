import { useState, useCallback, useEffect, useMemo } from 'react';
import UserService, { type UpdateUserPayload, type UserRecord } from '../services/user.service';

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
  notificationPreferences: NotificationPreferences;
  phoneNumber?: string;
  dateOfBirth?: string;
  governmentIdNumber?: string;
  bankAccountDetails?: string;
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

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  [key: string]: boolean | string | number;
}

const userService = new UserService();

const getDefaultNotificationPreferences = (): NotificationPreferences => ({
  email: true,
  sms: false,
  push: true,
});

const getDefaultProfile = (): MentorProfile => ({
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
  notificationPreferences: getDefaultNotificationPreferences(),
  isVisible: true,
  isVerified: false,
  completionPercentage: 0,
});

const mapUserRecordToProfile = (record: UserRecord): MentorProfile => {
  const baseProfile: MentorProfile = {
    ...getDefaultProfile(),
    id: record.id,
    firstName: record.first_name ?? '',
    lastName: record.last_name ?? '',
    email: record.email ?? '',
    bio: record.bio ?? '',
    title: record.title ?? '',
    skills: record.skills ?? [],
    expertise: record.expertise ?? [],
    hourlyRate: record.hourly_rate ?? 0,
    photoUrl: record.photo_url,
    socialLinks: record.social_links ?? {},
    notificationPreferences: {
      ...getDefaultNotificationPreferences(),
      ...(record.notificationPreferences ?? {}),
    } as NotificationPreferences,
    phoneNumber: record.phone_number,
    dateOfBirth: record.date_of_birth,
    governmentIdNumber: record.government_id_number,
    bankAccountDetails: record.bank_account_details,
  };

  return baseProfile;
};

const toUpdatePayload = (profile: MentorProfile): UpdateUserPayload => ({
  first_name: profile.firstName,
  last_name: profile.lastName,
  email: profile.email,
  bio: profile.bio,
  title: profile.title,
  skills: profile.skills,
  expertise: profile.expertise,
  hourly_rate: profile.hourlyRate,
  photo_url: profile.photoUrl,
  social_links: profile.socialLinks,
  // Backend replaces this field; always send the full object.
  notificationPreferences: profile.notificationPreferences,
  phone_number: profile.phoneNumber,
  date_of_birth: profile.dateOfBirth,
  government_id_number: profile.governmentIdNumber,
  bank_account_details: profile.bankAccountDetails,
});

export const useMentorProfile = () => {
  const [profile, setProfile] = useState<MentorProfile>(getDefaultProfile());
  const [savedProfileSnapshot, setSavedProfileSnapshot] = useState<MentorProfile>(getDefaultProfile());

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

  const isDirty = useMemo(
    () => JSON.stringify(profile) !== JSON.stringify(savedProfileSnapshot),
    [profile, savedProfileSnapshot],
  );

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await userService.getMe();
      const mappedProfile = mapUserRecordToProfile(me);
      mappedProfile.completionPercentage = calculateCompletion(mappedProfile);
      setProfile(mappedProfile);
      setSavedProfileSnapshot(mappedProfile);
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [calculateCompletion]);

  const saveProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await userService.updateMe(toUpdatePayload(profile));
      const mappedProfile = mapUserRecordToProfile(updatedUser);
      mappedProfile.completionPercentage = calculateCompletion(mappedProfile);
      setProfile(mappedProfile);
      setSavedProfileSnapshot(mappedProfile);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [profile, calculateCompletion]);

  const addPortfolioItem = useCallback((item: Omit<PortfolioItem, 'id'>) => {
    const newItem: PortfolioItem = { ...item, id: Date.now().toString() };
    updateProfile({ portfolio: [...profile.portfolio, newItem] });
  }, [profile.portfolio, updateProfile]);

  const removePortfolioItem = useCallback((id: string) => {
    updateProfile({ portfolio: profile.portfolio.filter((item: PortfolioItem) => item.id !== id) });
  }, [profile.portfolio, updateProfile]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    isDirty,
    updateProfile,
    loadProfile,
    saveProfile,
    addPortfolioItem,
    removePortfolioItem,
  };
};
