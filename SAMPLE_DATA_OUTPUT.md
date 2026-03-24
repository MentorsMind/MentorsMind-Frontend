# Sample Data Output - Session History Feature

## Mock Sessions Data

```json
[
  {
    "id": "sh1",
    "mentorId": "m1",
    "mentorName": "Sarah Chen",
    "topic": "Stellar Smart Contracts Basics",
    "date": "2026-03-20T14:00:00Z",
    "duration": 60,
    "status": "completed",
    "rating": 5,
    "skills": ["Stellar", "Smart Contracts"],
    "amount": 50,
    "currency": "XLM",
    "outcome": "excellent"
  },
  {
    "id": "sh2",
    "mentorId": "m2",
    "mentorName": "John Davis",
    "topic": "Soroban Development",
    "date": "2026-03-18T10:00:00Z",
    "duration": 45,
    "status": "completed",
    "rating": 4,
    "skills": ["Soroban", "Rust"],
    "amount": 75,
    "currency": "XLM",
    "outcome": "good"
  },
  {
    "id": "sh3",
    "mentorId": "m1",
    "mentorName": "Sarah Chen",
    "topic": "Advanced Stellar Concepts",
    "date": "2026-03-15T16:00:00Z",
    "duration": 90,
    "status": "completed",
    "rating": 5,
    "skills": ["Stellar", "Architecture"],
    "amount": 100,
    "currency": "XLM",
    "outcome": "excellent"
  }
]
```

## Calculated Analytics Output

```json
{
  "totalSessions": 3,
  "totalTimeInvested": 195,
  "totalSpent": 225,
  "averageSessionDuration": 65,
  "completionRate": 100,
  
  "skillProgress": [
    {
      "skill": "Stellar",
      "sessionsCount": 2,
      "timeInvested": 150,
      "level": "intermediate",
      "progress": 20
    },
    {
      "skill": "Smart Contracts",
      "sessionsCount": 1,
      "timeInvested": 60,
      "level": "beginner",
      "progress": 10
    },
    {
      "skill": "Soroban",
      "sessionsCount": 1,
      "timeInvested": 45,
      "level": "beginner",
      "progress": 10
    },
    {
      "skill": "Rust",
      "sessionsCount": 1,
      "timeInvested": 45,
      "level": "beginner",
      "progress": 10
    },
    {
      "skill": "Architecture",
      "sessionsCount": 1,
      "timeInvested": 90,
      "level": "beginner",
      "progress": 10
    }
  ],
  
  "mentorInteractions": [
    {
      "mentorId": "m1",
      "mentorName": "Sarah Chen",
      "sessionsCount": 2,
      "totalTime": 150,
      "averageRating": 5.0,
      "lastSession": "2026-03-20T14:00:00Z"
    },
    {
      "mentorId": "m2",
      "mentorName": "John Davis",
      "sessionsCount": 1,
      "totalTime": 45,
      "averageRating": 4.0,
      "lastSession": "2026-03-18T10:00:00Z"
    }
  ],
  
  "sessionFrequency": {
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "values": [2, 1, 3, 0, 2, 1, 0]
  },
  
  "learningVelocity": {
    "weeklyAverage": 2.5,
    "monthlyTrend": 15,
    "consistencyScore": 85
  },
  
  "spendingAnalytics": {
    "byMentor": [
      { "name": "Sarah Chen", "amount": 150 },
      { "name": "John Davis", "amount": 75 }
    ],
    "bySkill": [
      { "skill": "Stellar", "amount": 150 },
      { "skill": "Smart Contracts", "amount": 50 },
      { "skill": "Soroban", "amount": 75 },
      { "skill": "Rust", "amount": 75 },
      { "skill": "Architecture", "amount": 100 }
    ],
    "monthlyTrend": [
      { "month": "Jan", "amount": 150 },
      { "month": "Feb", "amount": 200 },
      { "month": "Mar", "amount": 225 }
    ]
  }
}
```

## CSV Export Sample

```csv
Date,Mentor,Topic,Duration (min),Amount,Rating,Status
2026-03-20T14:00:00Z,Sarah Chen,"Stellar Smart Contracts Basics",60,50,5,completed
2026-03-18T10:00:00Z,John Davis,"Soroban Development",45,75,4,completed
2026-03-15T16:00:00Z,Sarah Chen,"Advanced Stellar Concepts",90,100,5,completed
```

## Visual Representation

### Time Invested Card
```
┌─────────────────────────────┐
│ 🕐 Time Invested            │
│                             │
│ 3h 15m                      │
│                             │
│ Avg Session    Total        │
│ 65 min         3            │
└─────────────────────────────┘
```

### Session History Item
```
┌──────────────────────────────────────────┐
│ Stellar Smart Contracts Basics 🌟       │
│ with Sarah Chen                          │
│                                          │
│ 3/20/2026 • 60 min • 50 XLM             │
│                                          │
│ [Stellar] [Smart Contracts]             │
│                                          │
│                      [completed] ★ 5    │
└──────────────────────────────────────────┘
```

### Skill Progress Bar
```
Stellar                    2 sessions
████████████░░░░░░░░░░░░░░░░░░░░ 20%

Smart Contracts            1 session
████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 10%
```

### Mentor Interaction Card
```
┌─────────────────────────────┐
│ Sarah Chen                  │
│ 2 sessions • 2h 30m         │
│                      ★ 5.0  │
└─────────────────────────────┘
```

## Metrics Summary

| Metric                    | Value      |
|---------------------------|------------|
| Total Sessions            | 3          |
| Total Time Invested       | 3h 15m     |
| Average Session Duration  | 65 min     |
| Total Spent               | 225 XLM    |
| Completion Rate           | 100%       |
| Consistency Score         | 85%        |
| Weekly Average            | 2.5        |
| Skills Learning           | 5          |
| Mentors Worked With       | 2          |
