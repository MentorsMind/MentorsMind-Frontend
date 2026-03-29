import { useState, useEffect } from "react";

export type BadgeType =
  | "Top Rated"
  | "Rising Star"
  | "Verified Expert"
  | "Fast Responder"
  | "Session Champion"
  | "Stellar Developer"
  | "Community Favorite";

export interface MentorBadge {
  id: string;
  type: BadgeType;
  name: string;
  description: string;
  howToEarn: string;
  color: string;
  badgeTextColor: string;
  badgeBgColor: string;
  icon: string;
  rarity: number; // Percentage of mentors who have this (e.g. 4 for 4%)
  earnedDate: string;
  isNew?: boolean;
}

// Global registry of all possible badges
const allBadgesData: MentorBadge[] = [
  {
    id: "b1",
    type: "Verified Expert",
    name: "Verified Expert",
    description: "Mentor identity and credentials verified by administration.",
    howToEarn: "Submit KYC and professional credentials.",
    color: "text-blue-500",
    badgeTextColor: "text-blue-700",
    badgeBgColor: "bg-blue-50 border-blue-200",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", // Heroicons check-circle
    rarity: 45,
    earnedDate: "2023-01-15",
  },
  {
    id: "b2",
    type: "Top Rated",
    name: "Top Rated Mentor",
    description: "Maintains a 4.9+ average rating across 50+ sessions.",
    howToEarn: "Consistently receive 5-star reviews from mentees.",
    color: "text-yellow-500",
    badgeTextColor: "text-yellow-700",
    badgeBgColor: "bg-yellow-50 border-yellow-200",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    rarity: 4,
    earnedDate: "2023-06-20", // Rare < 5%
  },
  {
    id: "b3",
    type: "Fast Responder",
    name: "Lightning Responder",
    description: "Replies to requests in under 1 hour.",
    howToEarn:
      "Maintain an average response time of < 1h for 30 consecutive days.",
    color: "text-green-500",
    badgeTextColor: "text-green-700",
    badgeBgColor: "bg-green-50 border-green-200",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    rarity: 15,
    earnedDate: "2023-02-10",
  },
  {
    id: "b4",
    type: "Session Champion",
    name: "Session Champion",
    description: "Has completed over 100 successful sessions.",
    howToEarn: "Complete 100+ mentorship sessions with positive ratings.",
    color: "text-orange-500",
    badgeTextColor: "text-orange-700",
    badgeBgColor: "bg-orange-50 border-orange-200",
    icon: "M19 11H5m14 0a2 2 0 012 2v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    rarity: 8,
    earnedDate: "2023-08-05",
  },
  {
    id: "b5",
    type: "Stellar Developer",
    name: "Stellar Expert",
    description: "Recognized for deep expertise in Stellar smart contracts.",
    howToEarn:
      "Contribute significantly to Stellar projects and Soroban development.",
    color: "text-cyan-500",
    badgeTextColor: "text-cyan-700",
    badgeBgColor: "bg-cyan-50 border-cyan-200",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    rarity: 2,
    earnedDate: "2023-11-12", // Rare
  },
  {
    id: "b6",
    type: "Community Favorite",
    name: "Community Favorite",
    description: "Consistently bookmarked and highly recommended by mentees.",
    howToEarn: "Achieve a top 10% bookmark rate and repeat mentee rate.",
    color: "text-pink-500",
    badgeTextColor: "text-pink-700",
    badgeBgColor: "bg-pink-50 border-pink-200",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    rarity: 12,
    earnedDate: "2023-05-22",
  },
  {
    id: "b7",
    type: "Rising Star",
    name: "Rising Star",
    description: "A newly verified mentor showing exceptional early ratings.",
    howToEarn: "Maintain a 5-star rating on your first 10 sessions.",
    color: "text-purple-500",
    badgeTextColor: "text-purple-700",
    badgeBgColor: "bg-purple-50 border-purple-200",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    rarity: 18,
    earnedDate: "2023-12-01",
  },
];

export const useBadges = (mentorId: string) => {
  const [badges, setBadges] = useState<MentorBadge[]>([]);

  useEffect(() => {
    // In a real app we'd fetch this based on the mentorId.
    // For this showcase, we'll assign a dynamic but deterministic set of badges
    // to mentors to demonstrate the feature.
    // We'll give the "Stellar Developer" (new) to show confetti if mentorId ends in a vowel or is specific

    // As a fun proxy for 'earned a new badge recently'
    const isNew = mentorId === "john-doe" || mentorId.includes("new");

    const assigned: MentorBadge[] = [
      allBadgesData[0], // Verified
      allBadgesData[1], // Top Rated
      allBadgesData[2], // Fast Responder
      allBadgesData[3], // Session Champion
    ];

    if (isNew || mentorId === "1" || !mentorId) {
      assigned.push({ ...allBadgesData[4], isNew: true });
    }

    setBadges(assigned);
  }, [mentorId]);

  return { badges };
};
