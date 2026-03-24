import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LearningProgress from '../components/learner/LearningProgress';
import LearnerNotes from '../components/learner/LearnerNotes';
import SessionHistory from '../pages/SessionHistory';
import { useFeedback } from '../hooks/useFeedback';
import { useNotes } from '../hooks/useNotes';
import { useProgress } from '../hooks/useProgress';

describe('Learning progress', () => {
  it('calculates unlocked achievements and exports progress reports', () => {
    const { result } = renderHook(() => useProgress());

    expect(result.current.unlockedAchievements).toHaveLength(2);
    expect(result.current.achievementProgress).toBeGreaterThan(60);

    act(() => {
      result.current.exportProgressReport();
    });

    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('renders progress charts and achievement content', () => {
    render(<LearningProgress />);

    expect(screen.getByText('Progress dashboard with momentum signals')).toBeInTheDocument();
    expect(screen.getByText('Skill Progression Over Time')).toBeInTheDocument();
    expect(screen.getByText('Milestone Celebration')).toBeInTheDocument();
  });
});

describe('Notes workspace', () => {
  it('searches notes, updates content, and exports notes', () => {
    const { result } = renderHook(() => useNotes());

    act(() => {
      result.current.setSearchQuery('stellar');
    });
    expect(result.current.filteredNotes).toHaveLength(1);

    act(() => {
      result.current.updateSelectedNote('Updated note body');
      result.current.exportSelectedNote('markdown');
    });

    expect(result.current.selectedNote?.content).toBe('Updated note body');
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('renders note editor interactions and attachment upload', () => {
    render(<LearnerNotes />);

    fireEvent.change(screen.getByLabelText('Search notes'), {
      target: { value: 'contracts' },
    });

    fireEvent.change(screen.getByLabelText('Note content'), {
      target: { value: '## Updated mentor notes' },
    });

    const fileInput = screen.getByLabelText('Add attachment') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: {
        files: [new File(['attachment'], 'session-screenshot.png', { type: 'image/png' })],
      },
    });

    expect(screen.getByText('session-screenshot.png')).toBeInTheDocument();
    expect(screen.getByDisplayValue('## Updated mentor notes')).toBeInTheDocument();
  });
});

describe('Feedback workflow', () => {
  it('validates ratings, submits feedback, and supports edits within 24 hours', () => {
    const { result } = renderHook(() => useFeedback());

    expect(result.current.canSubmit).toBe(false);

    act(() => {
      result.current.setRating(5);
      result.current.setCategoryRating('communication', 5);
      result.current.setCategoryRating('knowledge', 4);
      result.current.setCategoryRating('helpfulness', 5);
      result.current.setReview('Super helpful and well paced.');
      result.current.setImprovementSuggestions('More hands-on examples.');
    });

    expect(result.current.canSubmit).toBe(true);

    act(() => {
      result.current.submitFeedback();
    });

    expect(result.current.history[0].review).toBe('Super helpful and well paced.');

    act(() => {
      result.current.editFeedback(result.current.history[0].id, 'Edited review text');
    });

    expect(result.current.history[0].review).toBe('Edited review text');
  });

  it('renders feedback tab, form, and history', () => {
    render(<SessionHistory />);

    fireEvent.click(screen.getByText('Feedback'));

    expect(screen.getByText('Post-session feedback')).toBeInTheDocument();
    expect(screen.getByText('Feedback History')).toBeInTheDocument();
  });
});
