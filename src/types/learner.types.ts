import { SkillLevel } from './index';
import { AchievementBadge } from './session.types';

export type LearningStyle = 'visual' | 'auditory' | 'reading/writing' | 'kinesthetic';
export type ProfileVisibility = 'public' | 'mentors-only' | 'private';

export interface LearnerProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  introduction?: string;
  learningGoals: string[]; // tags
  skillLevels: SkillLevel[];
  interests: string[];
  preferredLearningStyle: LearningStyle;
  timezone: string;
  language: string;
  visibility: ProfileVisibility;
  achievements: AchievementBadge[];
}
