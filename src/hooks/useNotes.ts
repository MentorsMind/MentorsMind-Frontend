import { useCallback, useMemo, useState } from 'react';
import type { BookmarkedResource, LearnerNote, NoteTemplate, ResourceLink } from '../types';
import api from '../services/api.client';
import { downloadNote } from '../utils/richtext.utils';

const TEMPLATES: NoteTemplate[] = [
  {
    id: 'template-retro',
    title: 'Session Retro',
    content: '## Wins\n- \n\n## Questions\n- \n\n## Next Actions\n- ',
  },
  {
    id: 'template-debug',
    title: 'Debug Notes',
    content: '## Blocker\n\n## Attempts\n\n## Mentor Advice\n\n## Follow-up',
  },
];

const INITIAL_NOTES: LearnerNote[] = [
  {
    id: 'note-1',
    sessionId: 'sh1',
    sessionTitle: 'Stellar Smart Contracts Basics',
    mentorName: 'Sarah Chen',
    content: '## Key takeaways\n- Keep contracts small and test storage changes carefully.\n- Turn mentor feedback into concrete follow-up tickets.',
    tags: ['stellar', 'contracts'],
    sharedWithMentor: true,
    sharedWithLearner: false,
    reminder: 'Review storage examples tomorrow morning.',
    attachments: [{ id: 'attach-1', name: 'contract-draft.md', sizeLabel: '8 KB' }],
    resourceLinks: [
      { id: 'rl-1', title: 'Soroban Docs', url: 'https://soroban.stellar.org' },
    ],
    versions: [
      { id: 'version-1', savedAt: '2026-03-20T15:00:00Z', content: 'Initial session notes draft.' },
    ],
    updatedAt: '2026-03-20T16:30:00Z',
  },
];

const INITIAL_RESOURCES: BookmarkedResource[] = [
  { id: 'resource-1', title: 'Soroban Testing Guide', url: 'https://example.com/soroban-testing', tags: ['testing', 'soroban'] },
  { id: 'resource-2', title: 'Mentor Session Prep Checklist', url: 'https://example.com/prep-checklist', tags: ['prep', 'notes'] },
];

const formatSize = (size: number) => `${Math.max(1, Math.round(size / 1024))} KB`;

export const useNotes = () => {
  const [templates] = useState(TEMPLATES);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [selectedNoteId, setSelectedNoteId] = useState(INITIAL_NOTES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const selectedNote = useMemo(() => {
    return notes.find((note) => note.id === selectedNoteId) ?? notes[0];
  }, [notes, selectedNoteId]);

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return notes;
    return notes.filter((note) =>
      note.sessionTitle.toLowerCase().includes(query) ||
      note.mentorName.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [notes, searchQuery]);

  /** Persist note to backend tied to its sessionId. Falls back silently on error. */
  const saveNoteToBackend = useCallback(async (note: LearnerNote) => {
    setIsSaving(true);
    try {
      await api.put(`/sessions/${note.sessionId}/notes/${note.id}`, {
        content: note.content,
        sharedWithMentor: note.sharedWithMentor,
        sharedWithLearner: note.sharedWithLearner,
        resourceLinks: note.resourceLinks,
        reminder: note.reminder,
      });
    } catch {
      // Non-blocking — local state is source of truth during dev
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateSelectedNote = useCallback((content: string) => {
    setNotes((current) =>
      current.map((note) => {
        if (note.id !== selectedNoteId) return note;
        const updated: LearnerNote = {
          ...note,
          content,
          updatedAt: new Date().toISOString(),
          versions: [
            { id: `version-${Date.now()}`, savedAt: new Date().toISOString(), content: note.content },
            ...note.versions,
          ].slice(0, 5),
        };
        saveNoteToBackend(updated);
        return updated;
      })
    );
  }, [selectedNoteId, saveNoteToBackend]);

  const applyTemplate = useCallback((templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    updateSelectedNote(template.content);
  }, [templates, updateSelectedNote]);

  const toggleShareWithMentor = useCallback(() => {
    setNotes((current) =>
      current.map((note) => {
        if (note.id !== selectedNoteId) return note;
        const updated = { ...note, sharedWithMentor: !note.sharedWithMentor };
        saveNoteToBackend(updated);
        return updated;
      })
    );
  }, [selectedNoteId, saveNoteToBackend]);

  /** Mentor shares their note with the learner post-session. */
  const shareNoteWithLearner = useCallback(() => {
    setNotes((current) =>
      current.map((note) => {
        if (note.id !== selectedNoteId) return note;
        const updated = { ...note, sharedWithLearner: !note.sharedWithLearner };
        saveNoteToBackend(updated);
        return updated;
      })
    );
  }, [selectedNoteId, saveNoteToBackend]);

  const setReminder = useCallback((reminder: string) => {
    setNotes((current) =>
      current.map((note) => (note.id === selectedNoteId ? { ...note, reminder } : note))
    );
  }, [selectedNoteId]);

  const addAttachments = useCallback((files: FileList | File[]) => {
    const nextAttachments = Array.from(files).map((file, index) => ({
      id: `attachment-${Date.now()}-${index}`,
      name: file.name,
      sizeLabel: formatSize(file.size),
    }));
    setNotes((current) =>
      current.map((note) =>
        note.id === selectedNoteId
          ? { ...note, attachments: [...nextAttachments, ...note.attachments] }
          : note
      )
    );
  }, [selectedNoteId]);

  const addResourceLink = useCallback((title: string, url: string) => {
    const newLink: ResourceLink = { id: `rl-${Date.now()}`, title, url };
    setNotes((current) =>
      current.map((note) => {
        if (note.id !== selectedNoteId) return note;
        const updated = { ...note, resourceLinks: [...note.resourceLinks, newLink] };
        saveNoteToBackend(updated);
        return updated;
      })
    );
  }, [selectedNoteId, saveNoteToBackend]);

  const removeResourceLink = useCallback((linkId: string) => {
    setNotes((current) =>
      current.map((note) => {
        if (note.id !== selectedNoteId) return note;
        const updated = { ...note, resourceLinks: note.resourceLinks.filter((l) => l.id !== linkId) };
        saveNoteToBackend(updated);
        return updated;
      })
    );
  }, [selectedNoteId, saveNoteToBackend]);

  const addResourceBookmark = useCallback((title: string, url: string, tags: string[]) => {
    setResources((current) => [
      { id: `resource-${Date.now()}`, title, url, tags },
      ...current,
    ]);
  }, []);

  const exportSelectedNote = useCallback((format: 'pdf' | 'markdown') => {
    if (!selectedNote) return;
    const filename = selectedNote.sessionTitle.replace(/\s+/g, '-').toLowerCase();
    downloadNote(selectedNote.content, filename, format);
  }, [selectedNote]);

  return {
    templates,
    notes,
    filteredNotes,
    selectedNote,
    resources,
    searchQuery,
    isSaving,
    setSearchQuery,
    setSelectedNoteId,
    updateSelectedNote,
    applyTemplate,
    toggleShareWithMentor,
    shareNoteWithLearner,
    setReminder,
    addAttachments,
    addResourceLink,
    removeResourceLink,
    addResourceBookmark,
    exportSelectedNote,
  };
};
