import type { CohortDatum } from '../components/charts/CohortChart';
import type { ForecastDatum } from '../components/charts/ForecastChart';
import type { GeoMapPoint } from '../components/charts/GeoDistributionMap';
import type { HeatmapDatum } from '../components/charts/HeatmapChart';
import type { DataPoint, MultiSeriesDataPoint } from '../types/charts.types';
import type { PdfSection } from '../utils/pdf-export.utils';

export interface MentorAnalyticsRange {
  start: Date;
  end: Date;
}

interface MentorAnalyticsSummary {
  totalRevenue: number;
  completedSessions: number;
  activeLearners: number;
  forecastedRevenue: number;
  averageReview: number;
}

export interface MentorAnalyticsState {
  summary: MentorAnalyticsSummary;
  cohortRetention: CohortDatum[];
  revenueBySkill: DataPoint[];
  peakBookingHours: HeatmapDatum[];
  geography: GeoMapPoint[];
  revenueForecast: ForecastDatum[];
  completionTrend: MultiSeriesDataPoint[];
  reviewTrend: MultiSeriesDataPoint[];
  days: string[];
  hours: number[];
  pdfSections: PdfSection[];
}

interface LearnerProfile {
  id: string;
  name: string;
  country: string;
  x: number;
  y: number;
}

interface SessionRecord {
  id: string;
  learnerId: string;
  skill: string;
  amountUsd: number;
  completed: boolean;
  reviewScore: number | null;
  startsAt: string;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = [7, 9, 11, 13, 15, 17, 19, 21];

const LEARNERS: LearnerProfile[] = [
  { id: 'learner-1', name: 'Ama', country: 'Nigeria', x: 53, y: 37 },
  { id: 'learner-2', name: 'Mia', country: 'United States', x: 23, y: 28 },
  { id: 'learner-3', name: 'Leo', country: 'United Kingdom', x: 49, y: 21 },
  { id: 'learner-4', name: 'Sara', country: 'Kenya', x: 55, y: 45 },
  { id: 'learner-5', name: 'Jun', country: 'Singapore', x: 77, y: 38 },
  { id: 'learner-6', name: 'Lina', country: 'Brazil', x: 29, y: 57 },
  { id: 'learner-7', name: 'Ravi', country: 'India', x: 70, y: 34 },
  { id: 'learner-8', name: 'Noah', country: 'Canada', x: 21, y: 22 },
];

const SKILLS = [
  'Product Strategy',
  'React Architecture',
  'Stellar Payments',
  'System Design',
  'Career Coaching',
  'Data Storytelling',
];

const SESSION_FIXTURES: SessionRecord[] = (() => {
  const counts: Record<string, number> = {};
  const base = new Date('2025-04-05T08:00:00Z');

  return Array.from({ length: 118 }, (_, index) => {
    const learner = LEARNERS[index % LEARNERS.length];
    const sessionCount = (counts[learner.id] ?? 0) + 1;
    counts[learner.id] = sessionCount;

    const startsAt = new Date(base);
    startsAt.setUTCDate(base.getUTCDate() + index * 3);
    startsAt.setUTCHours(7 + ((index * 2) % 12), index % 2 === 0 ? 0 : 30, 0, 0);

    return {
      id: `mentor-session-${index + 1}`,
      learnerId: learner.id,
      skill: SKILLS[index % SKILLS.length],
      amountUsd: 120 + (index % 5) * 40 + sessionCount * 12,
      completed: index % 9 !== 0,
      reviewScore: index % 9 === 0 ? null : Number((4.1 + (index % 6) * 0.12).toFixed(1)),
      startsAt: startsAt.toISOString(),
    };
  });
})();

function formatShortDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function buildBuckets(range: MentorAnalyticsRange, count = 6) {
  const startMs = range.start.getTime();
  const endMs = range.end.getTime();
  const step = Math.max((endMs - startMs) / count, 1);

  return Array.from({ length: count }, (_, index) => {
    const bucketStart = new Date(startMs + step * index);
    const bucketEnd = new Date(index === count - 1 ? endMs : startMs + step * (index + 1));

    return {
      label: formatShortDate(bucketStart),
      start: bucketStart,
      end: bucketEnd,
    };
  });
}

function uniqueCount(values: string[]) {
  return new Set(values).size;
}

export function useMentorAnalytics(range: MentorAnalyticsRange): MentorAnalyticsState {
  const filteredSessions = SESSION_FIXTURES.filter((session) => {
    const date = new Date(session.startsAt);
    return date >= range.start && date <= range.end;
  });

  const sessionsByLearner = filteredSessions.reduce<Record<string, number>>((accumulator, session) => {
    accumulator[session.learnerId] = (accumulator[session.learnerId] ?? 0) + 1;
    return accumulator;
  }, {});

  const learnerTotal = Math.max(Object.keys(sessionsByLearner).length, 1);
  const cohortRetention = [2, 3, 4].map((sessionIndex) => {
    const retainedLearners = Object.values(sessionsByLearner).filter((count) => count >= sessionIndex).length;
    return {
      label: `${sessionIndex}th session`,
      retention: Math.round((retainedLearners / learnerTotal) * 100),
      learners: retainedLearners,
    };
  });

  const revenueBySkillMap = filteredSessions.reduce<Record<string, number>>((accumulator, session) => {
    accumulator[session.skill] = (accumulator[session.skill] ?? 0) + session.amountUsd;
    return accumulator;
  }, {});
  const revenueBySkill = Object.entries(revenueBySkillMap)
    .sort((left, right) => right[1] - left[1])
    .map(([label, value]) => ({ label, value }));

  const peakBookingHours = DAY_LABELS.flatMap((day) =>
    HOURS.map((hour) => {
      const value = filteredSessions.filter((session) => {
        const date = new Date(session.startsAt);
        const roundedHour = date.getUTCHours() <= hour + 1 && date.getUTCHours() >= hour - 1;
        return DAY_LABELS[date.getUTCDay()] === day && roundedHour;
      }).length;

      return { day, hour, value };
    }),
  );

  const geographyMap = filteredSessions.reduce<Record<string, GeoMapPoint>>((accumulator, session) => {
    const learner = LEARNERS.find((item) => item.id === session.learnerId);
    if (!learner) return accumulator;

    accumulator[learner.country] = accumulator[learner.country] ?? {
      label: learner.country,
      value: 0,
      x: learner.x,
      y: learner.y,
      detail: 'Active learners in this range',
    };
    accumulator[learner.country].value += 1;
    return accumulator;
  }, {});
  const geography = Object.values(geographyMap).sort((left, right) => right.value - left.value).slice(0, 6);

  const recurringRevenueBase = filteredSessions
    .filter((session) => (sessionsByLearner[session.learnerId] ?? 0) >= 2)
    .reduce((total, session) => total + session.amountUsd, 0);
  const revenueForecast = Array.from({ length: 6 }, (_, index) => {
    const labelDate = new Date(range.end);
    labelDate.setDate(labelDate.getDate() + (index + 1) * 5);
    const confirmed = Math.round(recurringRevenueBase / 8 + index * 110);
    return {
      label: formatShortDate(labelDate),
      confirmed,
      forecast: confirmed + 180 + index * 35,
    };
  });

  const buckets = buildBuckets(range);
  const completionTrend = buckets.map((bucket) => {
    const bucketSessions = filteredSessions.filter((session) => {
      const date = new Date(session.startsAt);
      return date >= bucket.start && date <= bucket.end;
    });
    const completed = bucketSessions.filter((session) => session.completed).length;
    const completionRate = bucketSessions.length ? Math.round((completed / bucketSessions.length) * 100) : 0;

    return {
      label: bucket.label,
      completionRate,
    };
  });

  const reviewTrend = buckets.map((bucket) => {
    const bucketReviews = filteredSessions
      .filter((session) => {
        const date = new Date(session.startsAt);
        return date >= bucket.start && date <= bucket.end && session.reviewScore !== null;
      })
      .map((session) => session.reviewScore as number);

    const averageScore = bucketReviews.length
      ? Number((bucketReviews.reduce((total, score) => total + score, 0) / bucketReviews.length).toFixed(2))
      : 0;

    return {
      label: bucket.label,
      averageScore,
    };
  });

  const completedSessions = filteredSessions.filter((session) => session.completed);
  const averageReview = completedSessions.length
    ? Number(
        (
          completedSessions
            .filter((session) => session.reviewScore !== null)
            .reduce((total, session) => total + (session.reviewScore ?? 0), 0) /
          Math.max(completedSessions.filter((session) => session.reviewScore !== null).length, 1)
        ).toFixed(1),
      )
    : 0;

  const summary = {
    totalRevenue: filteredSessions.reduce((total, session) => total + session.amountUsd, 0),
    completedSessions: completedSessions.length,
    activeLearners: uniqueCount(filteredSessions.map((session) => session.learnerId)),
    forecastedRevenue: revenueForecast.reduce((total, point) => total + point.forecast, 0),
    averageReview,
  };

  const pdfSections: PdfSection[] = [
    {
      heading: 'Summary',
      body: [
        `Revenue in range: $${summary.totalRevenue.toLocaleString()}`,
        `Completed sessions: ${summary.completedSessions}`,
        `Active learners: ${summary.activeLearners}`,
        `Average review score: ${summary.averageReview}`,
        `Forecast next 30 days: $${summary.forecastedRevenue.toLocaleString()}`,
      ],
    },
    {
      heading: 'Cohort Retention',
      body: cohortRetention.map((item) => `${item.label}: ${item.retention}% (${item.learners} learners)`),
    },
    {
      heading: 'Revenue by Skill',
      body: revenueBySkill.map((item) => `${item.label}: $${item.value.toLocaleString()}`),
    },
    {
      heading: 'Session Completion Trend',
      body: completionTrend.map((item) => `${item.label}: ${item.completionRate}%`),
    },
    {
      heading: 'Review Score Trend',
      body: reviewTrend.map((item) => `${item.label}: ${item.averageScore || 0}`),
    },
  ];

  return {
    summary,
    cohortRetention,
    revenueBySkill,
    peakBookingHours,
    geography,
    revenueForecast,
    completionTrend,
    reviewTrend,
    days: DAY_LABELS,
    hours: HOURS,
    pdfSections,
  };
}

export default useMentorAnalytics;
