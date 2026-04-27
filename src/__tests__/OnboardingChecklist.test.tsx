import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingChecklist from '../components/onboarding/OnboardingChecklist';
import type { OnboardingItem } from '../hooks/useOnboardingProgress';

describe('OnboardingChecklist Component', () => {
  const mockItems: OnboardingItem[] = [
    {
      id: 'profile',
      label: 'Complete Profile',
      description: 'Add bio, expertise, and profile photo',
      icon: 'User',
      route: '/profile',
      isCompleted: false,
    },
    {
      id: 'availability',
      label: 'Set Availability',
      description: 'Define your weekly schedule and time slots',
      icon: 'Calendar',
      route: '/settings/availability',
      isCompleted: false,
    },
    {
      id: 'wallet',
      label: 'Connect Wallet',
      description: 'Link your Stellar wallet for payments',
      icon: 'Wallet',
      route: '/wallet',
      isCompleted: true,
    },
    {
      id: 'first_session',
      label: 'Complete First Session',
      description: 'Conduct your first mentoring session',
      icon: 'Video',
      route: '/sessions',
      isCompleted: false,
    },
  ];

  const defaultProps = {
    items: mockItems,
    progressPercentage: 25,
    completedCount: 1,
    totalCount: 4,
    isDismissed: false,
    isCompleted: false,
    shouldDisplay: true,
    onMarkItemComplete: vi.fn(),
    onDismiss: vi.fn(),
    onResume: vi.fn(),
    role: 'mentor' as const,
    userEmail: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the checklist when shouldDisplay is true', () => {
      render(<OnboardingChecklist {...defaultProps} />);

      expect(screen.getByText('Mentor Onboarding')).toBeInTheDocument();
      expect(screen.getByText('Progress: 1/4')).toBeInTheDocument();
    });

    it('should not render when shouldDisplay is false', () => {
      const { container } = render(
        <OnboardingChecklist {...defaultProps} shouldDisplay={false} />
      );

      expect(container.firstChild).toBeEmptyDOMElement();
    });

    it('should display learner title for learner role', () => {
      render(<OnboardingChecklist {...defaultProps} role="learner" />);

      expect(screen.getByText('Welcome to Your Learning Journey')).toBeInTheDocument();
    });

    it('should display all checklist items', () => {
      render(<OnboardingChecklist {...defaultProps} />);

      expect(screen.getByText('Complete Profile')).toBeInTheDocument();
      expect(screen.getByText('Set Availability')).toBeInTheDocument();
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
      expect(screen.getByText('Complete First Session')).toBeInTheDocument();
    });

    it('should display progress percentage', () => {
      render(<OnboardingChecklist {...defaultProps} progressPercentage={50} />);

      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('Item Completion', () => {
    it('should mark completed items with checkmarks', () => {
      render(<OnboardingChecklist {...defaultProps} />);

      const completedItems = screen.getAllByRole('button').filter((btn) =>
        btn.textContent?.includes('Connect Wallet')
      );

      expect(completedItems.length).toBeGreaterThan(0);
    });

    it('should show strikethrough for completed items', () => {
      render(<OnboardingChecklist {...defaultProps} />);

      const completedLabel = screen.getByText('Connect Wallet');
      expect(completedLabel).toHaveClass('line-through');
    });

    it('should call onMarkItemComplete when clicking an item', async () => {
      const user = userEvent.setup();
      render(<OnboardingChecklist {...defaultProps} />);

      const profileItem = screen.getByText('Complete Profile');
      await user.click(profileItem);

      await waitFor(() => {
        expect(defaultProps.onMarkItemComplete).toHaveBeenCalledWith('profile');
      });
    });

    it('should show deep-link button for incomplete items', () => {
      render(<OnboardingChecklist {...defaultProps} />);

      const linkButtons = screen.getAllByRole('link');
      expect(linkButtons.length).toBeGreaterThan(0);
      expect(linkButtons[0]).toHaveAttribute('href', '/profile');
    });
  });

  describe('Progress Bar', () => {
    it('should display progress bar with correct width', () => {
      const { container } = render(
        <OnboardingChecklist {...defaultProps} progressPercentage={75} />
      );

      const progressFill = container.querySelector('[role="progressbar"]');
      expect(progressFill).toHaveStyle({ width: '75%' });
    });

    it('should update progress bar as items are completed', () => {
      const { rerender, container } = render(
        <OnboardingChecklist {...defaultProps} progressPercentage={25} />
      );

      let progressFill = container.querySelector('[role="progressbar"]');
      expect(progressFill).toHaveStyle({ width: '25%' });

      rerender(
        <OnboardingChecklist {...defaultProps} progressPercentage={50} />
      );

      progressFill = container.querySelector('[role="progressbar"]');
      expect(progressFill).toHaveStyle({ width: '50%' });
    });
  });

  describe('Collapse/Expand', () => {
    it('should expand by default when not dismissed', () => {
      render(<OnboardingChecklist {...defaultProps} isDismissed={false} />);

      expect(screen.getByText('Complete Profile')).toBeVisible();
    });

    it('should collapse when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <OnboardingChecklist {...defaultProps} isDismissed={false} />
      );

      const collapseButton = screen.getByTitle('Collapse');
      await user.click(collapseButton);

      const itemsList = container.querySelector('.space-y-2');
      expect(itemsList).toHaveClass('hidden');
    });

    it('should expand when expand button is clicked after collapse', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <OnboardingChecklist {...defaultProps} isDismissed={false} />
      );

      // First collapse
      const collapseButton = screen.getByTitle('Collapse');
      await user.click(collapseButton);

      // Then expand
      const expandButton = screen.getByText(/Expand/);
      await user.click(expandButton);

      const profileItem = screen.getByText('Complete Profile');
      expect(profileItem).toBeVisible();
    });
  });

  describe('Dismissal', () => {
    it('should call onDismiss when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      render(<OnboardingChecklist {...defaultProps} />);

      const dismissButton = screen.getByTitle('Dismiss');
      await user.click(dismissButton);

      expect(defaultProps.onDismiss).toHaveBeenCalled();
    });

    it('should show dismissal banner when isDismissed is true', () => {
      render(<OnboardingChecklist {...defaultProps} isDismissed={true} />);

      expect(
        screen.getByText(/You dismissed your onboarding guide/)
      ).toBeInTheDocument();
    });

    it('should call onResume when resume button is clicked', async () => {
      const user = userEvent.setup();
      render(<OnboardingChecklist {...defaultProps} isDismissed={true} />);

      const resumeButton = screen.getByText('Resume');
      await user.click(resumeButton);

      expect(defaultProps.onResume).toHaveBeenCalled();
    });
  });

  describe('Completion', () => {
    it('should show completion banner when isCompleted is true', () => {
      render(
        <OnboardingChecklist
          {...defaultProps}
          isCompleted={true}
          completedCount={4}
          progressPercentage={100}
        />
      );

      expect(
        screen.getByText(/You've completed your onboarding/)
      ).toBeInTheDocument();
    });

    it('should show celebration toast on completion', async () => {
      const { container } = render(
        <OnboardingChecklist
          {...defaultProps}
          isCompleted={true}
          completedCount={4}
          progressPercentage={100}
        />
      );

      await waitFor(() => {
        expect(container.querySelector('.animate-bounce')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles and attributes', () => {
      render(<OnboardingChecklist {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-valuenow');
    });

    it('should support keyboard navigation for items', async () => {
      const user = userEvent.setup();
      render(<OnboardingChecklist {...defaultProps} />);

      const firstItem = screen.getByText('Complete Profile');
      firstItem.focus();

      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(defaultProps.onMarkItemComplete).toHaveBeenCalledWith('profile');
      });
    });

    it('should have proper button labels', () => {
      render(<OnboardingChecklist {...defaultProps} />);

      expect(screen.getByTitle('Dismiss')).toBeInTheDocument();
      expect(screen.getByTitle('Collapse')).toBeInTheDocument();
    });
  });

  describe('Role Variations', () => {
    it('should show mentor-specific content for mentor role', () => {
      render(<OnboardingChecklist {...defaultProps} role="mentor" />);

      expect(screen.getByText('Mentor Onboarding')).toBeInTheDocument();
      expect(
        screen.getByText('Complete these steps to get started as a mentor')
      ).toBeInTheDocument();
    });

    it('should show learner-specific content for learner role', () => {
      render(<OnboardingChecklist {...defaultProps} role="learner" />);

      expect(screen.getByText("Welcome to Your Learning Journey")).toBeInTheDocument();
      expect(
        screen.getByText("Let's get you set up and ready to learn")
      ).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('should display reset button when onReset is provided', () => {
      const onReset = vi.fn();
      render(
        <OnboardingChecklist {...defaultProps} onReset={onReset} />
      );

      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should call onReset when reset button is clicked', async () => {
      const user = userEvent.setup();
      const onReset = vi.fn();
      render(
        <OnboardingChecklist {...defaultProps} onReset={onReset} />
      );

      const resetButton = screen.getByText('Reset');
      await user.click(resetButton);

      expect(onReset).toHaveBeenCalled();
    });

    it('should not display reset button when onReset is not provided', () => {
      const { onReset, ...propsWithoutReset } = defaultProps;
      render(<OnboardingChecklist {...propsWithoutReset} />);

      expect(screen.queryByText('Reset')).not.toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('should apply completed styling to completed items', () => {
      render(<OnboardingChecklist {...defaultProps} />);

      const walletItem = screen.getByText('Connect Wallet')
        .closest('div');

      expect(walletItem).toHaveClass('bg-emerald-50', 'border-emerald-200');
    });

    it('should apply hover styling to incomplete items', () => {
      render(<OnboardingChecklist {...defaultProps} />);

      const profileItem = screen.getByText('Complete Profile')
        .closest('div');

      expect(profileItem).toHaveClass('bg-white', 'border-gray-100');
    });

    it('should show gradient header with correct colors', () => {
      const { container } = render(
        <OnboardingChecklist {...defaultProps} />
      );

      const header = container.querySelector(
        '.bg-gradient-to-r.from-blue-500.to-indigo-600'
      );
      expect(header).toBeInTheDocument();
    });
  });
});
