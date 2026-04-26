import { useCallback, useMemo, useState } from 'react';
import type { LearningPathRecommendation, RecommendedMentor } from '../types';

const INITIAL_MENTORS: RecommendedMentor[] = [
  {
    id: 'rm1',
    name: 'Aisha Bello',
    title: 'Soroban Product Mentor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
    matchScore: 96,
    hourlyRate: 78,
    currency: 'XLM',
    skills: ['Soroban', 'Product Thinking', 'Smart Contracts'],
    whyRecommended: [
      { title: 'Matches your goal', detail: 'Strong overlap with your request to ship a first Soroban MVP.' },
      { title: 'Builds confidence fast', detail: 'Breaks complex contract work into weekly milestones.' },
    ],
    successStory: {
      learnerName: 'Maya',
      startingPoint: 'Junior frontend developer moving into Web3',
      outcome: 'Built and demoed her first prediction market prototype',
      timeframeWeeks: 8,
    },
    estimatedWeeksToGoal: 8,
    bookmarked: true,
  },
  {
    id: 'rm2',
    name: 'Diego Alvarez',
    title: 'Full Stack Web3 Engineer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
    matchScore: 91,
    hourlyRate: 65,
    currency: 'XLM',
    skills: ['React', 'TypeScript', 'Stellar SDK'],
    whyRecommended: [
      { title: 'Bridges your stack', detail: 'Combines React delivery with wallet and Stellar integration.' },
      { title: 'Great for shipping', detail: 'Helps learners turn learning paths into portfolio-ready work.' },
    ],
    successStory: {
      learnerName: 'Sam',
      startingPoint: 'Already comfortable with React but new to blockchain',
      outcome: 'Launched a polished dApp frontend and mock wallet flow',
      timeframeWeeks: 6,
    },
    estimatedWeeksToGoal: 6,
    bookmarked: false,
  },
  {
    id: 'rm3',
    name: 'Nora Chen',
    title: 'Technical Interview + Systems Mentor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nora',
    matchScore: 88,
    hourlyRate: 72,
    currency: 'XLM',
    skills: ['Architecture', 'Testing', 'Mentoring Strategy'],
    whyRecommended: [
      { title: 'Closes your gaps', detail: 'Recommended because you need stronger testing and review habits.' },
      { title: 'Improves session ROI', detail: 'Pairs preparation tools with deliberate practice loops.' },
    ],
    successStory: {
      learnerName: 'Tolu',
      startingPoint: 'Strong builder but inconsistent session follow-through',
      outcome: 'Turned notes and prep into a repeatable weekly learning system',
      timeframeWeeks: 5,
    },
    estimatedWeeksToGoal: 5,
    bookmarked: false,
  },
];

const INITIAL_PATHS: LearningPathRecommendation[] = [
  {
    id: 'lp1',
    title: 'From React Developer to Stellar Builder',
    goal: 'Ship a first end-to-end mentor marketplace feature on Stellar',
    estimatedWeeks: 8,
    explanation: 'Recommended because you already have frontend momentum and need a structured path into contracts, payments, and product thinking.',
    bookmarked: true,
    steps: [
      {
        id: 'lp1-step1',
        title: 'Foundation Refresh',
        description: 'Solidify Stellar concepts, wallet flows, and Soroban vocabulary.',
        durationWeeks: 2,
        status: 'in-progress',
        resources: ['Intro to Soroban', 'Wallet UX patterns'],
      },
      {
        id: 'lp1-step2',
        title: 'Build Guided Features',
        description: 'Implement booking, payments, and learner analytics with mentor review loops.',
        durationWeeks: 3,
        status: 'next',
        resources: ['Feature slicing checklist', 'Testing playbook'],
      },
      {
        id: 'lp1-step3',
        title: 'Portfolio Proof',
        description: 'Turn the work into a narrative case study and demo.',
        durationWeeks: 3,
        status: 'recommended',
        resources: ['Demo script template', 'Case study outline'],
      },
    ],
    roadmap: [
      { skill: 'Stellar Fundamentals', currentLevel: 'beginner', targetLevel: 'advanced', progress: 65, milestone: 'Use Stellar concepts comfortably in implementation discussions.' },
      { skill: 'Soroban Contracts', currentLevel: 'beginner', targetLevel: 'advanced', progress: 40, milestone: 'Write and test a production-style contract module.' },
      { skill: 'Session Delivery', currentLevel: 'intermediate', targetLevel: 'expert', progress: 72, milestone: 'Arrive with goals, questions, and artifact reviews every week.' },
    ],
    topics: [
      { id: 'topic1', title: 'Wallet Integration Patterns', type: 'topic', duration: '90 mins', reason: 'Supports booking + payment features.' },
      { id: 'topic2', title: 'Soroban Contract Testing', type: 'course', duration: '2 weeks', reason: 'Closes your biggest confidence gap before production work.' },
      { id: 'topic3', title: 'Feature Review Workshop', type: 'workshop', duration: '1 session', reason: 'Helps convert code into portfolio evidence.' },
    ],
  },
  {
    id: 'lp2',
    title: 'Consistency Path for Weekly Growth',
    goal: 'Create a repeatable session prep and follow-up routine',
    estimatedWeeks: 5,
    explanation: 'Recommended because your progress increases when sessions have clear goals, focused questions, and planned follow-up.',
    bookmarked: false,
    steps: [
      {
        id: 'lp2-step1',
        title: 'Prep Ritual',
        description: 'Adopt agenda templates, pre-session goals, and resource sharing.',
        durationWeeks: 1,
        status: 'in-progress',
        resources: ['Agenda template library', 'Prep checklist'],
      },
      {
        id: 'lp2-step2',
        title: 'Feedback Loop',
        description: 'Capture action items, session notes, and next questions.',
        durationWeeks: 2,
        status: 'next',
        resources: ['Session note prompts', 'Progress review template'],
      },
      {
        id: 'lp2-step3',
        title: 'Momentum Review',
        description: 'Measure progress to goal completion and refine your focus.',
        durationWeeks: 2,
        status: 'recommended',
        resources: ['Milestone reflection guide'],
      },
    ],
    roadmap: [
      { skill: 'Question Framing', currentLevel: 'intermediate', targetLevel: 'expert', progress: 76, milestone: 'Bring high-signal questions that unblock implementation fast.' },
      { skill: 'Session Follow-through', currentLevel: 'beginner', targetLevel: 'advanced', progress: 52, milestone: 'Finish weekly action items before the next meeting.' },
      { skill: 'Goal Planning', currentLevel: 'beginner', targetLevel: 'advanced', progress: 60, milestone: 'Break large learning goals into 1-2 week chunks.' },
    ],
    topics: [
      { id: 'topic4', title: 'Question Prioritization', type: 'topic', duration: '45 mins', reason: 'Makes mentor time more focused.' },
      { id: 'topic5', title: 'Session Debrief Habit', type: 'topic', duration: '30 mins', reason: 'Improves retention after each session.' },
    ],
  },
];

export const useRecommendations = () => {
  const [mentors, setMentors] = useState(INITIAL_MENTORS);
  const [paths, setPaths] = useState(INITIAL_PATHS);
  const [dismissedMentors, setDismissedMentors] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const toggleMentorBookmark = useCallback((mentorId: string) => {
    setMentors((current) =>
      current.map((mentor) =>
        mentor.id === mentorId ? { ...mentor, bookmarked: !mentor.bookmarked } : mentor
      )
    );
  }, []);

  const setMentorFeedback = useCallback((mentorId: string, feedback: 'helpful' | 'not-helpful') => {
    setMentors((current) =>
      current.map((mentor) => (mentor.id === mentorId ? { ...mentor, feedback } : mentor))
    );
  }, []);

  const dismissMentor = useCallback((mentorId: string) => {
    setDismissedMentors((current) => new Set([...current, mentorId]));
  }, []);

  const refreshRecommendations = useCallback(() => {
    setIsLoading(true);
    // Simulate API call to refresh recommendations
    setTimeout(() => {
      setDismissedMentors(new Set());
      setIsLoading(false);
    }, 1000);
  }, []);

  const togglePathBookmark = useCallback((pathId: string) => {
    setPaths((current) =>
      current.map((path) => (path.id === pathId ? { ...path, bookmarked: !path.bookmarked } : path))
    );
  }, []);

  const activeMentors = useMemo(() => {
    return mentors.filter((mentor) => !dismissedMentors.has(mentor.id));
  }, [mentors, dismissedMentors]);

  const estimatedTimeToGoal = useMemo(() => {
    return paths.reduce((shortest, path) => Math.min(shortest, path.estimatedWeeks), Number.POSITIVE_INFINITY);
  }, [paths]);

  const bookmarkedPaths = useMemo(() => {
    return paths.filter((path) => path.bookmarked);
  }, [paths]);

  return {
    mentors: activeMentors,
    paths,
    bookmarkedPaths,
    estimatedTimeToGoal,
    isLoading,
    toggleMentorBookmark,
    setMentorFeedback,
    dismissMentor,
    refreshRecommendations,
    togglePathBookmark,
  };
};

