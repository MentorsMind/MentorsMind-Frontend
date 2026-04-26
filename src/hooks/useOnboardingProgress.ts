import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserRole } from '../types';

export interface OnboardingItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  route?: string;
  isCompleted: boolean;
}

export interface OnboardingChecklistConfig {
  role: UserRole;
  userCreatedAt?: string;
}

export interface OnboardingProgressState {
  items: OnboardingItem[];
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
  isDismissed: boolean;
  isCompleted: boolean;
  shouldDisplay: boolean;
  lastUpdated: string;
}

const STORAGE_KEY_PREFIX = 'onboarding_progress_';
const DISMISSED_KEY_PREFIX = 'onboarding_dismissed_';
const COMPLETED_KEY_PREFIX = 'onboarding_completed_';
const CHECKLIST_CACHE_DURATION = 60000; // 1 minute

const MENTOR_CHECKLIST_ITEMS = [
  {
    id: 'profile',
    label: 'Complete Profile',
    description: 'Add bio, expertise, and profile photo',
    icon: 'User',
    route: '/profile',
  },
  {
    id: 'availability',
    label: 'Set Availability',
    description: 'Define your weekly schedule and time slots',
    icon: 'Calendar',
    route: '/settings/availability',
  },
  {
    id: 'wallet',
    label: 'Connect Wallet',
    description: 'Link your Stellar wallet for payments',
    icon: 'Wallet',
    route: '/wallet',
  },
  {
    id: 'first_session',
    label: 'Complete First Session',
    description: 'Conduct your first mentoring session',
    icon: 'Video',
    route: '/sessions',
  },
];

const LEARNER_CHECKLIST_ITEMS = [
  {
    id: 'profile',
    label: 'Complete Profile',
    description: 'Set your learning goals and preferences',
    icon: 'User',
    route: '/profile',
  },
  {
    id: 'find_mentor',
    label: 'Find a Mentor',
    description: 'Browse and select a mentor that matches your goals',
    icon: 'Search',
    route: '/search',
  },
  {
    id: 'book_session',
    label: 'Book First Session',
    description: 'Schedule your first mentoring session',
    icon: 'Calendar',
    route: '/sessions/book',
  },
  {
    id: 'wallet',
    label: 'Set Up Wallet',
    description: 'Connect your wallet for session payments',
    icon: 'Wallet',
    route: '/wallet',
  },
];

/**
 * Custom hook to manage onboarding progress and checklist state
 * Handles role-based checklists, persistence, and auto-completion detection
 */
export const useOnboardingProgress = (config: OnboardingChecklistConfig) => {
  const [completedItems, setCompletedItems] = useState<Set<string>>(
    new Set()
  );
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  const storageKey = `${STORAGE_KEY_PREFIX}${config.role}`;
  const dismissedKey = `${DISMISSED_KEY_PREFIX}${config.role}`;
  const completedKey = `${COMPLETED_KEY_PREFIX}${config.role}`;

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedCompleted = localStorage.getItem(storageKey);
      const savedDismissed = localStorage.getItem(dismissedKey);
      const savedCompleteStatus = localStorage.getItem(completedKey);

      if (savedCompleted) {
        setCompletedItems(new Set(JSON.parse(savedCompleted)));
      }
      if (savedDismissed === 'true') {
        setIsDismissed(true);
      }
      if (savedCompleteStatus === 'true') {
        setIsCompleted(true);
      }
    } catch (error) {
      console.warn('Failed to load onboarding progress from localStorage:', error);
    }
  }, [storageKey, dismissedKey, completedKey]);

  // Persist completed items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(completedItems)));
    } catch (error) {
      console.warn('Failed to save onboarding progress to localStorage:', error);
    }
  }, [completedItems, storageKey]);

  // Persist dismissed state
  useEffect(() => {
    try {
      localStorage.setItem(dismissedKey, isDismissed ? 'true' : 'false');
    } catch (error) {
      console.warn('Failed to save dismissal state to localStorage:', error);
    }
  }, [isDismissed, dismissedKey]);

  // Persist completion status
  useEffect(() => {
    try {
      localStorage.setItem(completedKey, isCompleted ? 'true' : 'false');
    } catch (error) {
      console.warn('Failed to save completion status to localStorage:', error);
    }
  }, [isCompleted, completedKey]);

  // Get checklists based on role
  const baseItems = useMemo(
    () => (config.role === 'mentor' ? MENTOR_CHECKLIST_ITEMS : LEARNER_CHECKLIST_ITEMS),
    [config.role]
  );

  // Build checklist with completion status
  const items: OnboardingItem[] = useMemo(
    () =>
      baseItems.map((item) => ({
        ...item,
        isCompleted: completedItems.has(item.id),
      })),
    [baseItems, completedItems]
  );

  // Calculate progress
  const completedCount = items.filter((item) => item.isCompleted).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Determine if user is new (account created < 30 days ago)
  const isNewUser = useMemo(() => {
    if (!config.userCreatedAt) return true;
    const createdDate = new Date(config.userCreatedAt);
    const now = new Date();
    const ageInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return ageInDays < 30;
  }, [config.userCreatedAt]);

  // Determine if widget should be displayed
  const shouldDisplay = useMemo(
    () => isNewUser && !isDismissed && !isCompleted,
    [isNewUser, isDismissed, isCompleted]
  );

  // Auto-mark completion when all items are done
  useEffect(() => {
    if (completedCount === totalCount && completedCount > 0 && !isCompleted) {
      setIsCompleted(true);
      setLastUpdated(new Date().toISOString());
    }
  }, [completedCount, totalCount, isCompleted]);

  // Mark item as complete
  const markItemComplete = useCallback((itemId: string) => {
    setCompletedItems((prev) => {
      const newSet = new Set(prev);
      newSet.add(itemId);
      return newSet;
    });
    setLastUpdated(new Date().toISOString());
  }, []);

  // Mark item as incomplete (for undo functionality)
  const markItemIncomplete = useCallback((itemId: string) => {
    setCompletedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
    setLastUpdated(new Date().toISOString());
  }, []);

  // Toggle item completion status
  const toggleItemCompletion = useCallback((itemId: string) => {
    setCompletedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
    setLastUpdated(new Date().toISOString());
  }, []);

  // Dismiss the widget permanently
  const dismissWidget = useCallback(() => {
    setIsDismissed(true);
    setLastUpdated(new Date().toISOString());
  }, []);

  // Resume the widget (undo dismissal)
  const resumeWidget = useCallback(() => {
    setIsDismissed(false);
    setLastUpdated(new Date().toISOString());
  }, []);

  // Reset onboarding (for testing or manual reset)
  const resetOnboarding = useCallback(() => {
    setCompletedItems(new Set());
    setIsDismissed(false);
    setIsCompleted(false);
    setLastUpdated(new Date().toISOString());
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(dismissedKey);
      localStorage.removeItem(completedKey);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }, [storageKey, dismissedKey, completedKey]);

  // Auto-detect completion based on user data (can be extended)
  const autoDetectCompletion = useCallback((userData: Record<string, any>) => {
    const newCompleted = new Set(completedItems);

    if (config.role === 'mentor') {
      if (userData.profileCompleted) newCompleted.add('profile');
      if (userData.availabilitySet) newCompleted.add('availability');
      if (userData.walletConnected) newCompleted.add('wallet');
      if (userData.firstSessionCompleted) newCompleted.add('first_session');
    } else {
      if (userData.profileCompleted) newCompleted.add('profile');
      if (userData.mentorFound) newCompleted.add('find_mentor');
      if (userData.sessionBooked) newCompleted.add('book_session');
      if (userData.walletSetup) newCompleted.add('wallet');
    }

    setCompletedItems(newCompleted);
    setLastUpdated(new Date().toISOString());
  }, [config.role, completedItems]);

  const state: OnboardingProgressState = {
    items,
    completedCount,
    totalCount,
    progressPercentage,
    isDismissed,
    isCompleted,
    shouldDisplay,
    lastUpdated,
  };

  return {
    ...state,
    markItemComplete,
    markItemIncomplete,
    toggleItemCompletion,
    dismissWidget,
    resumeWidget,
    resetOnboarding,
    autoDetectCompletion,
    isNewUser,
  };
};
