import { useCallback, useMemo, useState } from 'react';
import type {
  AgendaTemplateOption,
  MentorResearchProfile,
  PrepChecklistItem,
  SessionPrepState,
  UploadedResource,
} from '../types';

const AGENDA_TEMPLATES: AgendaTemplateOption[] = [
  {
    id: 'template-debug',
    title: 'Debug & Unblock',
    description: 'Best when you are stuck and need rapid help on a concrete issue.',
    agenda: ['Context and blocker summary', 'Failed attempts', 'Live debugging focus', 'Next actions'],
  },
  {
    id: 'template-roadmap',
    title: 'Roadmap Planning',
    description: 'Useful for shaping the next 2-4 weeks of work and learning.',
    agenda: ['Goal review', 'Current strengths and gaps', 'Suggested learning sequence', 'Session follow-up plan'],
  },
  {
    id: 'template-portfolio',
    title: 'Project Review',
    description: 'Designed for reviewing finished work and turning it into portfolio proof.',
    agenda: ['What you built', 'Tradeoffs and decisions', 'Feedback areas', 'Case study takeaways'],
  },
];

const DEFAULT_CHECKLIST: PrepChecklistItem[] = [
  { id: 'check-1', label: 'Define the one outcome you want from this session', checked: true },
  { id: 'check-2', label: 'Write down your top 3 questions in priority order', checked: true },
  { id: 'check-3', label: 'Gather links, screenshots, or files to share', checked: false },
  { id: 'check-4', label: 'Review previous session notes and action items', checked: false },
  { id: 'check-5', label: 'Block 10 minutes after the session for follow-up', checked: false },
];

const PREVIOUS_NOTES = [
  'Mentor suggested splitting wallet work from booking UI so testing stays simple.',
  'Need stronger reasoning for pricing decisions and clearer user-facing copy.',
  'Follow up with a polished demo and one written reflection after each session.',
];

const TIME_TIPS = [
  'Open with your goal and the exact decision you want help with.',
  'Spend the first 10 minutes aligning on context, not retelling the whole project.',
  'Leave the last 5 minutes for next actions and ownership.',
];

const MENTOR_RESEARCH: MentorResearchProfile = {
  mentorName: 'Aisha Bello',
  specialties: ['Soroban product delivery', 'Mentor-led project planning', 'Frontend-to-Web3 transitions'],
  recentFocus: ['Portfolio-ready Web3 apps', 'Learner milestone planning', 'Session structure and accountability'],
  sessionStyle: 'Structured, practical, and focused on turning discussion into next actions.',
  responseTime: 'Usually replies within 2 hours.',
};

const getFileKind = (name: string): UploadedResource['kind'] => {
  if (/\.(png|jpg|jpeg|gif|svg)$/i.test(name)) return 'image';
  if (/\.(ts|tsx|js|jsx|rs|sol|md)$/i.test(name)) return 'code';
  if (/^https?:\/\//i.test(name)) return 'link';
  return 'document';
};

export const useSessionPrep = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(AGENDA_TEMPLATES[0].id);
  const [goals, setGoals] = useState('Leave with a clear plan for the next two mentor-led milestones.');
  const [objectives, setObjectives] = useState('Review the implementation approach, identify blockers, and confirm success criteria.');
  const [agendaNotes, setAgendaNotes] = useState('Share the booking flow and ask whether the next feature should prioritize recommendations or follow-up notes.');
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [uploadedResources, setUploadedResources] = useState<UploadedResource[]>([
    { id: 'resource-1', name: 'booking-flow-notes.md', sizeLabel: '12 KB', kind: 'document' },
  ]);

  const selectedTemplate = useMemo(() => {
    return AGENDA_TEMPLATES.find((template) => template.id === selectedTemplateId) ?? AGENDA_TEMPLATES[0];
  }, [selectedTemplateId]);

  const toggleChecklistItem = useCallback((itemId: string) => {
    setChecklist((current) =>
      current.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item))
    );
  }, []);

  const uploadResources = useCallback((files: FileList | File[]) => {
    const nextResources = Array.from(files).map((file, index) => ({
      id: `resource-${Date.now()}-${index}`,
      name: file.name,
      sizeLabel: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      kind: getFileKind(file.name),
    }));

    setUploadedResources((current) => [...nextResources, ...current]);
  }, []);

  const removeResource = useCallback((resourceId: string) => {
    setUploadedResources((current) => current.filter((resource) => resource.id !== resourceId));
  }, []);

  const progress = useMemo(() => {
    const checklistScore = checklist.filter((item) => item.checked).length / checklist.length;
    const goalsScore = goals.trim() ? 1 : 0;
    const objectivesScore = objectives.trim() ? 1 : 0;
    const resourcesScore = uploadedResources.length > 0 ? 1 : 0;
    const agendaScore = agendaNotes.trim() ? 1 : 0;

    return Math.round(((checklistScore + goalsScore + objectivesScore + resourcesScore + agendaScore) / 5) * 100);
  }, [agendaNotes, checklist, goals, objectives, uploadedResources]);

  const reminderSummary = useMemo(() => {
    return `Reminder set: review ${checklist.filter((item) => !item.checked).length} remaining prep items before your next session.`;
  }, [checklist]);

  const state: SessionPrepState = {
    selectedTemplateId,
    goals,
    objectives,
    agendaNotes,
    checklist,
    uploadedResources,
    previousSessionNotes: PREVIOUS_NOTES,
    reminderSummary,
    timeManagementTips: TIME_TIPS,
    mentorResearch: MENTOR_RESEARCH,
    progress,
  };

  return {
    templates: AGENDA_TEMPLATES,
    selectedTemplate,
    state,
    setSelectedTemplateId,
    setGoals,
    setObjectives,
    setAgendaNotes,
    toggleChecklistItem,
    uploadResources,
    removeResource,
  };
};

