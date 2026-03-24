import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LearningRecommendations from '../components/learner/LearningRecommendations';
import SessionPrep from '../components/learner/SessionPrep';
import { useRecommendations } from '../hooks/useRecommendations';
import { useSessionPrep } from '../hooks/useSessionPrep';

describe('Learning recommendations', () => {
  it('updates mentor feedback and bookmarks in the recommendations hook', () => {
    const { result } = renderHook(() => useRecommendations());

    expect(result.current.estimatedTimeToGoal).toBe(5);

    act(() => {
      result.current.setMentorFeedback('rm2', 'helpful');
      result.current.toggleMentorBookmark('rm2');
      result.current.togglePathBookmark('lp2');
    });

    expect(result.current.mentors.find((mentor) => mentor.id === 'rm2')?.feedback).toBe('helpful');
    expect(result.current.mentors.find((mentor) => mentor.id === 'rm2')?.bookmarked).toBe(true);
    expect(result.current.bookmarkedPaths).toHaveLength(2);
  });

  it('renders recommendation explanations and allows feedback interactions', () => {
    render(<LearningRecommendations />);

    expect(screen.getByText('AI Learning Recommendations')).toBeInTheDocument();
    expect(screen.getAllByText('Why recommended').length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByText('Helpful')[0]);
    expect(screen.getAllByText('Helpful')[0]).toHaveClass('bg-emerald-100');

    fireEvent.click(screen.getByText('Bookmarked path'));
    expect(screen.getByText('Bookmark path')).toBeInTheDocument();
  });
});

describe('Session preparation tools', () => {
  it('tracks prep progress and uploaded resources in the session prep hook', () => {
    const { result } = renderHook(() => useSessionPrep());

    act(() => {
      result.current.toggleChecklistItem('check-3');
      result.current.uploadResources([new File(['hello'], 'architecture-notes.md', { type: 'text/markdown' })]);
      result.current.setGoals('Walk away with a reviewed architecture plan.');
    });

    expect(result.current.state.uploadedResources.some((resource) => resource.name === 'architecture-notes.md')).toBe(true);
    expect(result.current.state.progress).toBeGreaterThan(60);
  });

  it('renders session prep tools and supports file upload', () => {
    render(<SessionPrep />);

    expect(screen.getByText('Session Preparation Tools')).toBeInTheDocument();
    expect(screen.getByText('Agenda Template Selector')).toBeInTheDocument();

    const fileInput = screen.getByLabelText('Upload resource') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: {
        files: [new File(['resource'], 'session-context.pdf', { type: 'application/pdf' })],
      },
    });

    expect(screen.getByText('session-context.pdf')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Pre-session goals'), {
      target: { value: 'Clarify the next feature milestone and review open questions.' },
    });

    expect(screen.getByDisplayValue('Clarify the next feature milestone and review open questions.')).toBeInTheDocument();
    expect(screen.getByText(/Preparation progress/i)).toBeInTheDocument();
  });
});
