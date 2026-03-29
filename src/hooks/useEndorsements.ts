import { useCallback, useMemo, useState } from 'react';

export interface Endorser {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface SkillEndorsement {
  skill: string;
  count: number;
  endorsers: Endorser[];
  endorsedByUser: boolean;
}

const DEFAULT_ENDORSEMENTS: SkillEndorsement[] = [
  {
    skill: 'React',
    count: 14,
    endorsers: [
      { id: 'u1', name: 'Ava', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: 'u2', name: 'Noah', avatarUrl: 'https://images.unsplash.com/photo-1502767089025-6572583495b4?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: 'u3', name: 'Mia', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: 'u4', name: 'Leo', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: 'u5', name: 'Ivy', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    ],
    endorsedByUser: false,
  },
  {
    skill: 'TypeScript',
    count: 9,
    endorsers: [
      { id: 'u6', name: 'Eli', avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: 'u7', name: 'Sofia', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: 'u8', name: 'Liam', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    ],
    endorsedByUser: false,
  },
  {
    skill: 'GraphQL',
    count: 5,
    endorsers: [
      { id: 'u9', name: 'Zoe', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: 'u10', name: 'Ethan', avatarUrl: 'https://images.unsplash.com/photo-1502767089025-6572583495b4?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    ],
    endorsedByUser: false,
  },
  {
    skill: 'Tailwind CSS',
    count: 2,
    endorsers: [
      { id: 'u11', name: 'Nina', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    ],
    endorsedByUser: false,
  },
];

export const useEndorsements = (hasCompletedSession = false) => {
  const [endorsements, setEndorsements] = useState<SkillEndorsement[]>(DEFAULT_ENDORSEMENTS);
  const [pendingSkill, setPendingSkill] = useState<string | null>(null);

  const sortedEndorsements = useMemo(
    () => [...endorsements].sort((a, b) => b.count - a.count),
    [endorsements]
  );

  const requestEndorsement = useCallback((skill: string) => {
    setPendingSkill(skill);
  }, []);

  const cancelRequest = useCallback(() => {
    setPendingSkill(null);
  }, []);

  const toggleEndorsement = useCallback((skill: string) => {
    setEndorsements((current) =>
      current.map((item) => {
        if (item.skill !== skill) {
          return item;
        }

        const isCurrentlyEndorsed = item.endorsedByUser;
        const count = isCurrentlyEndorsed ? item.count - 1 : item.count + 1;
        const endorsers = isCurrentlyEndorsed
          ? item.endorsers.slice(0, Math.max(0, item.endorsers.length - 1))
          : [
              { id: 'current-user', name: 'You', avatarUrl: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
              ...item.endorsers,
            ];

        return {
          ...item,
          count,
          endorsers,
          endorsedByUser: !item.endorsedByUser,
        };
      })
    );
    setPendingSkill(null);
  }, []);

  const hasAnyEndorsement = useMemo(
    () => endorsements.some((endorsement) => endorsement.count > 0),
    [endorsements]
  );

  return {
    endorsements: sortedEndorsements,
    pendingSkill,
    hasAnyEndorsement,
    hasCompletedSession,
    requestEndorsement,
    cancelRequest,
    toggleEndorsement,
  } as const;
};
