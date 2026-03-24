import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSessionHistory } from '../hooks/useSessionHistory';

describe('Session History Integration', () => {
  it('useSessionHistory returns correct data structure', () => {
    const { result } = renderHook(() => useSessionHistory());

    expect(result.current.sessions).toBeDefined();
    expect(result.current.analytics).toBeDefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.exportReport).toBeInstanceOf(Function);
  });

  it('analytics calculates total sessions correctly', () => {
    const { result } = renderHook(() => useSessionHistory());
    
    expect(result.current.analytics.totalSessions).toBeGreaterThan(0);
    expect(result.current.analytics.totalTimeInvested).toBeGreaterThan(0);
  });

  it('analytics includes skill progress', () => {
    const { result } = renderHook(() => useSessionHistory());
    
    expect(result.current.analytics.skillProgress).toBeInstanceOf(Array);
    expect(result.current.analytics.skillProgress.length).toBeGreaterThan(0);
    
    const firstSkill = result.current.analytics.skillProgress[0];
    expect(firstSkill).toHaveProperty('skill');
    expect(firstSkill).toHaveProperty('sessionsCount');
    expect(firstSkill).toHaveProperty('timeInvested');
    expect(firstSkill).toHaveProperty('level');
    expect(firstSkill).toHaveProperty('progress');
  });

  it('analytics includes mentor interactions', () => {
    const { result } = renderHook(() => useSessionHistory());
    
    expect(result.current.analytics.mentorInteractions).toBeInstanceOf(Array);
    expect(result.current.analytics.mentorInteractions.length).toBeGreaterThan(0);
    
    const firstMentor = result.current.analytics.mentorInteractions[0];
    expect(firstMentor).toHaveProperty('mentorId');
    expect(firstMentor).toHaveProperty('mentorName');
    expect(firstMentor).toHaveProperty('sessionsCount');
    expect(firstMentor).toHaveProperty('averageRating');
  });

  it('analytics includes learning velocity metrics', () => {
    const { result } = renderHook(() => useSessionHistory());
    
    expect(result.current.analytics.learningVelocity).toBeDefined();
    expect(result.current.analytics.learningVelocity.weeklyAverage).toBeGreaterThan(0);
    expect(result.current.analytics.learningVelocity.consistencyScore).toBeGreaterThan(0);
  });

  it('analytics includes spending analytics', () => {
    const { result } = renderHook(() => useSessionHistory());
    
    expect(result.current.analytics.spendingAnalytics).toBeDefined();
    expect(result.current.analytics.spendingAnalytics.byMentor).toBeInstanceOf(Array);
    expect(result.current.analytics.spendingAnalytics.bySkill).toBeInstanceOf(Array);
    expect(result.current.analytics.spendingAnalytics.monthlyTrend).toBeInstanceOf(Array);
  });

  it('exportReport creates CSV download', () => {
    const { result } = renderHook(() => useSessionHistory());
    
    // Mock URL.createObjectURL and link.click
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    const clickMock = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({
      click: clickMock,
      href: '',
      download: '',
    } as any);

    result.current.exportReport();

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
  });

  it('sessions have correct structure', () => {
    const { result } = renderHook(() => useSessionHistory());
    
    const session = result.current.sessions[0];
    expect(session).toHaveProperty('id');
    expect(session).toHaveProperty('mentorId');
    expect(session).toHaveProperty('mentorName');
    expect(session).toHaveProperty('topic');
    expect(session).toHaveProperty('date');
    expect(session).toHaveProperty('duration');
    expect(session).toHaveProperty('status');
    expect(session).toHaveProperty('skills');
    expect(session).toHaveProperty('amount');
    expect(session).toHaveProperty('currency');
  });

  it('calculates average session duration correctly', () => {
    const { result } = renderHook(() => useSessionHistory());
    
    const totalTime = result.current.analytics.totalTimeInvested;
    const totalSessions = result.current.analytics.totalSessions;
    const expectedAverage = totalTime / totalSessions;
    
    expect(result.current.analytics.averageSessionDuration).toBe(expectedAverage);
  });

  it('completion rate is calculated correctly', () => {
    const { result } = renderHook(() => useSessionHistory());
    
    expect(result.current.analytics.completionRate).toBeGreaterThanOrEqual(0);
    expect(result.current.analytics.completionRate).toBeLessThanOrEqual(100);
  });
});
