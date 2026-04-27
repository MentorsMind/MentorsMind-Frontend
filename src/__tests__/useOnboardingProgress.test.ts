import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';

describe('useOnboardingProgress Hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with empty completed items for new users', () => {
      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      expect(result.current.completedCount).toBe(0);
      expect(result.current.totalCount).toBe(4); // Mentor has 4 items
      expect(result.current.progressPercentage).toBe(0);
    });

    it('should load state from localStorage if available', () => {
      const savedState = ['profile', 'wallet'];
      localStorage.setItem('onboarding_progress_mentor', JSON.stringify(savedState));

      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      expect(result.current.completedCount).toBe(2);
      expect(result.current.items.filter((i) => i.isCompleted).length).toBe(2);
    });

    it('should differentiate between mentor and learner checklists', () => {
      const { result: mentorResult } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      const { result: learnerResult } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentee',
          userCreatedAt: new Date().toISOString(),
        })
      );

      expect(mentorResult.current.totalCount).toBe(4);
      expect(learnerResult.current.totalCount).toBe(4);
      expect(mentorResult.current.items[0].label).toBe('Complete Profile');
      expect(learnerResult.current.items[0].label).toBe('Complete Profile');
    });
  });

  describe('New User Detection', () => {
    it('should mark user as new if account age < 30 days', () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: thirtyMinutesAgo,
        })
      );

      expect(result.current.isNewUser).toBe(true);
    });

    it('should not mark user as new if account age >= 30 days', () => {
      const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();

      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: thirtyOneDaysAgo,
        })
      );

      expect(result.current.isNewUser).toBe(false);
      expect(result.current.shouldDisplay).toBe(false);
    });

    it('should assume user is new if createdAt is not provided', () => {
      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
        })
      );

      expect(result.current.isNewUser).toBe(true);
    });
  });

  describe('Item Completion', () => {
    it('should mark item as complete', () => {
      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      expect(result.current.completedCount).toBe(0);

      act(() => {
        result.current.markItemComplete('profile');
      });

      expect(result.current.completedCount).toBe(1);
      expect(result.current.items[0].isCompleted).toBe(true);
    });

    it('should mark item as incomplete', () => {
      localStorage.setItem('onboarding_progress_mentor', JSON.stringify(['profile', 'wallet']));

      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      expect(result.current.completedCount).toBe(2);

      act(() => {
        result.current.markItemIncomplete('profile');
      });

      expect(result.current.completedCount).toBe(1);
      expect(result.current.items[0].isCompleted).toBe(false);
    });

    it('should toggle item completion status', () => {
      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      expect(result.current.items[0].isCompleted).toBe(false);

      act(() => {
        result.current.toggleItemCompletion('profile');
      });

      expect(result.current.items[0].isCompleted).toBe(true);

      act(() => {
        result.current.toggleItemCompletion('profile');
      });

      expect(result.current.items[0].isCompleted).toBe(false);
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate progress percentage correctly', () => {
      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      expect(result.current.progressPercentage).toBe(0);

      act(() => {
        result.current.markItemComplete('profile');
      });

      expect(result.current.progressPercentage).toBe(25); // 1/4

      act(() => {
        result.current.markItemComplete('availability');
      });

      expect(result.current.progressPercentage).toBe(50); // 2/4
    });

    it('should automatically mark as completed when all items are done', () => {
      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      expect(result.current.isCompleted).toBe(false);

      act(() => {
        result.current.markItemComplete('profile');
        result.current.markItemComplete('availability');
        result.current.markItemComplete('wallet');
        result.current.markItemComplete('first_session');
      });

      expect(result.current.progressPercentage).toBe(100);
      expect(result.current.isCompleted).toBe(true);
    });
  });

  describe('Dismissal & Resumption', () => {
    it('should dismiss the widget', () => {
      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      expect(result.current.isDismissed).toBe(false);

      act(() => {
        result.current.dismissWidget();
      });

      expect(result.current.isDismissed).toBe(true);
      expect(result.current.shouldDisplay).toBe(false);
    });

    it('should resume the widget after dismissal', () => {
      localStorage.setItem('onboarding_dismissed_mentor', 'true');

      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      expect(result.current.isDismissed).toBe(true);

      act(() => {
        result.current.resumeWidget();
      });

      expect(result.current.isDismissed).toBe(false);
      expect(result.current.shouldDisplay).toBe(true);
    });

    it('should persist dismissal state to localStorage', () => {
      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      act(() => {
        result.current.dismissWidget();
      });

      const savedDismissed = localStorage.getItem('onboarding_dismissed_mentor');
      expect(savedDismissed).toBe('true');
    });
  });

  describe('Auto-detection', () => {
    it('should auto-detect mentor completion based on user data', () => {
      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      act(() => {
        result.current.autoDetectCompletion({
          profileCompleted: true,
          walletConnected: true,
        });
      });

      expect(result.current.completedCount).toBe(2);
      expect(
        result.current.items.find((i) => i.id === 'profile')?.isCompleted
      ).toBe(true);
      expect(
        result.current.items.find((i) => i.id === 'wallet')?.isCompleted
      ).toBe(true);
    });

    it('should auto-detect learner completion based on user data', () => {
      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentee',
          userCreatedAt: new Date().toISOString(),
        })
      );

      act(() => {
        result.current.autoDetectCompletion({
          profileCompleted: true,
          mentorFound: true,
          sessionBooked: true,
          walletSetup: true,
        });
      });

      expect(result.current.completedCount).toBe(4);
      expect(result.current.progressPercentage).toBe(100);
    });
  });

  describe('Reset', () => {
    it('should reset onboarding to initial state', () => {
      localStorage.setItem('onboarding_progress_mentor', JSON.stringify(['profile', 'wallet']));
      localStorage.setItem('onboarding_dismissed_mentor', 'true');
      localStorage.setItem('onboarding_completed_mentor', 'true');

      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      expect(result.current.completedCount).toBe(2);
      expect(result.current.isDismissed).toBe(true);
      expect(result.current.isCompleted).toBe(true);

      act(() => {
        result.current.resetOnboarding();
      });

      expect(result.current.completedCount).toBe(0);
      expect(result.current.isDismissed).toBe(false);
      expect(result.current.isCompleted).toBe(false);
      // After reset, the state should be empty but localStorage might have been cleared
      const savedProgress = localStorage.getItem('onboarding_progress_mentor');
      expect(savedProgress === null || savedProgress === '[]').toBe(true);
    });
  });

  describe('Persistence', () => {
    it('should persist completed items to localStorage', () => {
      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      act(() => {
        result.current.markItemComplete('profile');
      });

      vi.advanceTimersByTime(100);

      const saved = localStorage.getItem('onboarding_progress_mentor');
      expect(saved).toBe(JSON.stringify(['profile']));
    });

    it('should persist completion status to localStorage', () => {
      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      act(() => {
        result.current.markItemComplete('profile');
        result.current.markItemComplete('availability');
        result.current.markItemComplete('wallet');
        result.current.markItemComplete('first_session');
      });

      vi.advanceTimersByTime(100);

      const savedCompleted = localStorage.getItem('onboarding_completed_mentor');
      expect(savedCompleted).toBe('true');
    });
  });

  describe('Display Logic', () => {
    it('should display widget for new, active users', () => {
      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      expect(result.current.shouldDisplay).toBe(true);
    });

    it('should not display widget if dismissed', () => {
      localStorage.setItem('onboarding_dismissed_mentor', 'true');

      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      expect(result.current.shouldDisplay).toBe(false);
    });

    it('should not display widget if completed', () => {
      localStorage.setItem('onboarding_completed_mentor', 'true');

      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: new Date().toISOString(),
        })
      );

      expect(result.current.shouldDisplay).toBe(false);
    });

    it('should not display widget for users > 30 days old', () => {
      const thirtyOneDaysAgo = new Date(
        Date.now() - 31 * 24 * 60 * 60 * 1000
      ).toISOString();

      const { result } = renderHook(() =>
        useOnboardingProgress({
          role: 'mentor',
          userCreatedAt: thirtyOneDaysAgo,
        })
      );

      expect(result.current.shouldDisplay).toBe(false);
    });
  });
});
