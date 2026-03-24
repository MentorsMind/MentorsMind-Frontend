# Session History Component Structure

```
SessionHistory (Page)
├── Header Section
│   ├── Title: "Your Learning Journey"
│   └── Export Report Button
│
├── Metrics Row
│   ├── TimeInvested Card (1 col)
│   │   ├── Total Hours/Minutes
│   │   ├── Average Session Duration
│   │   └── Total Sessions Count
│   │
│   └── Quick Stats Card (3 cols)
│       ├── Consistency Score
│       ├── Skills Learning Count
│       └── Mentors Worked With Count
│
├── Tab Navigation
│   ├── History Tab (default)
│   └── Analytics Tab
│
└── Content Area (Tab-based)
    │
    ├── [History Tab] → HistoryList
    │   └── Session Cards (foreach session)
    │       ├── Topic & Outcome Icon
    │       ├── Mentor Name
    │       ├── Date, Duration, Amount
    │       ├── Skill Tags
    │       ├── Status Badge
    │       └── Rating Stars
    │
    └── [Analytics Tab] → LearningAnalytics
        ├── Metric Cards Row (3 cards)
        │   ├── Completion Rate
        │   ├── Total Spent
        │   └── Learning Velocity
        │
        ├── Details Row (2 columns)
        │   ├── Skill Development Panel
        │   │   └── Progress Bars (foreach skill)
        │   │
        │   └── Mentor Interactions Panel
        │       └── Mentor Cards (foreach mentor)
        │
        └── Charts Row (2 columns)
            ├── Session Frequency (Bar Chart)
            └── Spending Trend (Line Chart)
```

## Data Flow

```
useSessionHistory Hook
├── State: sessions (SessionHistoryItem[])
├── State: loading (boolean)
│
├── Computed: analytics (useMemo)
│   ├── totalSessions
│   ├── totalTimeInvested
│   ├── totalSpent
│   ├── averageSessionDuration
│   ├── completionRate
│   ├── skillProgress[]
│   ├── mentorInteractions[]
│   ├── sessionFrequency
│   ├── learningVelocity
│   └── spendingAnalytics
│
└── Function: exportReport (CSV download)
```

## Type Hierarchy

```
session.types.ts
├── SessionHistoryItem
│   ├── id, mentorId, mentorName
│   ├── topic, date, duration
│   ├── status: 'completed' | 'cancelled' | 'no-show'
│   ├── rating, notes, skills[]
│   ├── amount, currency
│   └── outcome: 'excellent' | 'good' | 'needs-improvement'
│
├── LearningAnalytics
│   ├── totalSessions, totalTimeInvested, totalSpent
│   ├── averageSessionDuration, completionRate
│   ├── skillProgress: SkillProgress[]
│   ├── mentorInteractions: MentorInteraction[]
│   ├── sessionFrequency: SessionFrequencyData
│   ├── learningVelocity: LearningVelocityData
│   └── spendingAnalytics: SpendingAnalytics
│
├── SkillProgress
│   ├── skill, sessionsCount, timeInvested
│   ├── level: 'beginner' | 'intermediate' | 'advanced'
│   └── progress: 0-100
│
├── MentorInteraction
│   ├── mentorId, mentorName
│   ├── sessionsCount, totalTime
│   ├── averageRating
│   └── lastSession
│
├── SessionFrequencyData
│   ├── labels: string[]
│   └── values: number[]
│
├── LearningVelocityData
│   ├── weeklyAverage
│   ├── monthlyTrend
│   └── consistencyScore
│
└── SpendingAnalytics
    ├── byMentor: { name, amount }[]
    ├── bySkill: { skill, amount }[]
    └── monthlyTrend: { month, amount }[]
```

## Component Props

```typescript
// HistoryList
interface HistoryListProps {
  sessions: SessionHistoryItem[];
}

// LearningAnalytics
interface LearningAnalyticsProps {
  analytics: LearningAnalytics;
}

// TimeInvested
interface TimeInvestedProps {
  totalMinutes: number;
  averageSessionDuration: number;
  totalSessions: number;
}
```

## Styling Patterns

- **Container**: `max-w-7xl mx-auto px-4 py-8`
- **Cards**: `bg-white rounded-3xl border border-gray-100 shadow-sm p-6`
- **Buttons**: `bg-stellar text-white rounded-xl font-bold hover:bg-stellar/90`
- **Badges**: `px-3 py-1 rounded-full text-xs font-semibold`
- **Grid**: `grid grid-cols-1 lg:grid-cols-{n} gap-6`
- **Animations**: `animate-in fade-in duration-700`

## Color Scheme

- **Primary (Stellar)**: `#6366f1` (indigo-500)
- **Success**: `emerald-50/600`
- **Error**: `red-50/600`
- **Warning**: `yellow-500`
- **Neutral**: `gray-50/100/400/500/600/900`
