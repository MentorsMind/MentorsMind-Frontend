import { useState, useCallback } from 'react';

export interface CreditScoreComponent {
  key: string;
  label: string;
  score: number;      // 0–100 percentage weight fulfilled
  weight: number;     // % of total score this component contributes
  description: string;
}

export interface CreditScoreHistory {
  month: string;      // e.g. "Oct '25"
  score: number;
}

export interface CreditScoreData {
  score: number;                          // 300–850
  lastUpdated: string;                    // ISO date string
  borrowingCapacity: number;              // USD
  components: CreditScoreComponent[];
  history: CreditScoreHistory[];
}

const MOCK_DATA: CreditScoreData = {
  score: 712,
  lastUpdated: new Date().toISOString(),
  borrowingCapacity: 2400,
  components: [
    {
      key: 'payment_history',
      label: 'Payment History',
      score: 88,
      weight: 35,
      description: 'On-time session payments and escrow releases.',
    },
    {
      key: 'completion_rate',
      label: 'Session Completion Rate',
      score: 95,
      weight: 25,
      description: 'Percentage of booked sessions you completed without cancelling.',
    },
    {
      key: 'account_age',
      label: 'Account Age',
      score: 60,
      weight: 15,
      description: 'How long your MentorsMind account has been active.',
    },
    {
      key: 'goal_achievement',
      label: 'Goal Achievement',
      score: 72,
      weight: 15,
      description: 'Learning goals marked complete relative to goals set.',
    },
    {
      key: 'wallet_activity',
      label: 'Wallet Activity',
      score: 55,
      weight: 10,
      description: 'Consistent on-chain transaction history on your Stellar wallet.',
    },
  ],
  history: [
    { month: "Oct '25", score: 645 },
    { month: "Nov '25", score: 668 },
    { month: "Dec '25", score: 680 },
    { month: "Jan '26", score: 695 },
    { month: "Feb '26", score: 703 },
    { month: "Mar '26", score: 712 },
  ],
};

export const useCreditScore = () => {
  const [data, setData] = useState<CreditScoreData>(MOCK_DATA);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Returns the weakest component (lowest score, weighted by importance)
  const weakestComponent = data.components.reduce((prev, curr) =>
    curr.score < prev.score ? curr : prev
  );

  const refreshScore = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      // Simulate contract call latency
      await new Promise((resolve) => setTimeout(resolve, 1800));
      // Simulate a small score bump on refresh
      setData((prev) => ({
        ...prev,
        score: Math.min(850, prev.score + Math.floor(Math.random() * 5)),
        lastUpdated: new Date().toISOString(),
      }));
    } catch {
      setError('Failed to refresh score. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  return {
    data,
    loading,
    refreshing,
    error,
    weakestComponent,
    refreshScore,
  };
};